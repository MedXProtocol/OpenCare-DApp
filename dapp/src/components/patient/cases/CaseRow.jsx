import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Modal } from 'react-bootstrap'
import { caseStatusToName, caseStatusToClass } from '~/utils/case-status-labels'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faCheck from '@fortawesome/fontawesome-free-solid/faCheck';
import { getAccount } from '~/services/sign-in'
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
  const diagnosingDoctor = cacheCallValue(state, caseAddress, 'diagnosingDoctor')
  const challengingDoctor = cacheCallValue(state, caseAddress, 'challengingDoctor')
  const encryptedCaseKey = cacheCallValue(state, caseAddress, 'encryptedCaseKey')
  const caseKeySalt = cacheCallValue(state, caseAddress, 'caseKeySalt')
  const status = cacheCallValue(state, caseAddress, 'status')
  return {
    status,
    encryptedCaseKey,
    caseKeySalt,
    diagnosingDoctor,
    challengingDoctor,
    diagnosingDoctorPublicKey: cacheCallValue(state, AccountManager, 'publicKeys', diagnosingDoctor),
    challengingDoctorPublicKey: cacheCallValue(state, AccountManager, 'publicKeys', challengingDoctor),
    AccountManager
  }
}

export function* caseRowSaga({ caseAddress, AccountManager }) {
  if (!caseAddress || !AccountManager) { return {} }
  yield addContract({ address: caseAddress, contractKey: 'Case' })
  yield cacheCall(caseAddress, 'encryptedCaseKey')
  yield cacheCall(caseAddress, 'caseKeySalt')
  let status = yield cacheCall(caseAddress, 'status')
  if (status === '3') {
    let diagnosingDoctor = yield cacheCall(caseAddress, 'diagnosingDoctor')
    yield cacheCall(AccountManager, 'publicKeys', diagnosingDoctor)
  } else if (status === '8') {
    let challengingDoctor = yield cacheCall(caseAddress, 'challengingDoctor')
    yield cacheCall(AccountManager, 'publicKeys', challengingDoctor)
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
    const caseKeySalt = this.props.caseKeySalt.substring(2)
    const { send, caseAddress } = this.props
    if (status === '3') {
      let doctor = this.props.diagnosingDoctor
      let doctorPublicKey = this.props.diagnosingDoctorPublicKey.substring(2)
      const doctorEncryptedCaseKey = reencryptCaseKey({account: getAccount(), encryptedCaseKey, doctorPublicKey, caseKeySalt})
      send(caseAddress, 'setDiagnosingDoctor', doctor, '0x' + doctorEncryptedCaseKey)()
    } else if (status === '8') {
      let doctor = this.props.challengingDoctor
      let doctorPublicKey = this.props.challengingDoctorPublicKey.substring(2)
      const doctorEncryptedCaseKey = reencryptCaseKey({account: getAccount(), encryptedCaseKey, doctorPublicKey, caseKeySalt})
      send(caseAddress, 'setChallengingDoctor', doctor, '0x' + doctorEncryptedCaseKey)()
    }
  }

  render () {
    if (!this.props.status) { return <tr></tr> }

    const status = +(this.props.status || '0')
    if (status === 3 || status === 8) {
      var approvalButton = (
        <button className='btn btn-xs btn-primary' onClick={this.onApprove}>
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
        <td className="eth-address text">
          <span>
            <Link to={`/patients/cases/${this.props.caseAddress}`}>{this.props.caseAddress}</Link>
          </span>
        </td>
        <td width="15%" className="td--status">
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
