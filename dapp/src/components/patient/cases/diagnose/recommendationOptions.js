const overTheCounter = [
  "Apply Vaseline twice daily to the affected areas",
  "Apply Neutrogena Norwegian Formula twice daily to the affected areas",
  "Apply CeraVe twice daily to the affected areas",
  "Apply AmLactin twice daily to the affected areas",
  "Apply Aquaphor twice daily to the affected areas",
  "Apply Hydrocortisone 1% cream twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed",
  "Apply Hydrocortisone 1% ointment twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed",
  "Shampoo with a medicated shampoo such as selenium sulfide (selsun blue) or Head and Shoulders. Allow to sit on scalp or skin for 5 minutes prior to rinsing",
  "Use over the counter wart treatment, MediPlast (40% salicylic acid plaster), every day over the wart and wash after 24 hours. Repeat daily. It may take weeks to months for successful treatment",
  "Recommend lukewarm water while showering. Use moisturizing soaps such as Dove or Oil of Olay. Moisturize immediately after showering",
  "Avoid scratching. Cut nails short to help prevent scratching",
  "These are common, benign lesions. They rarely become cancerous",
  "No further treatments needed"
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
    "label": "Over the Counter Remedies",
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
