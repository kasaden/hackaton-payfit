-- ============================================
-- AUDIT : Articles à mettre en point de vigilance
-- Exécuter dans le SQL Editor Supabase
-- ============================================

SELECT
  id,
  title,
  slug,
  keyword_primary,
  is_published,
  compliance_status,
  word_count,
  published_at,
  created_at,

  -- CHECKS DE VIGILANCE
  CASE WHEN length(meta_description) > 160 OR meta_description IS NULL OR meta_description = ''
    THEN '⚠️ Meta description manquante ou > 160 chars'
    ELSE '✅'
  END AS check_meta_description,

  CASE WHEN word_count < 400
    THEN '⚠️ Article trop court (< 400 mots)'
    WHEN word_count > 2000
    THEN '⚠️ Article trop long (> 2000 mots)'
    ELSE '✅'
  END AS check_word_count,

  CASE WHEN keyword_primary IS NULL OR keyword_primary = ''
    THEN '⚠️ Pas de mot-clé principal'
    ELSE '✅'
  END AS check_keyword,

  CASE WHEN keywords_secondary IS NULL OR array_length(keywords_secondary, 1) IS NULL
    THEN '⚠️ Pas de mots-clés secondaires'
    ELSE '✅'
  END AS check_keywords_secondary,

  CASE WHEN content_markdown NOT LIKE '%## %'
    THEN '⚠️ Pas de H2 (structure SEO manquante)'
    ELSE '✅'
  END AS check_h2_structure,

  CASE WHEN content_markdown NOT ILIKE '%FAQ%' AND content_markdown NOT ILIKE '%questions fréquentes%'
    THEN '⚠️ Pas de section FAQ (PAA Google)'
    ELSE '✅'
  END AS check_faq,

  CASE WHEN content_markdown NOT ILIKE '%code du travail%'
    AND content_markdown NOT ILIKE '%article L.%'
    AND content_markdown NOT ILIKE '%article R.%'
    AND content_markdown NOT ILIKE '%article D.%'
    AND content_markdown NOT ILIKE '%URSSAF%'
    AND content_markdown NOT ILIKE '%décret%'
    AND content_markdown NOT ILIKE '%directive%'
    THEN '⚠️ Aucune source légale citée (compliance)'
    ELSE '✅'
  END AS check_sources_legales,

  CASE WHEN content_markdown NOT LIKE '%](/articles/%'
    THEN '⚠️ Pas de liens internes (netlinking)'
    ELSE '✅'
  END AS check_netlinking,

  CASE WHEN content_markdown NOT ILIKE '%PayFit%'
    THEN '⚠️ PayFit non mentionné'
    ELSE '✅'
  END AS check_payfit_mention,

  CASE WHEN content_markdown ILIKE '%PayFit propose%'
    OR content_markdown ILIKE '%PayFit offre%'
    OR content_markdown ILIKE '%PayFit permet%'
    THEN '⚠️ Tone of voice : "propose/offre/permet" → préférer "accompagne"'
    ELSE '✅'
  END AS check_tone_of_voice,

  CASE WHEN content_markdown NOT ILIKE '%2026%' AND content_markdown NOT ILIKE '%2025%'
    THEN '⚠️ Pas de référence temporelle (année)'
    ELSE '✅'
  END AS check_temporalite,

  CASE WHEN compliance_status = 'needs_review' OR compliance_status = 'pending'
    THEN '⚠️ Compliance non vérifiée'
    ELSE '✅'
  END AS check_compliance_status

FROM public.articles
ORDER BY
  -- Les articles publiés en priorité, puis par date
  is_published DESC,
  created_at DESC;
