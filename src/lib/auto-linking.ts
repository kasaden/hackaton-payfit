import { createServiceClient } from '@/lib/supabase/server'

interface LinkableArticle {
  slug: string
  title: string
  keyword_primary: string
  keywords_secondary: string[]
}

interface AutoLink {
  keyword: string
  slug: string
  title: string
}

/**
 * Normalise un texte pour le matching (minuscules, sans accents).
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Récupère tous les articles publiés (sauf l'article courant)
 * avec leurs mots-clés pour l'auto-linking.
 */
async function getArticlesForAutoLinking(excludeSlug: string): Promise<LinkableArticle[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('articles')
    .select('slug, title, keyword_primary, keywords_secondary')
    .eq('is_published', true)
    .neq('slug', excludeSlug)
    .order('published_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Failed to fetch articles for auto-linking:', error)
    return []
  }

  return (data || []).filter((a) => a.slug && a.keyword_primary)
}

/**
 * Calcule la similarité entre deux slugs (Jaccard sur les segments).
 * Retourne un score entre 0 et 1.
 */
function slugSimilarity(slug1: string, slug2: string): number {
  const segments1 = new Set(slug1.split('-').filter(s => s.length > 2))
  const segments2 = new Set(slug2.split('-').filter(s => s.length > 2))
  if (segments1.size === 0 || segments2.size === 0) return 0

  let intersection = 0
  for (const s of segments1) {
    if (segments2.has(s)) intersection++
  }

  const union = new Set([...segments1, ...segments2]).size
  return union > 0 ? intersection / union : 0
}

/**
 * Valide tous les liens internes dans le markdown.
 * - Liens vers des slugs exacts → conservés
 * - Liens vers des URLs externes PayFit → supprimés (l'IA confond le site principal avec le blog)
 * - Liens vers des slugs approximatifs (IA) → corrigés si forte similarité (>= 60%)
 * - Liens sans correspondance → texte ancre conservé, lien supprimé
 */
function sanitizeBrokenLinks(content: string, validSlugs: Set<string>, allArticles: LinkableArticle[]): string {
  // 1. Nettoyer les liens vers le site PayFit (payfit.com, payfit.fr, etc.)
  // L'IA génère parfois des liens vers payfit.com au lieu de /articles/slug
  let result = content.replace(
    /\[([^\]]+)\]\(https?:\/\/(?:www\.)?payfit\.[a-z]+[^)]*\)/g,
    '$1'
  )

  // 2. Valider les liens /articles/slug
  result = result.replace(
    /\[([^\]]+)\]\(\/articles\/([^)]+)\)/g,
    (fullMatch, anchorText, slug) => {
      // Slug exact → on garde
      if (validSlugs.has(slug)) {
        return fullMatch
      }

      // Fuzzy match : chercher le slug publié le plus proche
      let bestMatch = ''
      let bestScore = 0
      for (const article of allArticles) {
        const score = slugSimilarity(slug, article.slug)
        if (score > bestScore) {
          bestScore = score
          bestMatch = article.slug
        }
      }

      // Seuil élevé (60%) pour éviter les faux positifs de redirection
      if (bestScore >= 0.6 && bestMatch) {
        return `[${anchorText}](/articles/${bestMatch})`
      }

      // Aucun match fiable → on garde juste le texte ancre (pas de 404)
      return anchorText
    }
  )

  return result
}

/**
 * Génère des sous-phrases à partir d'un mot-clé pour le matching partiel.
 * Ex: "bulletin de paie 2026" → ["bulletin de paie", "paie 2026"]
 * Ex: "congés payés" → ["congés payés"] (déjà court, pas de sous-phrases)
 */
function generateSubPhrases(keyword: string): string[] {
  const words = keyword.split(/\s+/).filter(w => w.length >= 2)
  if (words.length <= 2) return [] // Pas de sous-phrases pour les keywords courts

  const stopWords = new Set(['de', 'du', 'la', 'le', 'les', 'des', 'un', 'une', 'en', 'et', 'au', 'aux'])
  const phrases: string[] = []

  // Sous-phrases de longueur décroissante (min 2 mots, min 8 chars)
  for (let len = words.length - 1; len >= 2; len--) {
    for (let start = 0; start <= words.length - len; start++) {
      const subPhrase = words.slice(start, start + len).join(' ')
      // Vérifier qu'il y a au moins 2 mots significatifs (pas juste des stop words)
      const significantCount = words.slice(start, start + len)
        .filter(w => !stopWords.has(w.toLowerCase()) && w.length >= 3).length
      if (subPhrase.length >= 8 && significantCount >= 2) {
        phrases.push(subPhrase)
      }
    }
  }

  return phrases
}

/**
 * Construit la liste des mots-clés à chercher dans le texte.
 * Chaque mot-clé est associé à un article cible.
 * Sources de matching (par priorité) :
 * 1. keyword_primary complet
 * 2. Titre de l'article (mots significatifs)
 * 3. keywords_secondary
 */
function buildAutoLinkMap(articles: LinkableArticle[]): AutoLink[] {
  const links: AutoLink[] = []

  // 1. keyword_primary complet
  for (const article of articles) {
    if (article.keyword_primary && article.keyword_primary.length >= 4) {
      links.push({
        keyword: article.keyword_primary,
        slug: article.slug,
        title: article.title,
      })
    }
  }

  // 2. Titres : extraire les groupes de mots significatifs (>= 3 mots, >= 10 chars)
  const stopWords = new Set(['les', 'des', 'une', 'pour', 'par', 'sur', 'dans', 'avec', 'est', 'sont', 'qui', 'que', 'aux', 'ces', 'tout', 'vous', 'votre', 'vos'])
  for (const article of articles) {
    const titleWords = article.title
      .replace(/[:\-–—|]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 3 && !stopWords.has(w.toLowerCase()))

    // Prendre les 2-3 premiers mots significatifs comme ancre potentielle
    if (titleWords.length >= 2) {
      const titleAnchor = titleWords.slice(0, 3).join(' ')
      if (titleAnchor.length >= 8) {
        links.push({
          keyword: titleAnchor,
          slug: article.slug,
          title: article.title,
        })
      }
    }
  }

  // 3. keywords_secondary
  for (const article of articles) {
    if (!article.keywords_secondary) continue
    for (const kw of article.keywords_secondary) {
      if (kw && kw.length >= 5) {
        links.push({
          keyword: kw,
          slug: article.slug,
          title: article.title,
        })
      }
    }
  }

  // Dédupliquer par slug : garder les keywords les plus longs en premier
  links.sort((a, b) => b.keyword.length - a.keyword.length)

  return links
}

/**
 * Tente de lier un mot-clé dans une ligne de texte.
 * Vérifie les limites de mots et retourne la ligne modifiée si match trouvé.
 */
function tryLinkKeywordInLine(
  line: string,
  keyword: string,
  slug: string
): { modified: string; linked: boolean } {
  const normalizedLine = normalize(line)
  const normalizedKeyword = normalize(keyword)

  // Quick check
  if (normalizedKeyword.length < 4) return { modified: line, linked: false }

  const keywordIndex = normalizedLine.indexOf(normalizedKeyword)
  if (keywordIndex === -1) return { modified: line, linked: false }

  // Vérifier les limites de mots
  const charBefore = keywordIndex > 0 ? normalizedLine[keywordIndex - 1] : ' '
  const charAfter = keywordIndex + normalizedKeyword.length < normalizedLine.length
    ? normalizedLine[keywordIndex + normalizedKeyword.length]
    : ' '

  const wordBoundary = /[\s,.:;!?()'"«»\-–—/]/
  if (!wordBoundary.test(charBefore) && charBefore !== ' ') return { modified: line, linked: false }
  if (!wordBoundary.test(charAfter) && charAfter !== ' ') return { modified: line, linked: false }

  // Extraire le texte original (casse d'origine) pour l'ancre
  const originalKeyword = line.substring(keywordIndex, keywordIndex + keyword.length)

  // Remplacer la première occurrence
  const before = line.substring(0, keywordIndex)
  const after = line.substring(keywordIndex + keyword.length)

  return {
    modified: `${before}[${originalKeyword}](/articles/${slug})${after}`,
    linked: true,
  }
}

/**
 * Vérifie si une ligne est éligible pour recevoir un auto-lien.
 */
function isLineEligible(line: string, lineIndex: number, faqStartIndex: number): boolean {
  const trimmed = line.trim()
  // Skip titres
  if (trimmed.startsWith('#')) return false
  // Skip FAQ
  if (lineIndex >= faqStartIndex) return false
  // Skip lignes vides ou trop courtes
  if (trimmed.length < 20) return false
  // Skip lignes qui contiennent déjà un lien markdown
  if (/\[.*?\]\(.*?\)/.test(line)) return false
  // Skip citations et images (mais PAS les listes)
  if (trimmed.startsWith('>') || trimmed.startsWith('!')) return false
  // Pour les listes : autoriser seulement les items longs (contenu riche)
  if ((trimmed.startsWith('- ') || trimmed.startsWith('* ')) && trimmed.length < 50) return false
  return true
}

/**
 * Applique l'auto-linking sur le contenu markdown d'un article.
 *
 * Étapes :
 * 1. Valider/corriger les liens existants (supprimer liens cassés, fixer les proches)
 * 2. Passe 1 : Matching exact de mots-clés complets dans le texte
 * 3. Passe 2 : Matching flexible par sous-phrases (sans ajout de texte artificiel)
 *
 * Règles :
 * - Max 5 auto-liens par article
 * - Max 1 lien par article cible
 * - Pas de liens dans les titres (H1, H2, H3)
 * - Pas de liens dans les lignes qui contiennent déjà un lien markdown
 * - Pas de liens dans la FAQ
 * - Pas de liens dans les listes ni les citations
 * - Première occurrence seulement
 */
export async function applyAutoLinking(
  contentMarkdown: string,
  currentSlug: string
): Promise<string> {
  const articles = await getArticlesForAutoLinking(currentSlug)

  // Étape 1 : Nettoyer/corriger les liens cassés (slugs inventés par l'IA, liens PayFit)
  const validSlugs = new Set(articles.map((a) => a.slug))
  const cleanedMarkdown = sanitizeBrokenLinks(contentMarkdown, validSlugs, articles)

  if (articles.length === 0) return cleanedMarkdown

  const autoLinks = buildAutoLinkMap(articles)
  if (autoLinks.length === 0) return cleanedMarkdown

  const lines = cleanedMarkdown.split('\n')
  let totalLinksAdded = 0
  const linkedSlugs = new Set<string>()
  const MAX_AUTO_LINKS = 5

  // Détecter où commence la FAQ pour ne pas y mettre de liens
  let faqStartIndex = lines.length
  for (let i = 0; i < lines.length; i++) {
    if (/^##\s*(FAQ|Questions fréquentes)/i.test(lines[i])) {
      faqStartIndex = i
      break
    }
  }

  // Détecter les liens déjà présents (validés) pour ne pas doubler
  const existingLinkedSlugs = new Set<string>()
  const linkRegex = /\]\(\/articles\/([^)]+)\)/g
  let linkMatch
  while ((linkMatch = linkRegex.exec(cleanedMarkdown)) !== null) {
    existingLinkedSlugs.add(linkMatch[1])
  }

  // --- PASSE 1 : Matching exact de mots-clés complets dans le texte ---
  for (let i = 0; i < lines.length && totalLinksAdded < MAX_AUTO_LINKS; i++) {
    if (!isLineEligible(lines[i], i, faqStartIndex)) continue

    for (const autoLink of autoLinks) {
      if (totalLinksAdded >= MAX_AUTO_LINKS) break
      if (linkedSlugs.has(autoLink.slug)) continue
      if (existingLinkedSlugs.has(autoLink.slug)) {
        linkedSlugs.add(autoLink.slug)
        continue
      }

      const result = tryLinkKeywordInLine(lines[i], autoLink.keyword, autoLink.slug)
      if (result.linked) {
        lines[i] = result.modified
        linkedSlugs.add(autoLink.slug)
        totalLinksAdded++
        break // Un seul lien par ligne
      }
    }
  }

  // --- PASSE 2 : Matching flexible par sous-phrases ---
  // Pour chaque article non encore lié, on génère des sous-phrases du keyword_primary
  // et on cherche ces sous-phrases dans le texte.
  // PAS d'ajout de texte artificiel ("consultez notre article...").
  if (totalLinksAdded + existingLinkedSlugs.size < MAX_AUTO_LINKS) {
    const unlinkedArticles = articles.filter(
      (a) => !linkedSlugs.has(a.slug) && !existingLinkedSlugs.has(a.slug)
    )

    for (const article of unlinkedArticles) {
      if (totalLinksAdded >= MAX_AUTO_LINKS) break

      // Générer des sous-phrases du keyword_primary
      const subPhrases = generateSubPhrases(article.keyword_primary)
      if (subPhrases.length === 0) continue

      let matched = false
      for (let i = 0; i < lines.length && !matched; i++) {
        if (!isLineEligible(lines[i], i, faqStartIndex)) continue

        for (const subPhrase of subPhrases) {
          const result = tryLinkKeywordInLine(lines[i], subPhrase, article.slug)
          if (result.linked) {
            lines[i] = result.modified
            linkedSlugs.add(article.slug)
            totalLinksAdded++
            matched = true
            break
          }
        }
      }
    }
  }

  return lines.join('\n')
}
