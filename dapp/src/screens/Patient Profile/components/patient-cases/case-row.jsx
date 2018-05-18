import React from 'react'
import { Link } from 'react-router-dom'
import { DrizzleComponent } from '@/components/drizzle-component'
import PropTypes from 'prop-types'
import { drizzleConnect } from 'drizzle-react'
import { withCaseManager } from '@/drizzle-helpers/with-case-manager'
import { withAccountManager } from '@/drizzle-helpers/with-account-manager'
import { getCaseContract } from '@/utils/web3-util'
import { caseStatusToName } from '@/utils/case-status-to-name'
import get from 'lodash.get'
import dispatch from '@/dispatch'
import { approveDiagnosisRequest } from '@/services/request-approval'
import bytesToHex from '@/utils/bytes-to-hex'
import aes from '@/services/aes'
import { signedInSecretKey } from '@/services/sign-in'
import { deriveSharedKey } from '@/services/derive-shared-key'

function mapStateToProps(state, ownProps) {
  let accessor = `contracts[${ownProps.caseAddress}]`
  let contractState = get(state, accessor)
  return {
    contractState
  }
}

export const CaseRow = drizzleConnect(withCaseManager(withAccountManager(class _CaseRow extends DrizzleComponent {
  drizzleInit (props) {
    const { drizzle } = this.context
    const contract = drizzle.contracts[props.caseAddress]
    const AccountManager = drizzle.contracts.AccountManager
    if (!props.contractState) {
      getCaseContract(props.caseAddress).then((contract) => {
        drizzle.addContract({
          contractName: props.caseAddress,
          web3Contract: contract
        })
      })
    } else if (contract) {
      var newState = {}
      newState.statusKey = contract.methods.status.cacheCall()
      newState.diagnosingDoctorAKey = contract.methods.diagnosingDoctorA.cacheCall()
      newState.encryptedKeyKey = contract.methods.getEncryptedCaseKey.cacheCall()
      this.setState(newState)
    }
  }

  contract (key) {
    return get(this.props.contractState, key)
  }

  onApprove = () => {
    const drizzle = this.context.drizzle
    const contract = drizzle.contracts[this.props.caseAddress]
    const status = this.status()
    this.setState({ test: 'foo' })
    if (status === '2') {
      const diagnosingDoctorA = this.diagnosingDoctorA()
      const diagnosingDoctorAPublicKey = this.diagnosingDoctorAPublicKey().substring(2)
      const encryptedCaseKey = bytesToHex(this.encryptedCaseKey())
      const secretKey = signedInSecretKey()
      const caseKey = aes.decrypt(encryptedCaseKey, secretKey)
      const sharedKey = deriveSharedKey(secretKey, diagnosingDoctorAPublicKey)
      const doctorEncryptedCaseKey = aes.encrypt(caseKey, sharedKey)

      contract.methods.authorizeDiagnosisDoctor.cacheSend(diagnosingDoctorA, '0x' + doctorEncryptedCaseKey)
    } else if (status === '7') {
    }
  }

  checkStateKey (fieldName, key, rootState = 'contractState') {
    var value = null
    if (this.state[key]) {
      value = get(this.props, `${rootState}.${fieldName}[${this.state[key]}].value`)
    }
    return value
  }

  status () {
    return this.checkStateKey('status', 'statusKey')
  }

  encryptedCaseKey () {
    return this.checkStateKey('getEncryptedCaseKey', 'encryptedKeyKey')
  }

  diagnosingDoctorA () {
    return this.checkStateKey('diagnosingDoctorA', 'diagnosingDoctorAKey')
  }

  diagnosingDoctorAPublicKey () {
    return this.checkStateKey('publicKeys', 'diagnosingDoctorAPublicKeyKey', 'contracts.AccountManager')
  }

  render () {
    let diagnosingDoctorA = this.diagnosingDoctorA()
    if (diagnosingDoctorA) {
      if (!this.state.diagnosingDoctorAPublicKeyKey) {
        const AccountManager = this.context.drizzle.contracts.AccountManager
        this.setState({diagnosingDoctorAPublicKeyKey: AccountManager.methods.publicKeys.cacheCall(diagnosingDoctorA)})
      }
    }

    var status = this.status()

    if (status === '2' || status === '7') {
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
})), mapStateToProps)

CaseRow.propTypes = {
  caseAddress: PropTypes.string,
  caseIndex: PropTypes.any
}
