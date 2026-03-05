-- ============================================
-- MIGRATION 09: Table legal_references
-- Sources légales vérifiées pour injection
-- dans les prompts de génération d'articles
-- ============================================

CREATE TABLE public.legal_references (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Identification de la référence
  reference_code TEXT NOT NULL,             -- ex: "L.3231-2", "Décret n°2024-951", "Directive 2023/970"
  reference_type TEXT NOT NULL,             -- code_travail | code_securite_sociale | decret | arrete | directive_eu | circulaire_urssaf | loi
  title TEXT NOT NULL,                      -- Titre humain : "Montant du SMIC horaire brut"

  -- Contenu
  content_excerpt TEXT NOT NULL,            -- Extrait pertinent du texte légal (max ~500 mots)
  url TEXT,                                 -- URL vérifiable (Legifrance, EUR-Lex, URSSAF, BOFIP)

  -- Catégorisation pour le matching
  theme TEXT NOT NULL,                      -- smic | conges_payes | bulletin_paie | dsn | temps_travail | cotisations | transparence_salariale | rupture_contrat | embauche | formation | handicap | egalite | teletravail | prevoyance | epargne_salariale
  keywords TEXT[] DEFAULT '{}',             -- Mots-clés pour le matching avec keyword_primary

  -- Temporalité & validité
  applicable_date DATE,                     -- Date d'entrée en vigueur
  expiry_date DATE,                         -- Date d'expiration (NULL = toujours en vigueur)
  status TEXT DEFAULT 'en_vigueur',         -- en_vigueur | abroge | en_projet | vote

  -- Métadonnées
  source_origin TEXT,                       -- legifrance | urssaf | bofip | eur-lex | service-public | manual
  last_verified_at TIMESTAMPTZ,             -- Dernière vérification humaine ou N8N
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour le matching rapide
CREATE INDEX idx_legal_references_theme ON public.legal_references (theme);
CREATE INDEX idx_legal_references_status ON public.legal_references (status);
CREATE INDEX idx_legal_references_keywords ON public.legal_references USING GIN (keywords);

-- RLS : lecture par tous les authentifiés, écriture via service role (N8N/webhook)
ALTER TABLE public.legal_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "legal_references_read_auth"
  ON public.legal_references FOR SELECT
  USING (auth.role() = 'authenticated');

-- Le service role (N8N webhook) bypass RLS pour INSERT/UPDATE/DELETE


-- ============================================
-- SEED: Références légales initiales
-- Sources vérifiables sur Legifrance/URSSAF
-- ============================================

INSERT INTO public.legal_references (reference_code, reference_type, title, content_excerpt, url, theme, keywords, applicable_date, status, source_origin, last_verified_at)
VALUES

-- === SMIC ===
(
  'L.3231-2',
  'code_travail',
  'Principe du SMIC',
  'Le salaire minimum de croissance assure aux salariés dont les rémunérations sont les plus faibles la garantie de leur pouvoir d''achat et une participation au développement économique de la Nation.',
  'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006902803',
  'smic',
  ARRAY['SMIC', 'salaire minimum', 'smic 2026', 'smic horaire', 'smic brut', 'revalorisation smic'],
  '1970-01-02',
  'en_vigueur',
  'legifrance',
  now()
),
(
  'L.3231-4',
  'code_travail',
  'Revalorisation annuelle du SMIC',
  'Le SMIC est revalorisé au 1er janvier de chaque année en fonction de l''évolution de l''indice des prix à la consommation et de la moitié du gain de pouvoir d''achat du salaire horaire moyen des ouvriers et employés.',
  'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006902811',
  'smic',
  ARRAY['SMIC', 'revalorisation', 'smic 2026', 'augmentation smic', 'indice prix'],
  '1970-01-02',
  'en_vigueur',
  'legifrance',
  now()
),
(
  'L.3231-12',
  'code_travail',
  'Sanctions non-respect du SMIC',
  'Le fait de payer des salaires inférieurs au minimum fixé par les articles L.3231-2 et suivants est puni d''une amende prévue pour les contraventions de la cinquième classe, appliquée autant de fois qu''il y a de salariés concernés.',
  'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006902830',
  'smic',
  ARRAY['SMIC', 'sanction', 'amende', 'non-respect smic', 'contravention'],
  '1970-01-02',
  'en_vigueur',
  'legifrance',
  now()
),

-- === BULLETIN DE PAIE ===
(
  'R.3243-1',
  'code_travail',
  'Mentions obligatoires du bulletin de paie',
  'Le bulletin de paie prévu à l''article L.3243-2 comporte obligatoirement les mentions suivantes : le nom et l''adresse de l''employeur, la référence de l''organisme auquel l''employeur verse les cotisations de sécurité sociale, le numéro de la nomenclature d''activité, l''intitulé de la convention collective applicable.',
  'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000049357498',
  'bulletin_paie',
  ARRAY['bulletin de paie', 'fiche de paie', 'mentions obligatoires', 'bulletin paie 2026', 'bulletin simplifié'],
  '2018-01-01',
  'en_vigueur',
  'legifrance',
  now()
),
(
  'L.3243-2',
  'code_travail',
  'Obligation de remise du bulletin de paie',
  'Lors du paiement du salaire, l''employeur remet aux personnes mentionnées à l''article L.3243-1 une pièce justificative dite bulletin de paie. Il ne peut exiger aucune formalité de signature ou d''émargement autre que celle établissant que la somme reçue correspond bien au montant net figurant sur ce bulletin.',
  'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033020527',
  'bulletin_paie',
  ARRAY['bulletin de paie', 'remise bulletin', 'obligation employeur', 'paiement salaire'],
  '2017-01-01',
  'en_vigueur',
  'legifrance',
  now()
),
(
  'L.3243-4',
  'code_travail',
  'Conservation et bulletin de paie électronique',
  'L''employeur conserve un double des bulletins de paie pendant cinq ans ou les met à disposition du salarié sous forme électronique dans des conditions de nature à garantir l''intégrité, la disponibilité et la confidentialité des données.',
  'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033020519',
  'bulletin_paie',
  ARRAY['bulletin de paie', 'conservation', 'bulletin électronique', 'dématérialisation', 'coffre-fort numérique'],
  '2017-01-01',
  'en_vigueur',
  'legifrance',
  now()
),

-- === CONGÉS PAYÉS ===
(
  'L.3141-1',
  'code_travail',
  'Droit aux congés payés',
  'Tout salarié a droit chaque année à un congé payé à la charge de l''employeur. Chaque mois de travail effectif ouvre droit à un congé de 2,5 jours ouvrables.',
  'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033020675',
  'conges_payes',
  ARRAY['congés payés', 'droit congés', 'jours ouvrables', 'congé annuel', 'acquisition congés'],
  '2016-08-10',
  'en_vigueur',
  'legifrance',
  now()
),
(
  'L.3141-3',
  'code_travail',
  'Acquisition des congés payés pendant arrêt maladie',
  'Le salarié qui justifie avoir travaillé chez le même employeur pendant un temps équivalent à un minimum de dix jours de travail effectif a droit à un congé. Les périodes d''arrêt de travail pour maladie sont désormais assimilées à des périodes de travail effectif pour l''acquisition des congés payés, dans la limite de 2 jours ouvrables par mois, plafonnés à 24 jours ouvrables par période de référence.',
  'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000049553922',
  'conges_payes',
  ARRAY['congés payés', 'arrêt maladie', 'acquisition congés maladie', 'congés maladie 2024'],
  '2024-04-24',
  'en_vigueur',
  'legifrance',
  now()
),

-- === DSN ===
(
  'Décret n°2016-1567',
  'decret',
  'Déclaration Sociale Nominative (DSN)',
  'La déclaration sociale nominative (DSN) est obligatoire pour tous les employeurs du secteur privé. Elle remplace la majorité des déclarations sociales périodiques. La DSN est transmise mensuellement par voie électronique au plus tard le 5 ou le 15 du mois suivant la période d''emploi.',
  'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000033434825',
  'dsn',
  ARRAY['DSN', 'déclaration sociale nominative', 'dsn mensuelle', 'déclaration urssaf'],
  '2017-01-01',
  'en_vigueur',
  'legifrance',
  now()
),

-- === TEMPS DE TRAVAIL ===
(
  'L.3121-27',
  'code_travail',
  'Durée légale du travail',
  'La durée légale de travail effectif des salariés à temps complet est fixée à trente-cinq heures par semaine.',
  'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033020029',
  'temps_travail',
  ARRAY['durée légale', 'temps de travail', '35 heures', 'heures supplémentaires', 'temps complet'],
  '2016-08-10',
  'en_vigueur',
  'legifrance',
  now()
),
(
  'L.3121-28',
  'code_travail',
  'Heures supplémentaires',
  'Toute heure accomplie au-delà de la durée légale hebdomadaire ou de la durée considérée comme équivalente est une heure supplémentaire qui ouvre droit à une majoration salariale ou, le cas échéant, à un repos compensateur équivalent.',
  'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033020021',
  'temps_travail',
  ARRAY['heures supplémentaires', 'majoration', 'repos compensateur', 'temps de travail', 'durée légale'],
  '2016-08-10',
  'en_vigueur',
  'legifrance',
  now()
),
(
  'L.3121-33',
  'code_travail',
  'Majoration des heures supplémentaires',
  'Les heures supplémentaires accomplies au-delà de la durée légale donnent lieu à une majoration de salaire de 25% pour chacune des huit premières heures et de 50% pour les heures suivantes, sauf accord collectif prévoyant un taux différent (minimum 10%).',
  'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033020009',
  'temps_travail',
  ARRAY['heures supplémentaires', 'majoration 25%', 'majoration 50%', 'taux majoration'],
  '2016-08-10',
  'en_vigueur',
  'legifrance',
  now()
),

-- === COTISATIONS SOCIALES ===
(
  'L.241-1',
  'code_securite_sociale',
  'Assiette des cotisations de sécurité sociale',
  'Les cotisations de sécurité sociale sont calculées sur le montant des rémunérations ou gains perçus par les assurés, y compris les avantages en nature et en argent.',
  'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033714193',
  'cotisations',
  ARRAY['cotisations sociales', 'charges sociales', 'cotisations patronales', 'cotisations salariales', 'assiette cotisations'],
  '2017-01-01',
  'en_vigueur',
  'legifrance',
  now()
),
(
  'L.241-13',
  'code_securite_sociale',
  'Réduction générale des cotisations patronales (ex-Fillon)',
  'Les cotisations à la charge de l''employeur au titre des assurances sociales, des allocations familiales et des accidents du travail font l''objet d''une réduction dégressive appliquée aux rémunérations n''excédant pas 1,6 SMIC.',
  'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042683657',
  'cotisations',
  ARRAY['réduction Fillon', 'allègement cotisations', 'réduction générale', 'cotisations patronales', 'exonération'],
  '2019-01-01',
  'en_vigueur',
  'legifrance',
  now()
),

-- === TRANSPARENCE SALARIALE ===
(
  'Directive (UE) 2023/970',
  'directive_eu',
  'Transparence des rémunérations et égalité de rémunération femmes-hommes',
  'La directive européenne 2023/970 du 10 mai 2023 renforce la transparence des rémunérations et l''application du principe de l''égalité de rémunération entre les femmes et les hommes. Elle impose aux employeurs de communiquer les critères de fixation des rémunérations, d''informer les candidats du salaire initial ou de la fourchette, et de publier l''écart de rémunération entre les sexes. Transposition obligatoire avant le 7 juin 2026.',
  'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32023L0970',
  'transparence_salariale',
  ARRAY['transparence salariale', 'égalité salariale', 'directive européenne', 'écart de rémunération', 'index égalité', 'transparence rémunération 2026'],
  '2026-06-07',
  'en_vigueur',
  'legifrance',
  now()
),

-- === RUPTURE DE CONTRAT ===
(
  'L.1234-1',
  'code_travail',
  'Préavis de licenciement',
  'Lorsque le licenciement n''est pas motivé par une faute grave, le salarié a droit à un préavis dont la durée est déterminée par la loi, la convention collective ou les usages. Le préavis est d''un mois pour une ancienneté de six mois à deux ans, et de deux mois au-delà de deux ans.',
  'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006901112',
  'rupture_contrat',
  ARRAY['préavis', 'licenciement', 'rupture contrat', 'indemnité licenciement', 'préavis licenciement'],
  '2008-06-27',
  'en_vigueur',
  'legifrance',
  now()
),
(
  'L.1237-11',
  'code_travail',
  'Rupture conventionnelle',
  'L''employeur et le salarié peuvent convenir en commun des conditions de la rupture du contrat de travail qui les lie. La rupture conventionnelle, exclusive du licenciement ou de la démission, ne peut être imposée par l''une ou l''autre des parties.',
  'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000019071194',
  'rupture_contrat',
  ARRAY['rupture conventionnelle', 'rupture amiable', 'indemnité rupture conventionnelle', 'homologation'],
  '2008-06-27',
  'en_vigueur',
  'legifrance',
  now()
),

-- === EMBAUCHE ===
(
  'L.1221-10',
  'code_travail',
  'Déclaration préalable à l''embauche (DPAE)',
  'L''embauche d''un salarié ne peut intervenir qu''après déclaration nominative accomplie par l''employeur auprès des organismes de protection sociale. La DPAE doit être effectuée au plus tôt dans les 8 jours précédant la date prévisible de l''embauche.',
  'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006900830',
  'embauche',
  ARRAY['DPAE', 'déclaration embauche', 'embauche salarié', 'formalités embauche', 'déclaration préalable'],
  '2008-05-01',
  'en_vigueur',
  'legifrance',
  now()
),

-- === TÉLÉTRAVAIL ===
(
  'L.1222-9',
  'code_travail',
  'Définition et mise en place du télétravail',
  'Le télétravail désigne toute forme d''organisation du travail dans laquelle un travail qui aurait également pu être exécuté dans les locaux de l''employeur est effectué par un salarié hors de ces locaux de façon volontaire en utilisant les technologies de l''information et de la communication. Le télétravail est mis en place dans le cadre d''un accord collectif ou, à défaut, dans le cadre d''une charte élaborée par l''employeur.',
  'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036262958',
  'teletravail',
  ARRAY['télétravail', 'travail à distance', 'remote', 'accord télétravail', 'charte télétravail'],
  '2017-09-24',
  'en_vigueur',
  'legifrance',
  now()
),

-- === FORMATION ===
(
  'L.6323-1',
  'code_travail',
  'Compte personnel de formation (CPF)',
  'Toute personne active, dès son entrée sur le marché du travail et jusqu''à la date à laquelle elle fait valoir l''ensemble de ses droits à la retraite, acquiert des droits au titre du compte personnel de formation. Le CPF est alimenté en euros à hauteur de 500 euros par an (plafonné à 5 000 euros) pour un salarié à temps plein.',
  'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037385798',
  'formation',
  ARRAY['CPF', 'compte personnel de formation', 'formation professionnelle', 'droit formation'],
  '2019-01-01',
  'en_vigueur',
  'legifrance',
  now()
);
