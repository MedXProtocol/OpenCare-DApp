const overTheCounter = [
  'Systane artificial tears',
  'Refresh artificial tears',
  'Artificial tears (liquid)',
  'Artificial tears (gel)',
  'Lacrilube ointment',
  'CeraVe',
  'Aquaphor',
  'Zaditor (Ketotifen) eye drops',
  'Hydrocortisone 1% cream',
  'Irrigate profusely with water',
  'Johnson’s baby shampoo',
  'Warm compresses',
  'Keep head of bed elevated'
]

const prescriptionMedications = [
  'Gatifloxacin eye drops',
  'Ofloxacin eye drops',
  'Moxifloxacin eye drops',
  'Ciprofloxacin eye drops',
  'Gentamicin eye drops',
  'Maxitrol eye ointment (dexamethasone / neomycin / polymyxin b)',
  'Polytrim (polymyxin B and trimethoprim) eye ointment',
  'Erythromycin eye ointment',
  'Latanoprost 0.005% eye drops',
  'Travoprost 0.004% eye drops',
  'Bimatoprost eye drops',
  'Brimonidine 0.15% eye drops',
  'Timolol 0.5% eye drops',
  'Dorzolamide eye drops',
  'Dorzolamide/Timolol 0.5%',
  'Brimonidine 0.2%/Timolol 0.5%',
  'Pilocarpine eye drops',
  'Homatropine eye drops',
  'Atropine eye drops',
  'Tropicamide eye drops',
  'Cyclopentolate eye drops',
  'Phenylephrine eye drops',
  'Prednisolone acetate 1% eye drops',
  'Difluprednate 0.05%',
  'Fluorometholone 0.1% eye drops',
  'Loteprednol 0.5% eye gel',
  'Tobramycin/Dexamethasone ointment',
  'Diamox (acetazolamide) 250mg',
  'Diamox (acetazolamide) 500mg',
  'Methazolamide 25mg',
  'Hydrocortisone 2.5% cream',
  'Hydrocortisone 2.5% ointment',
  'Cephalexin 500 mg',
  'Doxycycine 100 mg',
  'Doxycycine 50 mg',
  'Augmentin (amoxicillin/clavulanate) 250 mg',
  'Augmentin (amoxicillin/clavulanate) 500 mg'
]

export const groupedRecommendationOptions = {
  "overTheCounter": {
    "label": "Choose Over-the-Counter Medication",
    "options": overTheCounter.map(option => ({ "value": option, "label": option }))
  },
  "prescriptionMedications": {
    "label": "Choose Prescription Medication",
    "options": prescriptionMedications.map(option => ({ "value": option, "label": option }))
  }
}
