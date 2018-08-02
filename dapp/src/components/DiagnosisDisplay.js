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
        visibleIf={diagnosis.overTheCounterRecommendation.length > 0}
      />

      <HippoStringDisplay
        label="Prescription Medication:"
        value={diagnosis.prescriptionRecommendation}
        visibleIf={diagnosis.prescriptionRecommendation.length > 0}
      />

      <HippoStringDisplay
        label="Side Effects:"
        value={diagnosis.sideEffects}
        visibleIf={diagnosis.sideEffects.length > 0}
      />

      <HippoStringDisplay
        label="Additional Side Effects:"
        value={diagnosis.sideEffectsAdditional}
        visibleIf={diagnosis.sideEffectsAdditional.length > 0}
      />

      <HippoStringDisplay
        label="Counseling:"
        value={diagnosis.counseling}
        visibleIf={diagnosis.counseling.length > 0}
      />

      <HippoStringDisplay
        label="Additional Counseling:"
        value={diagnosis.counselingAdditional}
        visibleIf={diagnosis.counselingAdditional.length > 0}
      />

      <HippoStringDisplay
        label="Personal Message:"
        value={diagnosis.personalMessage}
        visibleIf={diagnosis.personalMessage.length > 0}
      />
    </React.Fragment>
  )
}

DiagnosisDisplay.propTypes = {
  diagnosis: PropTypes.object.isRequired
}
