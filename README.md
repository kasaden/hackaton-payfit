# PayFit SEO Copilot

> Copilote IA pour dominer le SEO paie/RH en France. Detection de tendances, generation d'articles SEO, quiz de conformite, veille concurrentielle -- le tout automatise.

**Hackathon Eugenia School 2026**

## Stack technique

| Couche | Technologie |
|--------|------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui, Lucide icons |
| Charts | Recharts |
| Base de donnees | Supabase (PostgreSQL + Auth + RLS) |
| IA | OpenAI GPT-4o-mini |
| Automatisation | N8N Cloud (3 workflows) |
| Deploiement | Vercel |

---

## Fonctionnalites

### 1. Quiz de conformite paie (public)

Un quiz interactif de 12 questions sur les changements reglementaires 2026 (SMIC, RGDU, transparence salariale, conges, DSN...).

- **Scoring** : 0-100 avec categorisation leads (hot/warm/cold)
- **Pain points** : 20 problematiques detectees automatiquement
- **Segmentation** : par taille d'entreprise (ICP 1 = TPE 1-9, ICP 2 = PME 10-50)
- **Aucune inscription requise** -- lead magnet gratuit
- **Page resultats** : jauge circulaire SVG, recommandations personnalisees, CTA PayFit

### 2. Detection de tendances IA

Identification des questions emergentes en paie/RH avant qu'elles n'explosent sur Google.

- **Scoring sur 3 axes** : nouveaute (1-5), pertinence PayFit (1-5), volume (1-5)
- **Score composite** automatique (moyenne ponderee)
- **Analyse IA** via GPT-4o-mini : source, signal faible, ICP cible, format suggere
- **Statuts** : new -> in_progress -> article_generated -> published
- **Rate limit** : 30 scorings/heure/utilisateur

### 3. Generation d'articles SEO

Moteur de creation de contenu optimise SEO et GEO (Generative Engine Optimization).

- **Prompt templates editables** : 3 templates precharges (standard 800-1200 mots, flash 400 mots, auto-trend)
- **Variables dynamiques** : `{{keyword_primary}}`, `{{keywords_secondary}}`, `{{icp_target}}`, `{{signal}}`, `{{source}}`
- **Detection de doublons** avant generation (similarite Jaccard sur titre + mots-cles + contenu)
- **Compliance review** : grille de conformite integree, statuts pending/verified/needs_review
- **Auto-slug** + meta description + word count calcules automatiquement
- **Mode regeneration** : re-generer un article existant en conservant l'ID
- **Rate limit** : 10 generations/heure/utilisateur

### 4. Pages articles publiques

Chaque article genere dispose d'une page publique optimisee SEO.

- **Sommaire sticky** : navigation par ancres H2 (colonne gauche desktop)
- **Contenu intercale** : les blocs Trustpilot, carousel features, articles lies et CTA sont disperses entre les sections H2 au lieu d'etre empiles en bas -- meilleur engagement et SEO
- **Articles similaires** : composant server-side qui score les articles candidats sur 4 signaux :
  - Meme `trend_id` (30 pts)
  - Similarite des mots-cles tokenises (40 pts, Jaccard)
  - Similarite des titres (15 pts)
  - Meme `icp_target` via join trends (15 pts)
- **Metadata dynamique** : `generateMetadata` avec title, description, canonical, OpenGraph (type article, publishedTime, authors), Twitter Card
- **JSON-LD Structured Data** : schemas Article, BreadcrumbList, Organization
- **Responsive** : sommaire masque sur mobile, grille adaptative

### 5. Veille concurrentielle automatisee

Surveillance des concurrents (Factorial, Lucca, Cegid, Sage) toutes les 12h.

- **Content gaps** : sujets mal couverts par les concurrents = opportunites
- **Menaces SEO** : sujets ou les concurrents sont forts
- **3 vues dashboard** : overview, content gaps detailles, menaces & positions
- **Auto-creation de trends** a partir des gaps a haute priorite

### 6. Benchmark concurrentiel

Tableau de suivi des positions Google des concurrents.

- **Filtrage par concurrent** : Factorial, Lucca, Cegid, Sage
- **Donnees trackees** : keyword, position estimee, URL, type de contenu
- **13 benchmarks pre-charges** couvrant les keywords strategiques

### 7. Dashboard analytics

- **KPIs** : nombre de trends, articles, articles publies, reponses quiz, leads hot
- **Graphique ligne** : reponses quiz sur 14 jours
- **Graphique camembert** : repartition leads hot/warm/cold
- **Quiz analytics** : distribution des scores, frequence des pain points, drill-down par segment

### 8. Page de presentation

Page interne documentant l'architecture de la solution :
- 3 problemes adresses
- 3 piliers (veille IA, moteur de contenu, quiz)
- Stack technique visuelle
- Pipeline d'automatisation (detection -> scoring -> generation -> publication)

---

## Automatisation N8N

3 workflows orchestres depuis N8N Cloud.

### Workflow 1 : Veille optimisee (toutes les 6h)

5 sources scrapees en parallele :

| Source | Signal |
|--------|--------|
| Legifrance JO RSS | Decrets, arretes, lois |
| BOFIP RSS | Doctrine fiscale, cotisations |
| URSSAF RSS | Actualites cotisations |
| OpenAI PAA | 15 questions emergentes |
| OpenAI Content Gap | Sujets non couverts |

- Fusion multi-source + deduplication Jaccard (seuil 0.6)
- Scoring V2 sur 4 criteres (novelty, relevance, volume, timing)
- **Auto-trigger** du Workflow 2 si score >= 4

### Workflow 2 : Trend -> Article SEO

- Declenchement : webhook, manuel, ou auto-trigger
- OpenAI genere un brief SEO puis l'article (~1000 mots)
- Article draft insere en base, visible dans le dashboard
- **Temps signal -> article draft : < 30 minutes**

### Workflow 3 : Veille concurrentielle (toutes les 12h)

- Scrape les blogs RSS de Factorial, Lucca, Cegid, Sage
- Analyse IA de la strategie contenu
- Content gaps -> table benchmarks + trends haute priorite

**Cout estime** : ~$7.20/mois (GPT-4o-mini)

> Voir [n8n/SETUP.md](n8n/SETUP.md) pour la configuration complete des workflows.

---

## Optimisations SEO & GEO

| Feature | Statut |
|---------|--------|
| `generateMetadata` dynamique par article | Fait |
| JSON-LD Article + BreadcrumbList + Organization | Fait |
| Canonical URLs | Fait |
| OpenGraph type article + publishedTime | Fait |
| Twitter Cards | Fait |
| Maillage interne (articles similaires) | Fait |
| Contenu intercale (blocs dans le texte) | Fait |
| FAQ schema sur la homepage | Fait |
| Similarite/doublons avant generation | Fait |
| Sitemap dynamique | A faire |
| robots.txt | A faire |
| Liens contextuels dans la generation IA | A faire |

---

## Schema base de donnees

5 tables PostgreSQL avec Row Level Security :

| Table | Description |
|-------|------------|
| `trends` | Questions emergentes detectees + scores IA |
| `articles` | Articles SEO generes (markdown, mots-cles, compliance) |
| `quiz_results` | Reponses au quiz (anonyme, public insert) |
| `benchmarks` | Positions concurrents + content gaps |
| `prompt_templates` | Templates de prompts editables |

**RLS** :
- Articles publies : lecture publique. Brouillons : auteur ou connecte
- Trends : lecture publique, ecriture auteur
- Quiz : insertion publique, lecture connecte
- Benchmarks & prompts : connecte uniquement

---

## API Routes

| Endpoint | Auth | Rate Limit | Description |
|----------|------|-----------|-------------|
| `POST /api/quiz` | Non | - | Sauvegarder une reponse quiz |
| `POST /api/score-trend` | Oui | 30/h | Scorer une tendance via IA |
| `POST /api/generate-article` | Oui | 10/h | Generer un article SEO |
| `POST /api/check-duplicates` | Oui | - | Detecter les doublons (seuil 25%) |
| `POST /api/auto-generate-from-trend` | Oui | - | Generation auto depuis une trend |
| `POST /api/webhook-n8n` | Secret | - | Webhook pour les workflows N8N |

---

## Installation

### Prerequis

- Node.js 20+
- Compte Supabase
- Cle API OpenAI
- (Optionnel) N8N Cloud pour l'automatisation

### 1. Cloner et installer

```bash
git clone https://github.com/votre-repo/hackaton-payfit.git
cd hackaton-payfit
npm install
```

### 2. Configurer l'environnement

```bash
cp .env.example .env.local
```

Remplir les variables :

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key
WEBHOOK_SECRET=your-random-secret
```

### 3. Initialiser la base de donnees

Executer les scripts SQL dans l'ordre dans la console Supabase :

```
supabase/01_tables.sql
supabase/02_rls.sql
supabase/03_seed_trends.sql
supabase/04_seed_benchmarks.sql
supabase/05_add_user_id_and_fix_rls.sql
supabase/06_fix_rls_n8n.sql
supabase/07_prompt_templates.sql
```

### 4. Lancer le serveur

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### 5. (Optionnel) Configurer N8N

Voir [n8n/SETUP.md](n8n/SETUP.md) pour importer et configurer les 3 workflows.

---

## Structure du projet

```
src/
  app/
    page.tsx                    # Landing page publique
    layout.tsx                  # Layout root + metadata globale
    quiz/                       # Quiz de conformite (public)
    articles/[slug]/            # Pages articles (public)
    login/                      # Authentification
    dashboard/                  # Dashboard protege
      articles/                 # Gestion articles
      trends/                   # Detection tendances
      generator/                # Generateur d'articles IA
      prompts/                  # Edition des templates
      benchmark/                # Suivi concurrents
      quiz-analytics/           # Analytics quiz
      veille/                   # Veille concurrentielle
      presentation/             # Presentation interne
    api/                        # API routes
  components/
    ui/                         # Composants shadcn/ui
    article/                    # RelatedArticles, FeaturesCarousel
    dashboard/                  # SimilarityPanel, etc.
  lib/
    supabase/                   # Clients Supabase (server, client)
    similarity.ts               # Algorithme de detection doublons
    openai.ts                   # Client OpenAI
    prompts.ts                  # Gestion templates
    csrf.ts                     # Protection CSRF
    rate-limit.ts               # Rate limiting in-memory
  data/
    quiz-questions.ts           # 12 questions + pain points
  middleware.ts                 # Auth guard pour /dashboard/*
supabase/
  01_tables.sql → 07_prompt_templates.sql  # Schema + seeds
n8n/
  SETUP.md                      # Guide de configuration N8N
  workflow-1-veille-optimisee.json
  workflow-2-trend-to-article.json
  workflow-3-veille-concurrentielle.json
```

---

## Deploiement

Push sur `main` → deploiement automatique sur Vercel.

Variables d'environnement a configurer dans Vercel :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `WEBHOOK_SECRET`
- `NEXT_PUBLIC_SITE_URL` (URL Vercel du projet)
