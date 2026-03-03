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
  type: 'multiple_choice' | 'calculator'
  options?: QuizOption[]
  calculator?: {
    type: 'conges' | 'heures'
    label: string
  }
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
    description:
      'SMIC à 12,02€/h, plafond SS à 4005€, RGDU remplaçant les anciens dispositifs',
    type: 'multiple_choice',
    options: [
      { label: 'Oui, tout est à jour depuis janvier', value: 'a', points: 3 },
      { label: 'Mon logiciel le fait automatiquement', value: 'b', points: 3 },
      { label: 'Pas encore, je dois vérifier', value: 'c', points: 1, painPoint: 'miseajour_retard' },
      {
        label: "Je ne savais pas qu'il y avait des changements",
        value: 'd',
        points: 0,
        painPoint: 'veille_absente',
      },
    ],
  },
  {
    id: 'q3',
    question:
      'Êtes-vous prêt pour la transparence des salaires obligatoire en 2026 ?',
    description:
      'Directive UE : fourchettes salariales dans les offres, accès des salariés aux écarts',
    type: 'multiple_choice',
    options: [
      { label: 'Oui, nos grilles salariales sont prêtes', value: 'a', points: 3 },
      {
        label: "J'en ai entendu parler mais je n'ai rien fait",
        value: 'b',
        points: 1,
        painPoint: 'transparence_nonpret',
      },
      {
        label: 'Ça ne nous concerne pas (< 100 salariés)',
        value: 'c',
        points: 1,
        painPoint: 'transparence_meconnaissance',
      },
      {
        label: "Première fois que j'en entends parler",
        value: 'd',
        points: 0,
        painPoint: 'transparence_inconnu',
      },
    ],
  },
  {
    id: 'q4',
    question: 'Comment calculez-vous les congés payés de vos salariés ?',
    type: 'multiple_choice',
    options: [
      { label: 'Automatiquement via mon logiciel de paie', value: 'a', points: 3 },
      { label: 'Je connais la règle des 2,5 jours/mois', value: 'b', points: 2 },
      { label: 'Je laisse mon comptable gérer', value: 'c', points: 1 },
      {
        label: 'Je ne suis pas sûr de la méthode',
        value: 'd',
        points: 0,
        painPoint: 'conges_confusion',
      },
    ],
  },
  {
    id: 'q5',
    question:
      'Savez-vous que les salariés en arrêt maladie acquièrent désormais des congés payés ?',
    description:
      'Depuis la loi du 22 avril 2024 : 2 jours ouvrables/mois en arrêt maladie non professionnel',
    type: 'multiple_choice',
    options: [
      {
        label: "Oui, c'est déjà intégré dans notre gestion",
        value: 'a',
        points: 3,
      },
      {
        label: "Oui, mais je n'ai pas encore adapté mes process",
        value: 'b',
        points: 1,
        painPoint: 'conges_maladie_retard',
      },
      {
        label: 'Non, je ne connaissais pas cette règle',
        value: 'c',
        points: 0,
        painPoint: 'conges_maladie_inconnu',
      },
    ],
  },
  {
    id: 'q6',
    question: "Mini-calcul : vérifiez le solde de congés d'un salarié",
    description: 'Entrez les données pour vérifier si votre calcul est correct',
    type: 'calculator',
    calculator: { type: 'conges', label: 'Calculateur de congés payés' },
  },
  {
    id: 'q7',
    question:
      "Quel est le coût réel d'une rupture conventionnelle pour votre entreprise en 2026 ?",
    description:
      'Le forfait social est passé de 30% à 40% au 1er janvier 2026',
    type: 'multiple_choice',
    options: [
      { label: 'Je connais le nouveau taux à 40%', value: 'a', points: 3 },
      {
        label: "Je savais que ça avait changé mais pas le montant exact",
        value: 'b',
        points: 1,
      },
      {
        label: "Je pensais que c'était toujours 30%",
        value: 'c',
        points: 0,
        painPoint: 'rupture_conv_erreur',
      },
      { label: 'Je ne gère pas ce type de situation', value: 'd', points: 1 },
    ],
  },
  {
    id: 'q8',
    question:
      'Vos titres-restaurant sont-ils conformes au plafond 2026 ?',
    description: 'Exonération maximale : 7,32€ par titre en 2026',
    type: 'multiple_choice',
    options: [
      {
        label: 'Oui, valeur et participation employeur sont à jour',
        value: 'a',
        points: 3,
      },
      {
        label: 'Je dois vérifier les montants',
        value: 'b',
        points: 1,
        painPoint: 'titres_resto_verif',
      },
      { label: 'On ne propose pas de titres-restaurant', value: 'c', points: 2 },
      {
        label: "Je ne connais pas le plafond d'exonération",
        value: 'd',
        points: 0,
        painPoint: 'titres_resto_inconnu',
      },
    ],
  },
  {
    id: 'q9',
    question:
      'Connaissez-vous le nouveau congé supplémentaire de naissance créé en 2026 ?',
    description:
      'LFSS 2026 : nouveau congé pour les naissances/adoptions à compter du 1er janvier',
    type: 'multiple_choice',
    options: [
      {
        label: "Oui, je l'ai déjà intégré dans ma gestion",
        value: 'a',
        points: 3,
      },
      {
        label: "J'en ai entendu parler mais pas les détails",
        value: 'b',
        points: 1,
        painPoint: 'conge_naissance_flou',
      },
      {
        label: "Non, c'est nouveau pour moi",
        value: 'c',
        points: 0,
        painPoint: 'conge_naissance_inconnu',
      },
    ],
  },
  {
    id: 'q10',
    question: 'Mini-calcul : heures supplémentaires et déduction forfaitaire',
    description:
      'Vérifiez votre éligibilité à la déduction forfaitaire étendue en 2026',
    type: 'calculator',
    calculator: {
      type: 'heures',
      label: 'Calculateur heures supplémentaires',
    },
  },
  {
    id: 'q11',
    question:
      'Votre DSN mensuelle est-elle à jour des nouvelles contributions 2026 ?',
    description:
      'Nouvelles contributions sectorielles (dialogue social, formation) à déclarer en DSN',
    type: 'multiple_choice',
    options: [
      {
        label: 'Oui, mon logiciel gère la DSN automatiquement',
        value: 'a',
        points: 3,
      },
      { label: "Mon comptable s'en occupe", value: 'b', points: 2 },
      {
        label: 'Je ne suis pas sûr que tout soit déclaré',
        value: 'c',
        points: 0,
        painPoint: 'dsn_incertitude',
      },
      {
        label: "Je ne sais pas ce qu'est la DSN",
        value: 'd',
        points: 0,
        painPoint: 'dsn_inconnu',
      },
    ],
  },
  {
    id: 'q12',
    question: 'Combien de salariés compte votre entreprise ?',
    type: 'multiple_choice',
    options: [
      { label: '1 à 9 salariés', value: '1-9', points: 0 },
      { label: '10 à 19 salariés', value: '10-19', points: 0 },
      { label: '20 à 49 salariés', value: '20-49', points: 0 },
      { label: '50 salariés ou plus', value: '50+', points: 0 },
    ],
  },
]

// Pain points descriptions pour les résultats
export const painPointLabels: Record<string, string> = {
  paie_manuelle: 'Gestion de paie manuelle — risque élevé d\'erreurs et de non-conformité',
  paie_confusion: 'Manque de visibilité sur votre processus de paie',
  miseajour_retard: 'Bulletins de paie potentiellement non conformes aux taux 2026',
  veille_absente: 'Absence de veille réglementaire — changements légaux non détectés',
  transparence_nonpret: 'Directive transparence salariale : préparation nécessaire avant juin 2026',
  transparence_meconnaissance: 'La transparence salariale concerne aussi les offres d\'emploi des TPE',
  transparence_inconnu: 'Directive transparence salariale non identifiée — risque de non-conformité',
  conges_confusion: 'Calcul des congés payés incertain — risque de litige',
  conges_maladie_retard: 'Acquisition congés en arrêt maladie non encore intégrée',
  conges_maladie_inconnu: 'Nouvelle règle congés/maladie non connue — mise en conformité urgente',
  rupture_conv_erreur: 'Forfait social rupture conventionnelle : erreur de taux (30% → 40%)',
  titres_resto_verif: 'Titres-restaurant : vérification des plafonds 2026 nécessaire',
  titres_resto_inconnu: 'Plafond exonération titres-restaurant 2026 non connu',
  conge_naissance_flou: 'Nouveau congé de naissance 2026 : détails à maîtriser',
  conge_naissance_inconnu: 'Congé supplémentaire de naissance 2026 non identifié',
  dsn_incertitude: 'DSN potentiellement incomplète — risque de redressement URSSAF',
  dsn_inconnu: 'Déclaration Sociale Nominative non maîtrisée — risque majeur',
}
