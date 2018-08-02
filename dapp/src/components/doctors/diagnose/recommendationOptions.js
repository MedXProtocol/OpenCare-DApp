const overTheCounter = [
  'Vaseline',
  'Neutrogena Norwegian Formula',
  'CeraVe',
  'AmLactin',
  'Aquaphor',
  'Hydrocortisone 1% cream',
  'Medicated shampoo such as Selenium Chloride or Head and Shoulders',
  'Lukewarm water while showering',
  'Lotion after showering',
  'No further treatments needed'
]

const prescriptionMedications = [
  'Hydrocortisone 2.5% cream',
  'Hydrocortisone 2.5% ointment',
  'Desonide 0.05% cream',
  'Desonide ointment',
  'Triamcinolone 0.025% cream',
  'Triamcinolone 0.025% ointment',
  'Triamcinolone 0.1% cream',
  'Triamcinolone 0.1% ointment',
  'Clobetasol 0.05% cream',
  'Clobetasol 0.05% ointment',
  'Calcipotriene (Dovonex) 0.005% ointment',
  'Fluocinonide 0.05% topical solution',
  'Terbinafine 1% cream',
  'Ketoconazole 2% cream',
  'Ketoconazole 2% shampoo',
  'Clindamycin 1% lotion',
  'Clindamycin 1% topical solution',
  'Metronidazole 1% topical gel',
  'Sarna lotion',
  'Permethrin 5% cream',
  'Mupirocin 2% ointment',
  '5-Fluorouracil (Efudex) 5% cream',
  'Imiquimod (Aldara) 5% cream',
  'Urea cream 20%',
  'Urea cream 40%',
  'Ciclopirox 8% (Penlac) topical solution',
  'Cetirizine 10 mg',
  'Hydroxyzine 25 mg',
  'Cephalexin 500 mg',
  'Doxycycine 100 mg',
  'Doxycycline 100 mg',
  'Minocycline 100 mg',
  'Cephalexin 500 mg',
  'Terbinafine 250 mg',
  'Terbinafine 250 mg'
]

export const groupedRecommendationOptions = {
  "overTheCounter": {
    "label": "Medication(s)",
    "options": overTheCounter.map(option => ({ "value": option, "label": option }))
  },
  "prescriptionMedications": {
    "label": "Medication(s)",
    "options": prescriptionMedications.map(option => ({ "value": option, "label": option }))
  }
}
