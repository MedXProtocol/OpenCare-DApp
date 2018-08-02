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

const topicalMedications = [
  "Apply Hydrocortisone 2.5% cream twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed",
  "Apply Hydrocortisone 2.5% ointment twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed",
  "Apply Desonide 0.05% cream twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed",
  "Apply Desonide 0.05% ointment twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed",
  "Apply Triamcinolone 0.025% cream twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed",
  "Apply Triamcinolone 0.025% ointment twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed",
  "Apply Triamcinolone 0.1% cream twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed",
  "Apply Triamcinolone 0.1% ointment twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed",
  "Apply Clobetasol 0.05% cream twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed",
  "Apply Clobetasol 0.05% ointment twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed",
  "Apply Calcipotriene (Dovonex) 0.005% ointment twice daily Monday through Friday on weeks not using topical steroids",
  "Apply Fluocinonide 0.05% topical solution twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed",
  "Apply Terbinafine 1% cream twice daily for 3 weeks",
  "Apply Ketoconazole 2% cream twice daily",
  "Apply Ketoconazole 2% shampoo 2 to 3 times per week",
  "Apply Clindamycin 1% lotion twice daily",
  "Apply Clindamycin 1% topical solution twice daily",
  "Apply Metronidazole 1% topical gel twice daily",
  "Apply Sarna lotion twice daily at site of itching",
  "Apply Permethrin 5% cream to your entire body (neck and below) for 8 hours overnight and wash in the morning. Repeat this treatment exactly 1 week later",
  "Apply Mupirocin 2% ointment 3 times daily for 10 days",
  "Apply 5-Fluorouracil (Efudex) 5% cream twice daily to affected areas for 3 weeks, followed by Triamcinolone 0.1% cream twice daily for 1 week",
  "Apply imiquimod (Aldara) 5% cream to affected areas every night",
  "Apply 20% urea cream twice daily",
  "Apply 40% urea cream twice daily",
  "Apply Ciclopirox 8% (Penlac) topical solution to affected nails at bed time for 7 days and then remove with nail polish remover. Repeat"
]

const oralMedications = [
  "Take Cetirizine 10 mg twice daily for itching",
  "Take Hydroxyzine 25 mg every night for itching",
  "Take Cephalexin 500 mg three times daily for 10 days",
  "Take Doxycycine 100 mg twice daily for 10 days",
  "Take Doxycycline 100 mg twice daily for 3 months",
  "Take Minocycline 100 mg twice daily for 3 months",
  "Take Cephalexin 500 mg twice daily for 3 months",
  "Take Terbinafine 250 mg once daily for 6 weeks. Your liver enzymes will need to be checked before and during treatment",
  "Take Terbinafine 250 mg once daily for 12 weeks. Your liver enzymes will need to be checked before and during treatment"
]

const procedures = [
  "Recommend a biopsy by shave to help diagnose your condition",
  "Recommend a punch biopsy to help diagnose your condition",
  "Recommend an excisional biopsy with 2-4 mm margins to help diagnose your condition",
  "Recommend cryotherapy with liquid nitrogen. Your physician should treat the area three times. If there is no resolution after 2 months, another round of cryotherapy may be helpful. If this does not help, then a biopsy may be necessary",
  "This is a benign lesion, but cryotherapy with liquid nitrogen may be helpful"
]

const other = [
  "You may have a more complex condition that should be evaluated by your primary care physician or local dermatologist. We highly encourage you to seek a live consultation"
]

export const groupedRecommendationOptions = {
  "overTheCounter": {
    "label": "Medication(s)",
    "options": overTheCounter.map(option => ({ "value": option, "label": option }))
  },
  "topicalMedications": {
    "label": "Topical Medications",
    "options": topicalMedications.map(option => ({ "value": option, "label": option }))
  },
  "oralMedications": {
    "label": "Oral Medications",
    "options": oralMedications.map(option => ({ "value": option, "label": option }))
  },
  "procedures": {
    "label": "Procedures",
    "options": procedures.map(option => ({ "value": option, "label": option }))
  },
  "other": {
    "label": "Other",
    "options": other.map(option => ({ "value": option, "label": option }))
  }
}
