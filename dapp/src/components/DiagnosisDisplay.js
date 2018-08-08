import React from 'react'
import PropTypes from 'prop-types'
import { HippoStringDisplay } from '~/components/HippoStringDisplay'
import { sideEffectValues, counselingValues } from '~/sideEffectsAndCounselingValues'

export const DiagnosisDisplay = ({ diagnosis }) => {
  let [ sideEffectsText, counselingText ] = [ [], [] ]

  if (diagnosis.sideEffectValuesChosen) {
    diagnosis.sideEffectValuesChosen.sort().forEach(index => {
      sideEffectsText.push(sideEffectValues[index])
    })
  }

  if (diagnosis.counselingValuesChosen) {
    diagnosis.counselingValuesChosen.sort().forEach(index => {
      counselingText.push(counselingValues[index])
    })
  }

  const autopopulatedSideEffectsText = sideEffectsText.join('<br/><br/>')
  const autopopulatedCounselingText = counselingText.join('<br/><br/>')

  return (
    <React.Fragment>
      <HippoStringDisplay
        label="Diagnosis:"
        value={diagnosis.diagnosis}
      />

      <HippoStringDisplay
        label="Over-the-Counter Medication:"
        value={diagnosis.overTheCounterRecommendation}
        visibleIf={!!diagnosis.overTheCounterRecommendation}
      />

      <HippoStringDisplay
        label="Prescription Medication:"
        value={diagnosis.prescriptionRecommendation}
        visibleIf={!!diagnosis.prescriptionRecommendation}
      />

      <HippoStringDisplay
        label="No Further Treatment Necessary"
        value={''}
        visibleIf={diagnosis.noFurtherTreatment === 1}
      />

      <HippoStringDisplay
        label="Side Effects:"
        value={autopopulatedSideEffectsText}
        visibleIf={!!autopopulatedSideEffectsText}
      />

      <HippoStringDisplay
        label="Additional Side Effects:"
        value={diagnosis.sideEffectsAdditional}
        visibleIf={!!diagnosis.sideEffectsAdditional}
      />

      <HippoStringDisplay
        label="Counseling:"
        value={autopopulatedCounselingText}
        visibleIf={!!autopopulatedCounselingText}
      />

      <HippoStringDisplay
        label="Additional Counseling:"
        value={diagnosis.counselingAdditional}
        visibleIf={!!diagnosis.counselingAdditional}
      />

      <HippoStringDisplay
        label="Personal Message:"
        value={diagnosis.personalMessage}
        visibleIf={!!diagnosis.personalMessage}
      />
    </React.Fragment>
  )
}

DiagnosisDisplay.propTypes = {
  diagnosis: PropTypes.object.isRequired
}
