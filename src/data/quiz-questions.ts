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
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Comment gérez-vous actuellement vos fiches de paie ?',
    type: 'multiple_choice',
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