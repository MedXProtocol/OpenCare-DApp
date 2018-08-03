import React from 'react'
import PropTypes from 'prop-types'
import { HippoStringDisplay } from '~/components/HippoStringDisplay'

export const DiagnosisDisplay = ({ diagnosis }) => {
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
        value={diagnosis.sideEffects}
        visibleIf={!!diagnosis.sideEffects}
      />

      <HippoStringDisplay
        label="Additional Side Effects:"
        value={diagnosis.sideEffectsAdditional}
        visibleIf={!!diagnosis.sideEffectsAdditional}
      />

      <HippoStringDisplay
        label="Counseling:"
        value={diagnosis.counseling}
        visibleIf={!!diagnosis.counseling}
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
