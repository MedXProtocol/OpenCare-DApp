import React from 'react'
import { Link } from 'react-router-dom'
import { DrizzleComponent } from '@/components/drizzle-component'
import PropTypes from 'prop-types'
import { drizzleConnect } from 'drizzle-react'
import {
  getCaseContract,
  getCaseStatus,
  getAccountManagerContract
} from '@/utils/web3-util'
import { caseStatusToName } from '@/utils/case-status-to-name'
import get from 'lodash.get'
import dispatch from '@/dispatch'
import { approveDiagnosisRequest } from '@/services/request-approval'
import bytesToHex from '@/utils/bytes-to-hex'
import { signedInSecretKey } from '@/services/sign-in'
import { withPropSaga } from '@/saga-genesis/with-prop-saga'
import reencryptCaseKey from '@/services/reencrypt-case-key'

function mapStateToProps(state, ownProps) {
  let accessor = `contracts[${ownProps.caseAddress}]`
  let contractState = get(state, accessor)
  return {
    contractState
  }
}

function* propSaga(ownProps) {
  if (!ownProps.caseAddress) { return {} }

  const props = {}
  props.caseContract = yield getCaseContract(ownProps.caseAddress)

  props.status = yield getCaseStatus(ownProps.caseAddress)
  props.encryptedCaseKey = bytesToHex(yield props.caseContract.methods.getEncryptedCaseKey().call())

  const accountManager = yield getAccountManagerContract()
  if (props.status.code === 3) {
    props.diagnosingDoctorA = yield props.caseContract.methods.diagnosingDoctorA().call()
    props.diagnosingDoctorAPublicKey = (yield accountManager.methods.publicKeys(props.diagnosingDoctorA).call()).substring(2)
  } else if (props.status.code === 8) {
    props.diagnosingDoctorB = yield props.caseContract.methods.diagnosingDoctorB().call()
    props.diagnosingDoctorBPublicKey = (yield accountManager.methods.publicKeys(props.diagnosingDoctorB).call()).substring(2)
  }

  return props
}

export const CaseRow = drizzleConnect(withPropSaga(propSaga, class _CaseRow extends DrizzleComponent {
  onApprove = () => {
    const status = this.props.status

    if (status.code === 3) {
      let doctor = this.props.diagnosingDoctorA
      let doctorPublicKey = this.props.diagnosingDoctorAPublicKey
      const doctorEncryptedCaseKey = reencryptCaseKey({secretKey: signedInSecretKey(), encryptedCaseKey: this.props.encryptedCaseKey, doctorPublicKey})
      this.props.caseContract.methods.authorizeDiagnosisDoctor(doctor, '0x' + doctorEncryptedCaseKey).send()
    } else if (status.code === 8) {
      let doctor = this.props.diagnosingDoctorB
      let doctorPublicKey = this.props.diagnosingDoctorBPublicKey
      const doctorEncryptedCaseKey = reencryptCaseKey({secretKey: signedInSecretKey(), encryptedCaseKey: this.props.encryptedCaseKey, doctorPublicKey})
      this.props.caseContract.methods.authorizeChallengeDoctor(doctor, '0x' + doctorEncryptedCaseKey).send()
    }
  }

  render () {
    if (!this.props.status) { return <tr></tr> }

    const status = this.props.status
    if (status.code === 3 || status.code === 8) {
      var approvalButton = <button className='btn btn-primary' onClick={this.onApprove}>Approve</button>
    }

    return (
      <tr>
        <td className="text-center">{this.props.caseIndex}</td>
        <td><Link to={`/patient-case/${this.props.caseAddress}`}>{this.props.caseAddress}</Link></td>
        <td>{caseStatusToName(status.code)}</td>
        <td className="td-actions text-right">
          {approvalButton}
        </td>
      </tr>
    )
  }
}), mapStateToProps)

CaseRow.propTypes = {
  caseAddress: PropTypes.string,
  caseIndex: PropTypes.any
}
