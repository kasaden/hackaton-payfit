-- ============================================
-- TABLE: trends (questions émergentes détectées)
-- ============================================
CREATE TABLE public.trends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  source TEXT, -- ex: "Légifrance", "PAA Google", "Forum RH"
  signal TEXT, -- description du signal faible
  score_novelty INTEGER CHECK (score_novelty BETWEEN 1 AND 5),
  score_payfit_relevance INTEGER CHECK (score_payfit_relevance BETWEEN 1 AND 5),
  score_volume INTEGER CHECK (score_volume BETWEEN 1 AND 5),
  score_total NUMERIC GENERATED ALWAYS AS (
    (score_novelty + score_payfit_relevance + score_volume)::NUMERIC / 3
  ) STORED,
  icp_target TEXT, -- "ICP 1", "ICP 2", "ICP 1+2"
  suggested_format TEXT, -- "Article + FAQ", "Article + calculateur", etc.
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'article_generated', 'published')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: articles (articles SEO générés)
-- ============================================
CREATE TABLE public.articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trend_id UUID REFERENCES public.trends(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  meta_description TEXT,
  keyword_primary TEXT,
  keywords_secondary TEXT[], -- array de mots-clés
  content_markdown TEXT NOT NULL, -- contenu en markdown
  content_html TEXT, -- version HTML pour le rendu public
  word_count INTEGER,
  compliance_status TEXT DEFAULT 'pending' CHECK (compliance_status IN ('pending', 'verified', 'needs_review')),
  compliance_notes JSONB DEFAULT '[]'::JSONB, -- grille compliance
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: quiz_results (résultats du quiz public)
-- ============================================
CREATE TABLE public.quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  answers JSONB NOT NULL, -- { "q1": "a", "q2": "b", ... }
  score INTEGER NOT NULL, -- score sur 100
  lead_category TEXT NOT NULL CHECK (lead_category IN ('hot', 'warm', 'cold')),
  pain_points TEXT[], -- problèmes identifiés
  company_size TEXT, -- "1-9", "10-19", "20-49", "50+"
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: benchmarks (données concurrentielles)
-- ============================================
CREATE TABLE public.benchmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor TEXT NOT NULL, -- "Factorial", "Lucca", "Cegid"
  keyword TEXT NOT NULL,
  position INTEGER, -- position Google estimée
  url TEXT,
  content_type TEXT, -- "article", "page_produit", "guide", "simulateur"
  notes TEXT,
  checked_at TIMESTAMPTZ DEFAULT now()
);
