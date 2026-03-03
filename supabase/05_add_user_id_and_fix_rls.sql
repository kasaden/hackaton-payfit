-- ============================================
-- MIGRATION: Ajouter user_id aux articles et trends
-- + Resserrer les politiques RLS
-- ============================================

-- 1. Ajouter la colonne user_id aux tables
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.trends ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Supprimer les anciennes politiques trop permissives
DROP POLICY IF EXISTS "trends_read_all" ON public.trends;
DROP POLICY IF EXISTS "trends_write_auth" ON public.trends;
DROP POLICY IF EXISTS "articles_read_published" ON public.articles;
DROP POLICY IF EXISTS "articles_all_auth" ON public.articles;

-- 3. TRENDS : lecture publique, écriture limitée au propriétaire
CREATE POLICY "trends_read_all"
  ON public.trends FOR SELECT
  USING (true);

CREATE POLICY "trends_insert_auth"
  ON public.trends FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trends_update_own"
  ON public.trends FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "trends_delete_own"
  ON public.trends FOR DELETE
  USING (auth.uid() = user_id);

-- 4. ARTICLES : lecture publique pour les publiés, CRUD limité au propriétaire
CREATE POLICY "articles_read_published"
  ON public.articles FOR SELECT
  USING (is_published = true OR auth.uid() = user_id);

CREATE POLICY "articles_insert_auth"
  ON public.articles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "articles_update_own"
  ON public.articles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "articles_delete_own"
  ON public.articles FOR DELETE
  USING (auth.uid() = user_id);
