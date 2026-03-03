# hackaton-payfit

Stratégie SEO de PayFit.

# Problématique :

- Problématique 1 — Production de contenu SEO en masse via l'IA, sans sacrifier la qualité ni l'image d'expert paie/RH de PayFit.
- Problématique 2 — Détection automatique de questions/tendances émergentes en RH/paie pour créer du contenu SEO avant les concurrents (Factorial, Lucca, Cegid, Sage).
- Problématique 3 — Utilisation du no-code/vibecoding pour créer des outils interactifs (simulateurs, calculateurs) qui répondent à des intentions de recherche, sans dépendre des équipes dev.

# Résultats attendus :

- Créer du contenu de masse avec l'IA, sans perdre en crédibilité sur le sujet "paie et RH".
- Détecter les questions émergentes avant la concurrence sur le sujet "paie et RH".
- Utiliser des outils de no-code pour réduire la dépendance aux équipes de dev.

# Livrable par jour :

- Jour 1 : cadrage + stratégie
- Jour 2 : contenu & méthode
- Jour 3 : POC
- Jour 4 : solution finale

# Solutions :

- Veille IA automatisée (N8N + Chat GPT API) :
  Un workflow qui détecte les tendances émergentes en RH/paie via le scraping de sources stratégiques (People Also Ask, forums RH, Légifrance, Journal Officiel) et les score par potentiel SEO.
- Content Engine (Chat GPT API + grille compliance) :
  Un générateur d’articles SEO avec prompt documenté, optimisé pour le tone of voice PayFit, avec vérification compliance/légal intégrée et structure GEO-ready (FAQ, données structurées, définitions claires).
- Quiz interactif de conformité paie (Next.js) :
  Un outil public « Gérez-vous correctement votre paie ? » ou « Êtes-vous en règle avec vos obligations employeur ? » qui agit comme pièce centrale d’un cluster SEO, lead magnet, et outil de qualification de prospects. Intègre des mini-calculateurs (congés payés, heures de travail).

# Stack :

- Make ou N8N obligatoire
- Lovable pas imposé
- Next.js
- Supabase
- Vercel
