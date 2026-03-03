-- Activer RLS sur toutes les tables
ALTER TABLE public.trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmarks ENABLE ROW LEVEL SECURITY;

-- TRENDS : lecture publique, écriture limitée au propriétaire
CREATE POLICY "trends_read_all" ON public.trends FOR SELECT USING (true);
CREATE POLICY "trends_insert_auth" ON public.trends FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "trends_update_own" ON public.trends FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "trends_delete_own" ON public.trends FOR DELETE USING (auth.uid() = user_id);

-- ARTICLES : lecture publique pour les publiés, CRUD limité au propriétaire
CREATE POLICY "articles_read_published" ON public.articles FOR SELECT USING (is_published = true OR auth.uid() = user_id);
CREATE POLICY "articles_insert_auth" ON public.articles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "articles_update_own" ON public.articles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "articles_delete_own" ON public.articles FOR DELETE USING (auth.uid() = user_id);

-- QUIZ_RESULTS : insertion publique (anonyme), lecture auth seulement
CREATE POLICY "quiz_insert_anon" ON public.quiz_results FOR INSERT WITH CHECK (true);
CREATE POLICY "quiz_read_auth" ON public.quiz_results FOR SELECT USING (auth.role() = 'authenticated');

-- BENCHMARKS : auth seulement
CREATE POLICY "benchmarks_all_auth" ON public.benchmarks FOR ALL USING (auth.role() = 'authenticated');
