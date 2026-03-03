/**
 * Module de détection de doublons / similarité entre articles.
 *
 * Trois axes de comparaison :
 *  1. Titre        → Jaccard sur les mots normalisés
 *  2. Mots-clés    → Overlap coefficient (intersection / min(|A|,|B|))
 *  3. Contenu      → Jaccard sur les shingles (n-grams de 3 mots)
 *
 * Score composite pondéré → 0..100
 */

// ─── Helpers ────────────────────────────────────────────────

/** Normalise un texte : minuscules, sans accents, sans ponctuation */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Tokenise un texte en mots */
function tokenize(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((w) => w.length > 1);
}

/** Génère des shingles (n-grams de mots) à partir d'un texte */
function shingles(text: string, n: number = 3): Set<string> {
  const words = tokenize(text);
  const result = new Set<string>();
  for (let i = 0; i <= words.length - n; i++) {
    result.add(words.slice(i, i + n).join(" "));
  }
  return result;
}

// ─── Métriques de similarité ────────────────────────────────

/** Coefficient de Jaccard entre deux ensembles */
function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/** Coefficient d'overlap : intersection / min(|A|, |B|) */
function overlap(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection++;
  }
  return intersection / Math.min(a.size, b.size);
}

// ─── Scores par axe ────────────────────────────────────────

/** Similarité des titres (Jaccard sur les mots) → 0..1 */
export function titleSimilarity(a: string, b: string): number {
  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));
  return jaccard(setA, setB);
}

/** Similarité des mots-clés (overlap coefficient) → 0..1 */
export function keywordSimilarity(
  kwA: { primary: string; secondary: string[] },
  kwB: { primary: string; secondary: string[] }
): number {
  const allA = new Set([kwA.primary, ...kwA.secondary].map(normalize));
  const allB = new Set([kwB.primary, ...kwB.secondary].map(normalize));
  return overlap(allA, allB);
}

/** Similarité du contenu (Jaccard sur les shingles 3-grams) → 0..1 */
export function contentSimilarity(a: string, b: string): number {
  const shA = shingles(a, 3);
  const shB = shingles(b, 3);
  return jaccard(shA, shB);
}

// ─── Score composite ────────────────────────────────────────

export interface SimilarityResult {
  /** Score global 0..100 */
  score: number;
  /** Détail par axe (0..100 chacun) */
  details: {
    title: number;
    keywords: number;
    content: number;
  };
  /** Label de risque */
  level: "duplicate" | "high" | "medium" | "low" | "unique";
}

const WEIGHTS = {
  title: 0.35,
  keywords: 0.30,
  content: 0.35,
};

/**
 * Calcule un score de similarité composite entre deux articles.
 * Si le contenu n'est pas fourni (ex: avant génération), on
 * se base uniquement sur titre + mots-clés.
 */
export function computeSimilarity(
  articleA: {
    title: string;
    keyword_primary: string;
    keywords_secondary: string[];
    content?: string;
  },
  articleB: {
    title: string;
    keyword_primary: string;
    keywords_secondary: string[];
    content?: string;
  }
): SimilarityResult {
  const titleScore = titleSimilarity(articleA.title, articleB.title);
  const kwScore = keywordSimilarity(
    { primary: articleA.keyword_primary, secondary: articleA.keywords_secondary },
    { primary: articleB.keyword_primary, secondary: articleB.keywords_secondary }
  );

  let contentScore = 0;
  let weights = { ...WEIGHTS };

  if (articleA.content && articleB.content) {
    contentScore = contentSimilarity(articleA.content, articleB.content);
  } else {
    // Pas de contenu → redistribuer le poids
    weights = { title: 0.50, keywords: 0.50, content: 0 };
  }

  const composite =
    weights.title * titleScore +
    weights.keywords * kwScore +
    weights.content * contentScore;

  const score = Math.round(composite * 100);

  let level: SimilarityResult["level"];
  if (score >= 80) level = "duplicate";
  else if (score >= 60) level = "high";
  else if (score >= 40) level = "medium";
  else if (score >= 20) level = "low";
  else level = "unique";

  return {
    score,
    details: {
      title: Math.round(titleScore * 100),
      keywords: Math.round(kwScore * 100),
      content: Math.round(contentScore * 100),
    },
    level,
  };
}

// ─── Vérification contre une liste d'articles ───────────────

export interface DuplicateMatch {
  article_id: string;
  article_title: string;
  article_slug: string;
  similarity: SimilarityResult;
}

/**
 * Compare un article candidat contre une liste d'articles existants.
 * Retourne les articles qui dépassent le seuil de similarité, triés par score décroissant.
 */
export function findDuplicates(
  candidate: {
    title: string;
    keyword_primary: string;
    keywords_secondary: string[];
    content?: string;
  },
  existingArticles: {
    id: string;
    title: string;
    slug: string;
    keyword_primary: string;
    keywords_secondary: string[];
    content_markdown?: string;
  }[],
  options: { threshold?: number; excludeId?: string } = {}
): DuplicateMatch[] {
  const { threshold = 20, excludeId } = options;

  const matches: DuplicateMatch[] = [];

  for (const existing of existingArticles) {
    if (excludeId && existing.id === excludeId) continue;

    const similarity = computeSimilarity(candidate, {
      title: existing.title,
      keyword_primary: existing.keyword_primary,
      keywords_secondary: existing.keywords_secondary,
      content: existing.content_markdown,
    });

    if (similarity.score >= threshold) {
      matches.push({
        article_id: existing.id,
        article_title: existing.title,
        article_slug: existing.slug,
        similarity,
      });
    }
  }

  return matches.sort((a, b) => b.similarity.score - a.similarity.score);
}
