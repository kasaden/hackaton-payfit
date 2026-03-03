# N8N Workflows - PayFit SEO Copilot

## Architecture Globale

```
┌─────────────────────────────────────────────────────────────────────┐
│          WORKFLOW 1 V2 : Veille Optimisée (toutes les 6h)           │
│                                                                      │
│  Schedule (6h)                                                       │
│       │                                                              │
│       ├──→ Légifrance JO RSS ──→ Parser XML ──→ Filtrer paie/RH    │
│       ├──→ BOFIP RSS (Impôts) ──→ Parser ──→ Filtrer cotisations   │
│       ├──→ URSSAF RSS ──→ Parser ──→ Tout pertinent                │
│       ├──→ OpenAI PAA Avancées (15 questions) ──→ Parser JSON      │
│       └──→ OpenAI Content Gap Analysis ──→ Parser JSON              │
│                                                   │                  │
│                                    Fusion Multi-Source & Dédup       │
│                                    (Jaccard similarity > 0.6)        │
│                                                   │                  │
│                                    Pour chaque question :            │
│                                    OpenAI Score V2 (4 critères)      │
│                                    + score_timing (urgence)          │
│                                                   │                  │
│                                    POST /api/webhook-n8n             │
│                                    → Insert table `trends`           │
│                                                   │                  │
│                                    ┌──── Score ≥ 4 ? ────┐          │
│                                    │ OUI                  │ NON      │
│                                    ▼                      ▼          │
│                            AUTO-TRIGGER           Trend sauvegardée  │
│                            Workflow 2             pour review manuelle│
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│              WORKFLOW 2 : Trend → Article SEO (inchangé)             │
│                                                                      │
│  Webhook / Manuel / Auto-Trigger                                     │
│       │                                                              │
│       └──→ OpenAI : Générer Brief SEO                                │
│                 (keyword, secondaires, angle, outline)                │
│                         │                                            │
│                  POST /api/webhook-n8n                                │
│                  type: "generate_article"                             │
│                         │                                            │
│                  OpenAI génère l'article (~1000 mots)                 │
│                         │                                            │
│                  Insert table `articles` (draft)                      │
│                         │                                            │
│                  Article visible dans le dashboard                    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│       WORKFLOW 3 : Veille Concurrentielle (toutes les 12h)          │
│                                                                      │
│  Schedule (12h)                                                      │
│       │                                                              │
│       └──→ Pour chaque concurrent :                                  │
│            (Factorial, Lucca, Cegid, Sage)                           │
│                 │                                                    │
│                 ├──→ RSS Blog ──→ Parser articles récents            │
│                 │                                                    │
│                 └──→ OpenAI : Analyser stratégie contenu             │
│                      → Identifier content gaps                       │
│                      → Détecter menaces SEO                          │
│                                │                                     │
│                      POST /api/webhook-n8n                           │
│                      → Insert table `benchmarks` (gaps)              │
│                      → Insert table `trends` (opportunités)          │
└─────────────────────────────────────────────────────────────────────┘
```

## Stratégie d'Optimisation — Devancer les Concurrents

### 🎯 Principe : First-Mover SEO Advantage

L'objectif est de **publier du contenu AVANT** que la demande explose sur Google. Voici comment :

### 1. Multi-Source Detection (Workflow 1 V2)

| Source | Fréquence | Type de signal | Avantage compétitif |
|--------|-----------|----------------|---------------------|
| **Légifrance JO** | 6h | Décrets, arrêtés, lois | Réagir le jour-même d'une publication officielle |
| **BOFIP** | 6h | Doctrine fiscale | Anticiper les impacts cotisations/exonérations |
| **URSSAF** | 6h | Actualités cotisations | Source directe pour les obligations employeur |
| **OpenAI PAA** | 6h | Questions émergentes | Détecter les recherches avant qu'elles ne deviennent populaires |
| **Content Gap** | 6h | Analyse concurrentielle | Identifier les sujets que personne ne couvre encore |

### 2. Scoring Enrichi (4 critères au lieu de 3)

| Critère | Poids | Description |
|---------|-------|-------------|
| `score_novelty` | 25% | Changement récent ou imminent ? |
| `score_payfit_relevance` | 30% | Lien direct avec la paie TPE/PME ? |
| `score_volume` | 25% | Combien d'employeurs concernés ? |
| `score_timing` | 20% | **NOUVEAU** — Urgence temporelle (quand va-t-il exploser ?) |

**Bonus timing** : +0.3 si `score_timing ≥ 4` (sujet qui va exploser sous 2 semaines)

### 3. Auto-Trigger Pipeline (Score ≥ 4)

Les trends avec un `score_total ≥ 4` déclenchent **automatiquement** le Workflow 2 pour générer un article draft. Résultat : entre la détection d'un signal et la publication d'un article, il peut s'écouler **moins de 30 minutes**.

### 4. Veille Concurrentielle (Workflow 3)

Surveille les blogs de Factorial, Lucca, Cegid et Sage pour :
- **Content gaps** : sujets qu'ils couvrent mal ou pas du tout → opportunité pour PayFit
- **Menaces** : sujets où ils sont forts → PayFit doit réagir
- Les content gaps à haute priorité créent automatiquement des trends dans le dashboard

## Prérequis

- Compte N8N Cloud (https://n8n.cloud)
- Clé API OpenAI (la même que dans l'app)
- URL de l'app déployée sur Vercel
- WEBHOOK_SECRET (le même que dans `.env.local`)

## Configuration N8N Cloud

### 1. Variables d'environnement N8N

Dans N8N Cloud : **Settings → Variables**, ajouter :

| Variable | Valeur | Description |
|----------|--------|-------------|
| `OPENAI_API_KEY` | `sk-proj-...` | Ta clé API OpenAI |
| `WEBHOOK_SECRET` | (copier depuis `.env.local`) | Secret partagé avec l'app |
| `PAYFIT_APP_URL` | `https://ton-app.vercel.app` | URL de l'app Vercel (sans / final) |
| `N8N_WORKFLOW2_WEBHOOK_URL` | `https://ton-n8n.app.n8n.cloud/webhook/trend-to-article` | URL du webhook Workflow 2 (pour auto-trigger) |

### 2. Importer les Workflows

#### Workflow 1 V2 : Veille Optimisée
1. Dans N8N Cloud, cliquer **"Add workflow"**
2. **"..."** (menu) → **"Import from File"**
3. Sélectionner `n8n/workflow-1-veille-optimisee.json`
4. Vérifier les nœuds et corriger si besoin les variables
5. Cliquer **"Test Workflow"** via le trigger "Test Manuel"

#### Workflow 2 : Trend → Article (inchangé)
1. Même procédure avec `n8n/workflow-2-trend-to-article.json`
2. Après import, noter l'**URL du Webhook** (visible sur le noeud "Webhook Trigger")
3. **IMPORTANT** : Copier cette URL dans la variable N8N `N8N_WORKFLOW2_WEBHOOK_URL`

#### Workflow 3 : Veille Concurrentielle
1. Même procédure avec `n8n/workflow-3-veille-concurrentielle.json`
2. Tester via "Test Manuel" pour vérifier que les RSS concurrents sont accessibles

## Détail des Workflows

### Workflow 1 V2 : Veille Optimisée

**Déclencheur** : Toutes les 6h (ou manuellement)

**Améliorations vs V1** :
- ⚡ Fréquence 4x plus élevée (6h vs 24h)
- 📡 5 sources au lieu de 2 (Légifrance + BOFIP + URSSAF + PAA + Content Gap)
- 🧠 35 mots-clés dynamiques (core + tactical + anticipation)
- 📊 4 critères de scoring (ajout de score_timing)
- 🔄 Auto-trigger du Workflow 2 pour score ≥ 4
- 🔍 Déduplication avancée par similarité Jaccard

**Étapes** :
1. **Mots-clés Dynamiques** : 35 mots-clés en 3 catégories (core, tactical, anticipation)
2. **5 branches parallèles** :
   - Légifrance JO RSS → Filtrage paie/RH enrichi
   - BOFIP RSS → Filtrage cotisations/exonérations
   - URSSAF RSS → Toutes les actualités
   - OpenAI PAA Avancées → 15 questions émergentes (vs 10 avant)
   - OpenAI Content Gap Analysis → Sujets non couverts par les concurrents
3. **Fusion Multi-Source** : Combine les 5 sources, déduplication par similarité Jaccard (seuil 0.6)
4. **Scoring V2** : 4 critères pondérés + bonus timing
5. **Webhook** : Envoie chaque trend au SaaS
6. **Auto-Trigger** : Si score_total ≥ 4, déclenche automatiquement le Workflow 2

**Résultat** : ~15-25 nouvelles trends toutes les 6h, articles auto-générés pour les top trends

### Workflow 2 : Trend → Article SEO

**Déclencheur** : Webhook POST, manuel, ou **auto-trigger depuis Workflow 1**

**Payload webhook** :
```json
{
  "question": "Transparence des salaires 2026 : quelles obligations ?",
  "source": "Directive UE 2023/970",
  "signal": "Transposition avant juin 2026",
  "icp_target": "ICP 2",
  "trend_id": "uuid-optionnel-de-la-trend"
}
```

**Étapes** :
1. **Préparer** : Normalise les données d'entrée
2. **OpenAI Brief** : Génère un brief SEO (keyword principal, secondaires, angle, outline)
3. **Générer Article** : Appelle le webhook avec `type: "generate_article"`, qui déclenche OpenAI côté serveur pour générer un article complet de ~1000 mots
4. **Résumé** : Retourne le titre, slug et ID de l'article créé

**Résultat** : Un article draft apparaît dans le dashboard Articles, prêt pour review compliance

### Workflow 3 : Veille Concurrentielle

**Déclencheur** : Toutes les 12h (ou manuellement)

**Concurrents surveillés** :
| Concurrent | Forces | Faiblesses |
|------------|--------|------------|
| **Factorial** | SIRH tout-en-un, UX moderne | Faible sur le droit social FR, contenu traduit |
| **Lucca** | Contenu RH de qualité | Cible 50+, pas spécialisé paie TPE |
| **Cegid** | Large couverture métier | Contenu corporate, pricing opaque |
| **Sage** | Base installée massive | Image vieillissante, contenu peu engageant |

**Étapes** :
1. **Pour chaque concurrent** : Récupère le RSS de leur blog
2. **Parser** : Extrait les articles des 30 derniers jours liés à la paie/RH
3. **Analyse IA** : OpenAI identifie leur stratégie, les content gaps et les menaces
4. **Résultats** :
   - Content gaps → Table `benchmarks` (pour analyse)
   - Gaps à haute priorité → Table `trends` (pour génération d'articles)

**Résultat** : Insights concurrentiels + nouvelles opportunités SEO automatiques

## Pipeline Complet — De la détection à la publication

```
Signal détecté (6h)          Scoring IA              Auto-génération
      │                          │                        │
  Légifrance ─┐                  │                        │
  BOFIP ──────┤                  │                        │
  URSSAF ─────┤──→ Fusion ──→ Score V2 ──→ score ≥ 4 ──→ Workflow 2
  OpenAI PAA ─┤                  │              │              │
  Content Gap ┘                  │              │         Article Draft
                                 │              │              │
                            score < 4           │         Dashboard
                                 │              │              │
                           Trend visible   Auto-trigger    Review &
                           pour review     en < 1 min     Publish
                              manuel
```

**Temps moyen signal → article draft** : < 30 minutes (automatique pour score ≥ 4)

## Coûts estimés

| Ressource | Usage par cycle | Coût estimé |
|-----------|----------------|-------------|
| OpenAI GPT-4o-mini (Workflow 1 V2) | ~25 appels | ~$0.04 |
| OpenAI GPT-4o-mini (Workflow 2) | ~2 appels | ~$0.01 |
| OpenAI GPT-4o-mini (Workflow 3) | ~8 appels | ~$0.02 |
| N8N Cloud | Inclus dans le plan | $0 |
| **Total par cycle W1+W2** | | **~$0.05** |
| **Total par jour (4x W1 + 2x W3)** | | **~$0.24** |
| **Total par mois** | | **~$7.20** |

## Tester

### Test rapide Workflow 1 V2
1. Ouvrir Workflow 1 V2 dans N8N
2. Cliquer "Test Workflow" (trigger manuel)
3. Vérifier dans le dashboard de l'app que de nouvelles trends apparaissent
4. Vérifier qu'un article draft a été auto-généré (si une trend a score ≥ 4)

### Test rapide Workflow 2
1. Ouvrir Workflow 2 dans N8N
2. Cliquer "Test Workflow" (utilise les données de test par défaut)
3. Vérifier qu'un nouvel article draft apparaît dans le dashboard Articles

### Test rapide Workflow 3
1. Ouvrir Workflow 3 dans N8N
2. Cliquer "Test Workflow" (trigger manuel)
3. Vérifier dans le dashboard que de nouvelles entrées benchmark apparaissent
4. Vérifier si des trends issues de content gaps ont été créées

### Test via cURL (Workflow 2 webhook)

```bash
curl -X POST https://ton-instance-n8n.app.n8n.cloud/webhook/trend-to-article \
  -H "Content-Type: application/json" \
  -d '{
    "question": "SMIC 2026 : impact sur les cotisations employeur",
    "source": "economie.gouv.fr",
    "signal": "Revalorisation SMIC au 1er janvier 2026",
    "icp_target": "ICP 1+2"
  }'
```

## Dépannage

| Problème | Solution |
|----------|----------|
| 401 Unauthorized sur le webhook | Vérifier que `WEBHOOK_SECRET` est identique dans N8N et `.env.local` |
| 500 Server misconfiguration | La variable `WEBHOOK_SECRET` n'est pas définie côté Vercel |
| OpenAI timeout | Augmenter le timeout dans les nœuds HTTP Request |
| Pas de trends dans le dashboard | Vérifier les logs d'exécution N8N et les réponses du webhook |
| Article non généré | Vérifier que `OPENAI_API_KEY` est configurée côté Vercel |
| RSS concurrent vide | Normal si le concurrent n'a pas de RSS — l'analyse IA fonctionne quand même |
| Auto-trigger ne marche pas | Vérifier `N8N_WORKFLOW2_WEBHOOK_URL` dans les variables N8N |
| Trop de doublons | Ajuster le seuil Jaccard dans le nœud "Fusion Multi-Source" (défaut: 0.6) |
