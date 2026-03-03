-- ============================================
-- MIGRATION: Rendre les données N8N visibles et gérables
-- Les données insérées par N8N (user_id IS NULL) doivent être
-- visibles et éditables par tous les utilisateurs authentifiés.
-- ============================================

-- 1. ARTICLES : les drafts N8N (user_id NULL) visibles par tous les auth users
DROP POLICY IF EXISTS "articles_read_published" ON public.articles;
CREATE POLICY "articles_read_published"
  ON public.articles FOR SELECT
  USING (
    is_published = true
    OR auth.uid() = user_id
    OR (user_id IS NULL AND auth.role() = 'authenticated')
  );

-- Articles N8N éditables par tous les auth users
DROP POLICY IF EXISTS "articles_update_own" ON public.articles;
CREATE POLICY "articles_update_own"
  ON public.articles FOR UPDATE
  USING (
    auth.uid() = user_id
    OR (user_id IS NULL AND auth.role() = 'authenticated')
  );

DROP POLICY IF EXISTS "articles_delete_own" ON public.articles;
CREATE POLICY "articles_delete_own"
  ON public.articles FOR DELETE
  USING (
    auth.uid() = user_id
    OR (user_id IS NULL AND auth.role() = 'authenticated')
  );

-- INSERT : autoriser aussi les inserts sans user_id (service role uniquement, pas de changement nécessaire)
-- Le service role bypass RLS, donc les inserts N8N fonctionnent déjà.

-- 2. TRENDS : update/delete possible sur les trends N8N (user_id NULL)
DROP POLICY IF EXISTS "trends_update_own" ON public.trends;
CREATE POLICY "trends_update_own"
  ON public.trends FOR UPDATE
  USING (
    auth.uid() = user_id
    OR (user_id IS NULL AND auth.role() = 'authenticated')
  );

DROP POLICY IF EXISTS "trends_delete_own" ON public.trends;
CREATE POLICY "trends_delete_own"
  ON public.trends FOR DELETE
  USING (
    auth.uid() = user_id
    OR (user_id IS NULL AND auth.role() = 'authenticated')
  );
