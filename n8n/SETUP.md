# N8N Workflows - PayFit SEO Copilot

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW 1 : Veille Automatisée               │
│                                                                  │
│  Schedule (24h)                                                  │
│       │                                                          │
│       ├──→ Légifrance RSS ──→ Parser XML ──→ Filtrer paie/RH    │
│       │                                          │               │
│       └──→ OpenAI (PAA) ──→ Parser JSON ─────────┤               │
│                                                   │               │
│                                          Fusionner & Dédupliquer │
│                                                   │               │
│                                          ┌────────┘               │
│                                          │                        │
│                                   Pour chaque question :          │
│                                   OpenAI Score (1-5 x 3 critères)│
│                                          │                        │
│                                   POST /api/webhook-n8n           │
│                                   → Insert table `trends`         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              WORKFLOW 2 : Trend → Article SEO                    │
│                                                                  │
│  Webhook / Manuel                                                │
│       │                                                          │
│       └──→ OpenAI : Générer Brief SEO                            │
│                 (keyword, secondaires, angle, outline)            │
│                         │                                        │
│                  POST /api/webhook-n8n                            │
│                  type: "generate_article"                         │
│                         │                                        │
│                  OpenAI génère l'article (~1000 mots)             │
│                         │                                        │
│                  Insert table `articles` (draft)                  │
│                         │                                        │
│                  Article visible dans le dashboard                │
└─────────────────────────────────────────────────────────────────┘
```

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

### 2. Importer Workflow 1 : Veille Automatisée

1. Dans N8N Cloud, cliquer **"Add workflow"**
2. Cliquer **"..."** (menu) → **"Import from File"**
3. Sélectionner `n8n/workflow-1-veille-automatisee.json`
4. Vérifier les nœuds et corriger si besoin les variables
5. Cliquer **"Test Workflow"** via le trigger "Test Manuel"

### 3. Importer Workflow 2 : Trend → Article

1. Même procédure avec `n8n/workflow-2-trend-to-article.json`
2. Après import, noter l'**URL du Webhook** (visible sur le noeud "Webhook Trigger")
3. Tester via "Test Manuel" pour générer un article de demo

## Détail des Workflows

### Workflow 1 : Veille Automatisée

**Déclencheur** : Toutes les 24h (ou manuellement)

**Étapes** :
1. **Mots-clés Seed** : 15 mots-clés paie/RH servant de contexte
2. **Branche A - Légifrance RSS** : Récupère le Journal Officiel, filtre les items liés à la paie/RH
3. **Branche B - OpenAI PAA** : Génère 10 questions émergentes que des employeurs pourraient chercher
4. **Fusion** : Combine les deux sources, déduplique
5. **Scoring** : Chaque question est scorée par OpenAI sur 3 critères (novelty, relevance, volume)
6. **Webhook** : Envoie chaque trend scorée à l'app via POST /api/webhook-n8n

**Résultat** : ~10-15 nouvelles trends apparaissent dans le dashboard Trends

### Workflow 2 : Trend → Article SEO

**Déclencheur** : Webhook POST ou manuel

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

## Connecter les deux workflows (Pipeline complet)

Pour un pipeline entièrement automatisé (trend détectée → article généré) :

1. Dans le **Workflow 1**, après le noeud "Succès ?", ajouter un noeud **IF** qui vérifie si `score_total >= 4`
2. Si oui, ajouter un noeud **HTTP Request** qui appelle le **Webhook URL du Workflow 2** avec les données de la trend
3. Résultat : les trends à fort potentiel génèrent automatiquement un article draft

## Tester

### Test rapide Workflow 1

1. Ouvrir Workflow 1 dans N8N
2. Cliquer "Test Workflow" (trigger manuel)
3. Vérifier dans le dashboard de l'app que de nouvelles trends apparaissent

### Test rapide Workflow 2

1. Ouvrir Workflow 2 dans N8N
2. Cliquer "Test Workflow" (utilise les données de test par défaut)
3. Vérifier qu'un nouvel article draft apparaît dans le dashboard Articles

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

## Coûts estimés

| Ressource | Usage par exécution | Coût estimé |
|-----------|-------------------|-------------|
| OpenAI GPT-4o-mini (Workflow 1) | ~12 appels | ~$0.02 |
| OpenAI GPT-4o-mini (Workflow 2) | ~2 appels | ~$0.01 |
| N8N Cloud | Inclus dans le plan | $0 |
| **Total par cycle complet** | | **~$0.03** |

## Dépannage

| Problème | Solution |
|----------|----------|
| 401 Unauthorized sur le webhook | Vérifier que `WEBHOOK_SECRET` est identique dans N8N et `.env.local` |
| 500 Server misconfiguration | La variable `WEBHOOK_SECRET` n'est pas définie côté Vercel |
| OpenAI timeout | Augmenter le timeout dans les nœuds HTTP Request |
| Pas de trends dans le dashboard | Vérifier les logs d'exécution N8N et les réponses du webhook |
| Article non généré | Vérifier que `OPENAI_API_KEY` est configurée côté Vercel |
