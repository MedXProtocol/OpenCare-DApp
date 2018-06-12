const infectionMitesOptions = [
  "Abscess",
  "Infected Wound (Possibly secondary to biopsy)",
  "Cellulitis",
  "Folliculitis",
  "Cold sores / Herpes Simplex Virus 1",
  "Genital Vesicles / Genital Sores / Herpes Simplex Virus 2",
  "Genital Warts / Condyloma Acuminata",
  "Scabies",
  "Lice",
  "Onychomycosis",
  "Tinea Corporis",
  "Tinea Manuum",
  "Tinea Pedis",
  "Tinea Cruris",
  "Sexually Transmitted Disease"
]

const benignGrowthsOptions = [
  "Epidermoid Cyst",
  "Pilar Cyst",
  "Dilated Comedone",
  "Seborrheic Keratosis",
  "Cherry Angioma",
  "Abrasion / Erosion",
  "Bruise / Ecchymosis",
  "Dry Skin / Xerosis",
  "Insect Bite / Arthropod Bite",
  "Blister / Bulla",
  "Benign Nevus",
  "Dysplastic nevus / Atypical Nevus",
  "Congenital nevus",
  "Skin Tag / Acrochordon",
  "Verruca Vulgaris / Common Warts",
  "Plantar Warts",
  "Sunburn",
  "Photodamage",
  "Hypertrophic Scar",
  "Keloid",
  "Callus / Corn",
  "Ulcer",
  "Rheumatoid Nodule",
  "Milium / Milia",
  "Fox Fordyce",
  "Talon Noir",
  "Flat wart",
  "Solar Lentigo",
  "Mucosal Melanotic Macule",
  "Freckle / Ephelid",
  "Nevus Spilus",
  "Syringoma",
  "Sebaceous Hyperplasia",
  "Lipoma",
  "Vascular Malformation",
  "Lymphatic Malformation",
  "Angiokeratoma",
  "Glomus Tumor",
  "Halo Nevus",
  "Halo Nevus",
  "Lymphedema"
]

const precancerousOptions = [
  "Basal Cell Carcinoma",
  "Squamous Cell Carcinoma",
  "Melanoma",
  "Sebaceous Carcinoma",
  "Squamous Cell Carcinoma Keratoacanthoma Type",
  "Actinic Keratosis",
  "Dermatofibrosarcoma Protuberans"
]

const acneOptions = [
  "Mild Acne",
  "Moderate Acne",
  "Severe / Nodulocystic Acne",
  "Neonatal Acne",
  "Infantile Acne",
  "Papulopustular Rosacea",
  "Erythematotelangiectatic Rosacea",
  "Ocular Rosacea",
  "Rhinophyma",
  "Perioral / Periorificial Dermatitis"
]

const rashesOptions = [
  "Atopic Dermatitis / Eczema",
  "Contact Dermatitis",
  "Drug Rash",
  "Psoriasis",
  "Lichen Planus",
  "Lichen Planus Pigmentosus",
  "Pityriasis Rosea",
  "Shingles / Herpes Zoster / VZV reactivation",
  "Seborrheic Dermatitis",
  "Nummular Eczema",
  "Stasis Dermatitis",
  "Urticaria / Hives",
  "Lupus",
  "Morphea",
  "Lichen Sclerosus et Atrophicus",
  "Darier's Disease",
  "Hailey - Hailey Disease",
  "Granuloma Annulare",
  "Necrobiosis Lipoidica Diabeticorum",
  "Necrobiotic Xanthogranuloma",
  "Sarcoidosis / Lupus Pernio",
  "Angioedema",
  "Erythema Chronicum Migrans",
  "Mastocytosis",
  "Erythema Ab Igne",
  "Macular Amyloidosis",
  "Lichen Amyloidosis",
  "Nodular Amyloidosis",
  "Prurigo Nodularis",
  "Lichen Simplex Chronicus",
  "Notalgia Paresthetica",
  "Palmoplantar Keratoderma",
  "Vitiligo",
  "Poison Ivy / Poison Oak / Poison Sumac Contact Dermatitis"
]

const hairLossOptions = [
  "Androgenetic Alopecia",
  "Alopecia Areata",
  "Lichen Planopilaris",
  "Central Centrifugal Cicatricial Alopecia",
  "Telogen Effluvium",
  "Traction Alopecia"
]

const otherOptions = [
  "Juvenile Xanthogranuloma",
  "Lymphedema",
  "Nail pitting",
  "Onycholysis",
  "Pterygium",
  "Idiopathic Guttate Hypomelanosis",
  "Progressive Macular hypomelanosis",
  "Erythema Toxicum Neonatorum",
  "Transient Pustular Melanosis",
  "Becker's Nevus",
  "Neoplasm of Uncertain Behavior",
  "Other"
]

export const groupedDiagnosisOptions = [
  {
    "label": "Infection / Mites",
    "options": infectionMitesOptions.map(option => ({ "value": option, "label": option }))
  },
  {
    "label": "Benign Growths / Benign Lesions / Nevi / Common Skin Findings",
    "options": benignGrowthsOptions.map(option => ({ "value": option, "label": option }))
  },
  {
    "label": "Precancerous & Cancerous Growths / Lesions",
    "options": precancerousOptions.map(option => ({ "value": option, "label": option }))
  },
  {
    "label": "Acne / Rosacea / Periorificial Dermatitis",
    "options": acneOptions.map(option => ({ "value": option, "label": option }))
  },
  {
    "label": "Rashes",
    "options": rashesOptions.map(option => ({ "value": option, "label": option }))
  },
  {
    "label": "Other",
    "options": otherOptions.map(option => ({ "value": option, "label": option }))
  }
]
