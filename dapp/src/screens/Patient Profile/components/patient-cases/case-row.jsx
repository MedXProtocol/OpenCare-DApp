import React from 'react'
import { Link } from 'react-router-dom'
import { DrizzleComponent } from '@/components/drizzle-component'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
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
import { withSaga, cacheCallValue, withContractRegistry } from '@/saga-genesis'
import reencryptCaseKey from '@/services/reencrypt-case-key'

function mapStateToProps(state, { caseAddress, contractRegistry }) {
  let accountManager = contractRegistry.requireAddressByName('AccountManager')
  let diagnosingDoctorA = cacheCallValue(state, caseAddress, 'diagnosingDoctorA')
  let diagnosingDoctorB = cacheCallValue(state, caseAddress, 'diagnosingDoctorB')
  return {
    status: cacheCallValue(state, caseAddress, 'status'),
    encryptedCaseKey: bytesToHex(cacheCallValue(state, caseAddress, 'getEncryptedCaseKey')),
    diagnosingDoctorA,
    diagnosingDoctorB,
    diagnosingDoctorAPublicKey: cacheCallValue(state, accountManager, 'publicKeys', diagnosingDoctorA),
    diagnosingDoctorBPublicKey: cacheCallValue(state, accountManager, 'publicKeys', diagnosingDoctorB)
  }
}

function* saga(ownProps, { cacheCall, contractRegistry }) {
  if (!ownProps.caseAddress) { return {} }

  if (!contractRegistry.hasAddress(ownProps.caseAddress)) {
    contractRegistry.add(yield getCaseContract(ownProps.caseAddress))
  }

  let accountManager = contractRegistry.requireAddressByName('AccountManager')

  yield cacheCall(ownProps.caseAddress, 'getEncryptedCaseKey')
  let status = yield cacheCall(ownProps.caseAddress, 'status')

  if (status === '3') {
    let diagnosingDoctorA = yield cacheCall(ownProps.caseAddress, 'diagnosingDoctorA')
    yield cacheCall(accountManager, 'publicKeys', diagnosingDoctorA)
  } else if (status === '8') {
    let diagnosingDoctorB = yield cacheCall(ownProps.caseAddress, 'diagnosingDoctorB')
    yield cacheCall(accountManager, 'publicKeys', diagnosingDoctorB)
  }
}

export const CaseRow = withContractRegistry(connect(mapStateToProps)(withSaga(saga, class _CaseRow extends DrizzleComponent {
  onApprove = () => {
    const status = this.props.status
    const encryptedCaseKey = this.props.encryptedCaseKey.substring(2)
    if (status.code === 3) {
      let doctor = this.props.diagnosingDoctorA
      let doctorPublicKey = this.props.diagnosingDoctorAPublicKey.substring(2)
      const doctorEncryptedCaseKey = reencryptCaseKey({secretKey: signedInSecretKey(), encryptedCaseKey, doctorPublicKey})
      this.props.caseContract.methods.authorizeDiagnosisDoctor(doctor, '0x' + doctorEncryptedCaseKey).send()
    } else if (status.code === 8) {
      let doctor = this.props.diagnosingDoctorB
      let doctorPublicKey = this.props.diagnosingDoctorBPublicKey.substring(2)
      const doctorEncryptedCaseKey = reencryptCaseKey({secretKey: signedInSecretKey(), encryptedCaseKey, doctorPublicKey})
      this.props.caseContract.methods.authorizeChallengeDoctor(doctor, '0x' + doctorEncryptedCaseKey).send()
    }
  }

  render () {
    if (!this.props.status) { return <tr></tr> }

    const status = +(this.props.status || '0')
    if (status === 3 || status === 8) {
      var approvalButton = <button className='btn btn-primary' onClick={this.onApprove}>Approve</button>
    }

    return (
      <tr>
        <td className="text-center">{this.props.caseIndex}</td>
        <td><Link to={`/patient-case/${this.props.caseAddress}`}>{this.props.caseAddress}</Link></td>
        <td>{caseStatusToName(status)}</td>
        <td className="td-actions text-right">
          {approvalButton}
        </td>
      </tr>
    )
  }
})))

CaseRow.propTypes = {
  caseAddress: PropTypes.string,
  caseIndex: PropTypes.any
}
