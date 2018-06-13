import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Modal } from 'react-bootstrap'
import { caseStatusToName, caseStatusToClass } from '~/utils/case-status-labels'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faCheck from '@fortawesome/fontawesome-free-solid/faCheck';
import { signedInSecretKey } from '~/services/sign-in'
import {
  cacheCall,
  cacheCallValue,
  withContractRegistry,
  withSend
} from '~/saga-genesis'
import reencryptCaseKey from '~/services/reencrypt-case-key'
import { contractByName } from '~/saga-genesis/state-finders'
import { addContract } from '~/saga-genesis/sagas'

export function mapStateToCaseRowProps(state, { caseAddress }) {
  const AccountManager = contractByName(state, 'AccountManager')
  const diagnosingDoctorA = cacheCallValue(state, caseAddress, 'diagnosingDoctorA')
  const diagnosingDoctorB = cacheCallValue(state, caseAddress, 'diagnosingDoctorB')
  const encryptedCaseKey = cacheCallValue(state, caseAddress, 'encryptedCaseKey')
  const status = cacheCallValue(state, caseAddress, 'status')
  return {
    status,
    encryptedCaseKey,
    diagnosingDoctorA,
    diagnosingDoctorB,
    diagnosingDoctorAPublicKey: cacheCallValue(state, AccountManager, 'publicKeys', diagnosingDoctorA),
    diagnosingDoctorBPublicKey: cacheCallValue(state, AccountManager, 'publicKeys', diagnosingDoctorB),
    AccountManager
  }
}

export function* caseRowSaga({ caseAddress, AccountManager }) {
  if (!caseAddress || !AccountManager) { return {} }
  yield addContract({ address: caseAddress, contractKey: 'Case' })
  yield cacheCall(caseAddress, 'encryptedCaseKey')
  let status = yield cacheCall(caseAddress, 'status')
  if (status === '3') {
    let diagnosingDoctorA = yield cacheCall(caseAddress, 'diagnosingDoctorA')
    yield cacheCall(AccountManager, 'publicKeys', diagnosingDoctorA)
  } else if (status === '8') {
    let diagnosingDoctorB = yield cacheCall(caseAddress, 'diagnosingDoctorB')
    yield cacheCall(AccountManager, 'publicKeys', diagnosingDoctorB)
  }
}

export const CaseRowContainer = withContractRegistry(withSend(class _CaseRow extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {}
  }

  componentDidMount () {
    this.init(this.props)
  }

  componentWillReceiveProps (props) {
    this.init(props)
  }

  init (props) {
    if (props.showModal) {
      this.setState({showModal: true})
    }
  }

  onApprove = () => {
    this.setState({showModal: false})
    const status = this.props.status
    const encryptedCaseKey = this.props.encryptedCaseKey.substring(2)
    const { send, caseAddress } = this.props
    if (status === '3') {
      let doctor = this.props.diagnosingDoctorA
      let doctorPublicKey = this.props.diagnosingDoctorAPublicKey.substring(2)
      const doctorEncryptedCaseKey = reencryptCaseKey({secretKey: signedInSecretKey(), encryptedCaseKey, doctorPublicKey})
      send(caseAddress, 'authorizeDiagnosisDoctor', doctor, '0x' + doctorEncryptedCaseKey)()
    } else if (status === '8') {
      let doctor = this.props.diagnosingDoctorB
      let doctorPublicKey = this.props.diagnosingDoctorBPublicKey.substring(2)
      const doctorEncryptedCaseKey = reencryptCaseKey({secretKey: signedInSecretKey(), encryptedCaseKey, doctorPublicKey})
      send(caseAddress, 'authorizeChallengeDoctor', doctor, '0x' + doctorEncryptedCaseKey)()
    }
  }

  render () {
    if (!this.props.status) { return <tr></tr> }

    const status = +(this.props.status || '0')
    if (status === 3 || status === 8) {
      var approvalButton = (
        <button className='btn btn-sm btn-primary' onClick={this.onApprove}>
          <FontAwesomeIcon
            icon={faCheck}
            size='lg' />
          &nbsp; Approve
        </button>
      )
    }

    var modal =
      <Modal show={this.state.showModal}>
        <Modal.Body>
          <div className="row">
            <div className="col-xs-12 text-center">
              <h4>A doctor has requested to diagnose your case.  Do you approve?</h4>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button onClick={() => this.setState({showModal: false})} type="button" className="btn btn-link">No</button>
          <button onClick={this.onApprove} type="button" className="btn btn-primary">Yes</button>
        </Modal.Footer>
      </Modal>

    return (
      <tr>
        {modal}
        <td width="5%" className="text-center">{this.props.caseIndex+1}</td>
        <td><Link to={`/patients/cases/${this.props.caseAddress}`}>{this.props.caseAddress}</Link></td>
        <td className="eth-address text" width="10%">
          <label className={`label label-${caseStatusToClass(status)}`}>
            {caseStatusToName(status)}
          </label>
        </td>
        <td width="15%" className="td-actions text-right">
          {approvalButton}
        </td>
      </tr>
    )
  }
}))

CaseRowContainer.propTypes = {
  caseAddress: PropTypes.string,
  caseIndex: PropTypes.any,
  showModal: PropTypes.bool
}
