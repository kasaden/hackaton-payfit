-- Activer RLS sur toutes les tables
ALTER TABLE public.trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmarks ENABLE ROW LEVEL SECURITY;

-- TRENDS : lecture publique (pour future API), écriture auth seulement
CREATE POLICY "trends_read_all" ON public.trends FOR SELECT USING (true);
CREATE POLICY "trends_write_auth" ON public.trends FOR ALL USING (auth.role() = 'authenticated');

-- ARTICLES : lecture publique pour les publiés, tout pour les auth
CREATE POLICY "articles_read_published" ON public.articles FOR SELECT USING (is_published = true);
CREATE POLICY "articles_all_auth" ON public.articles FOR ALL USING (auth.role() = 'authenticated');

-- QUIZ_RESULTS : insertion publique (anonyme), lecture auth seulement
CREATE POLICY "quiz_insert_anon" ON public.quiz_results FOR INSERT WITH CHECK (true);
CREATE POLICY "quiz_read_auth" ON public.quiz_results FOR SELECT USING (auth.role() = 'authenticated');

-- BENCHMARKS : auth seulement
CREATE POLICY "benchmarks_all_auth" ON public.benchmarks FOR ALL USING (auth.role() = 'authenticated');
