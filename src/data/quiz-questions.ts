export interface QuizOption {
  label: string
  value: string
  points: number
  painPoint?: string
}

export interface QuizQuestion {
  id: string
  question: string
  description?: string
  type: 'multiple_choice'
  options: QuizOption[]
  relatedTopics?: string[]
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Comment gérez-vous actuellement vos fiches de paie ?',
    type: 'multiple_choice',
    relatedTopics: ['gestion paie', 'logiciel paie', 'fiche de paie', 'bulletin de paie'],
    options: [
      { label: 'Avec un logiciel de paie automatisé', value: 'a', points: 3 },
      { label: 'Via un expert-comptable externe', value: 'b', points: 2 },
      { label: 'Sur Excel ou manuellement', value: 'c', points: 0, painPoint: 'paie_manuelle' },
      { label: 'Je ne sais pas trop', value: 'd', points: 0, painPoint: 'paie_confusion' },
    ],
  },
  {
    id: 'q2',
    question: 'Avez-vous mis à jour vos bulletins de paie avec les nouveaux taux 2026 ?',
    description: 'SMIC, plafond SS, et RGDU remplaçant les anciens dispositifs',
    type: 'multiple_choice',
    relatedTopics: ['taux 2026', 'SMIC', 'plafond sécurité sociale', 'RGDU'],
    options: [
      { label: 'Oui, tout est à jour depuis janvier', value: 'a', points: 3 },
      { label: 'Mon logiciel le fait automatiquement', value: 'b', points: 3 },
      { label: 'Pas encore, je dois vérifier', value: 'c', points: 1, painPoint: 'miseajour_retard' },
      { label: "Je ne savais pas qu'il y avait des changements", value: 'd', points: 0, painPoint: 'veille_absente' },
    ],
  },
  {
    id: 'q3',
    question: 'Êtes-vous prêt pour la transparence des salaires (directive UE 2026) ?',
    description: 'Affichage des fourchettes salariales et accès aux écarts de rémunération.',
    type: 'multiple_choice',
    relatedTopics: ['transparence salaires', 'directive européenne', 'égalité salariale', 'transparence salariale'],
    options: [
      { label: 'Oui, nos grilles salariales sont prêtes', value: 'a', points: 3 },
      { label: "J'en ai entendu parler mais je n'ai rien fait", value: 'b', points: 1, painPoint: 'transparence_nonpret' },
      { label: 'Ça ne nous concerne pas (< 100 salariés)', value: 'c', points: 1, painPoint: 'transparence_meconnaissance' },
      { label: "Première fois que j'en entends parler", value: 'd', points: 0, painPoint: 'transparence_inconnu' },
    ],
  },
  {
    id: 'q4',
    question: 'Comment calculez-vous les congés payés de vos salariés ?',
    type: 'multiple_choice',
    relatedTopics: ['congés payés', 'calcul congés', 'jours de congés'],
    options: [
      { label: 'Automatiquement via mon logiciel', value: 'a', points: 3 },
      { label: 'Je connais la règle des 2,5 jours/mois', value: 'b', points: 2 },
      { label: 'Je laisse mon comptable gérer', value: 'c', points: 1 },
      { label: 'Je ne suis pas sûr de la méthode', value: 'd', points: 0, painPoint: 'conges_confusion' },
    ],
  },
  {
    id: 'q5',
    question: 'Vos salariés en arrêt maladie acquièrent-ils bien leurs congés payés ?',
    description: 'Obligation légale : 2 jours ouvrables/mois en arrêt maladie non professionnel.',
    type: 'multiple_choice',
    relatedTopics: ['arrêt maladie', 'congés maladie', 'acquisition congés'],
    options: [
      { label: "Oui, c'est déjà paramétré", value: 'a', points: 3 },
      { label: "Oui, mais on le fait manuellement", value: 'b', points: 1, painPoint: 'conges_maladie_manuel' },
      { label: 'Non, je ne connaissais pas cette règle', value: 'c', points: 0, painPoint: 'conges_maladie_inconnu' },
    ],
  },
  // NOUVELLE QUESTION 6 (Remplace le calculateur)
  {
    id: 'q6',
    question: "Gérez-vous la comparaison 'Maintien de salaire' vs 'Règle du 1/10ème' pour les congés ?",
    description: "Le code du travail impose d'appliquer la méthode la plus favorable au salarié lors de sa prise de congés.",
    type: 'multiple_choice',
    relatedTopics: ['maintien de salaire', 'règle du dixième', 'indemnité congés', '10ème'],
    options: [
      { label: 'Mon logiciel compare et applique le meilleur', value: 'a', points: 3 },
      { label: "C'est mon comptable qui gère ce calcul", value: 'b', points: 2 },
      { label: 'Je le fais à la main (ou sur Excel)', value: 'c', points: 0, painPoint: 'conges_10eme_manuel' },
      { label: "Je ne savais pas qu'il fallait comparer", value: 'd', points: 0, painPoint: 'conges_10eme_inconnu' },
    ],
  },
  {
    id: 'q7',
    question: "Connaissez-vous le coût réel d'une rupture conventionnelle en 2026 ?",
    description: "Le forfait social a fortement augmenté au 1er janvier.",
    type: 'multiple_choice',
    relatedTopics: ['rupture conventionnelle', 'forfait social', 'indemnité rupture'],
    options: [
      { label: 'Oui, mon outil est à jour avec le taux de 40%', value: 'a', points: 3 },
      { label: "Je savais qu'il y a eu un changement", value: 'b', points: 1 },
      { label: "Je pensais que c'était toujours 30%", value: 'c', points: 0, painPoint: 'rupture_conv_erreur' },
    ],
  },
  {
    id: 'q8',
    question: 'Vos titres-restaurant sont-ils conformes au plafond 2026 ?',
    type: 'multiple_choice',
    relatedTopics: ['titres-restaurant', 'titres restaurant', 'ticket restaurant'],
    options: [
      { label: 'Oui, exonération maximale à 7,32€', value: 'a', points: 3 },
      { label: 'Je dois vérifier mes paramétrages', value: 'b', points: 1, painPoint: 'titres_resto_verif' },
      { label: 'On ne propose pas de titres-restaurant', value: 'c', points: 2 },
    ],
  },
  {
    id: 'q9',
    question: 'Connaissez-vous le nouveau "congé de naissance" créé en 2026 ?',
    type: 'multiple_choice',
    relatedTopics: ['congé de naissance', 'congé naissance', 'congé paternité'],
    options: [
      { label: "Oui, il est intégré dans mon SI RH", value: 'a', points: 3 },
      { label: "J'en ai entendu parler mais sans plus", value: 'b', points: 1, painPoint: 'conge_naissance_flou' },
      { label: "C'est totalement nouveau pour moi", value: 'c', points: 0, painPoint: 'conge_naissance_inconnu' },
    ],
  },
  // NOUVELLE QUESTION 10 (Remplace le calculateur)
  {
    id: 'q10',
    question: 'Appliquez-vous la déduction forfaitaire patronale (loi TEPA) sur les heures supplémentaires ?',
    description: 'Une aide de 1,50€ par heure supplémentaire pour les entreprises de moins de 20 salariés.',
    type: 'multiple_choice',
    relatedTopics: ['heures supplémentaires', 'TEPA', 'déduction forfaitaire', 'loi TEPA'],
    options: [
      { label: "Oui, c'est déduit automatiquement", value: 'a', points: 3 },
      { label: "Non, c'est trop complexe à calculer/déclarer", value: 'b', points: 0, painPoint: 'tepa_complexe' },
      { label: "Je ne savais pas qu'on pouvait réduire nos charges", value: 'c', points: 0, painPoint: 'tepa_inconnu' },
      { label: "Plus de 20 salariés (non éligible)", value: 'd', points: 2 },
    ],
  },
  {
    id: 'q11',
    question: 'Votre DSN mensuelle est-elle 100% fiable ?',
    type: 'multiple_choice',
    relatedTopics: ['DSN', 'déclaration sociale nominative', 'déclaration sociale'],
    options: [
      { label: 'Oui, générée et envoyée automatiquement', value: 'a', points: 3 },
      { label: "Mon comptable s'en occupe", value: 'b', points: 2 },
      { label: 'J\'ai parfois des retours d\'erreur de l\'URSSAF', value: 'c', points: 0, painPoint: 'dsn_erreurs' },
      { label: "Je ne suis pas très à l'aise avec la DSN", value: 'd', points: 0, painPoint: 'dsn_incertitude' },
    ],
  },
  {
    id: 'q12',
    question: 'Pour terminer, combien de salariés compte votre entreprise ?',
    type: 'multiple_choice',
    options: [
      { label: '1 à 9 salariés', value: '1-9', points: 0 },
      { label: '10 à 19 salariés', value: '10-19', points: 0 },
      { label: '20 à 49 salariés', value: '20-49', points: 0 },
      { label: '50 salariés ou plus', value: '50+', points: 0 },
    ],
  },
]

export const painPointLabels: Record<string, string> = {
  paie_manuelle: 'Gestion manuelle risquée (Excel)',
  paie_confusion: 'Manque de visibilité sur le process',
  miseajour_retard: 'Risque de bulletins non conformes (2026)',
  veille_absente: 'Absence de veille légale',
  transparence_nonpret: 'Directive transparence salariale non préparée',
  transparence_meconnaissance: 'La transparence concerne aussi les offres des TPE',
  transparence_inconnu: 'Directive transparence inconnue',
  conges_confusion: 'Calcul des congés incertain',
  conges_maladie_manuel: 'Acquisition congés maladie non automatisée',
  conges_maladie_inconnu: 'Règle congés/maladie non appliquée',
  conges_10eme_manuel: 'Calcul fastidieux du 10ème vs maintien de salaire',
  conges_10eme_inconnu: 'Règle de comparaison des indemnités de congés non appliquée',
  rupture_conv_erreur: 'Erreur sur le forfait social (rupture)',
  titres_resto_verif: 'Plafonds titres-restaurant à vérifier',
  conge_naissance_flou: 'Nouveau congé de naissance mal maîtrisé',
  conge_naissance_inconnu: 'Congé de naissance ignoré',
  tepa_complexe: 'Perte financière : déduction TEPA non appliquée car trop complexe',
  tepa_inconnu: 'Perte financière : ignorance des déductions sur heures sup',
  dsn_erreurs: 'Erreurs fréquentes en DSN',
  dsn_incertitude: 'Gestion DSN non maîtrisée',
}

export const painPointTopics: Record<string, string[]> = {
  paie_manuelle: ['gestion paie', 'logiciel paie', 'bulletin de paie'],
  paie_confusion: ['gestion paie', 'logiciel paie'],
  miseajour_retard: ['taux 2026', 'SMIC', 'RGDU'],
  veille_absente: ['veille légale', 'taux 2026', 'SMIC'],
  transparence_nonpret: ['transparence salaires', 'transparence salariale', 'directive européenne'],
  transparence_meconnaissance: ['transparence salaires', 'transparence salariale'],
  transparence_inconnu: ['transparence salaires', 'transparence salariale', 'directive européenne'],
  conges_confusion: ['congés payés', 'calcul congés'],
  conges_maladie_manuel: ['arrêt maladie', 'congés maladie'],
  conges_maladie_inconnu: ['arrêt maladie', 'congés maladie'],
  conges_10eme_manuel: ['maintien de salaire', 'indemnité congés', '10ème'],
  conges_10eme_inconnu: ['maintien de salaire', 'indemnité congés'],
  rupture_conv_erreur: ['rupture conventionnelle', 'forfait social'],
  titres_resto_verif: ['titres-restaurant', 'titres restaurant'],
  conge_naissance_flou: ['congé de naissance', 'congé naissance'],
  conge_naissance_inconnu: ['congé de naissance', 'congé naissance'],
  tepa_complexe: ['heures supplémentaires', 'TEPA', 'déduction forfaitaire'],
  tepa_inconnu: ['heures supplémentaires', 'TEPA'],
  dsn_erreurs: ['DSN', 'déclaration sociale'],
  dsn_incertitude: ['DSN', 'déclaration sociale'],
}

export interface QuizTheme {
  id: string
  title: string
  description: string
  emoji: string
  questionIds: string[]
  color: string
}

export const quizThemes: QuizTheme[] = [
  {
    id: 'all',
    title: 'Quiz complet',
    description: 'Testez vos connaissances sur tous les aspects de la paie 2026',
    emoji: '📋',
    questionIds: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12'],
    color: '#0066CC',
  },
  {
    id: 'conges',
    title: 'Congés & absences',
    description: 'Congés payés, arrêts maladie, congé de naissance et indemnités',
    emoji: '🏖️',
    questionIds: ['q4', 'q5', 'q6', 'q9'],
    color: '#2E7D32',
  },
  {
    id: 'conformite',
    title: 'Conformité paie 2026',
    description: 'Taux, cotisations, titres-restaurant et rupture conventionnelle',
    emoji: '🛡️',
    questionIds: ['q1', 'q2', 'q7', 'q8'],
    color: '#E65100',
  },
  {
    id: 'obligations',
    title: 'Obligations légales',
    description: 'Transparence salariale, déduction TEPA et DSN',
    emoji: '⚖️',
    questionIds: ['q3', 'q10', 'q11'],
    color: '#7B1FA2',
  },
]

export function getQuestionsForTheme(themeId: string): QuizQuestion[] {
  const theme = quizThemes.find((t) => t.id === themeId)
  if (!theme) return quizQuestions
  const themeQuestions = theme.questionIds
    .map((id) => quizQuestions.find((q) => q.id === id))
    .filter(Boolean) as QuizQuestion[]
  // Toujours ajouter la question taille d'entreprise à la fin si pas déjà incluse
  const sizeQuestion = quizQuestions.find((q) => q.id === 'q12')
  if (sizeQuestion && !theme.questionIds.includes('q12')) {
    themeQuestions.push(sizeQuestion)
  }
  return themeQuestions
}