import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Modal } from 'react-bootstrap'
import { caseStatusToName, caseStatusToClass } from '~/utils/case-status-labels'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faCheck from '@fortawesome/fontawesome-free-solid/faCheck'
import { formatRoute } from 'react-router-named-routes'
import * as routes from '~/config/routes'
import { currentAccount } from '~/services/sign-in'
import { connect } from 'react-redux'
import {
  cacheCall,
  cacheCallValue,
  withContractRegistry,
  withSend
} from '~/saga-genesis'
import reencryptCaseKey from '~/services/reencrypt-case-key'
import { contractByName } from '~/saga-genesis/state-finders'
import { addContract } from '~/saga-genesis/sagas'
import { withSaga } from '~/saga-genesis'

function mapStateToProps(state, { caseAddress }) {
  const AccountManager = contractByName(state, 'AccountManager')
  const diagnosingDoctorA = cacheCallValue(state, caseAddress, 'diagnosingDoctorA')
  const diagnosingDoctorB = cacheCallValue(state, caseAddress, 'diagnosingDoctorB')
  const encryptedCaseKey = cacheCallValue(state, caseAddress, 'encryptedCaseKey')
  const caseKeySalt = cacheCallValue(state, caseAddress, 'caseKeySalt')

  return {
    encryptedCaseKey,
    caseKeySalt,
    diagnosingDoctorA,
    diagnosingDoctorB,
    diagnosingDoctorAPublicKey: cacheCallValue(state, AccountManager, 'publicKeys', diagnosingDoctorA),
    diagnosingDoctorBPublicKey: cacheCallValue(state, AccountManager, 'publicKeys', diagnosingDoctorB),
    AccountManager
  }
}

function* caseRowSaga({ caseAddress, status, AccountManager }) {
  if (!caseAddress || !AccountManager) { return {} }
  yield addContract({ address: caseAddress, contractKey: 'Case' })
  yield cacheCall(caseAddress, 'encryptedCaseKey')
  yield cacheCall(caseAddress, 'caseKeySalt')
  let diagnosingDoctorA = yield cacheCall(caseAddress, 'diagnosingDoctorA')
  if (diagnosingDoctorA) {
    yield cacheCall(AccountManager, 'publicKeys', diagnosingDoctorA)
  }
  let diagnosingDoctorB = yield cacheCall(caseAddress, 'diagnosingDoctorB')
  if (diagnosingDoctorB) {
    yield cacheCall(AccountManager, 'publicKeys', diagnosingDoctorB)
  }
}

export const CaseRowContainer = withContractRegistry(
  connect(mapStateToProps)(
  withSaga(caseRowSaga, { propTriggers: ['caseAddress', 'AccountManager', 'status', 'diagnosingDoctorA', 'diagnosingDoctorB'] })(
      withSend(class _CaseRow extends Component {
      constructor (props, context) {
        super(props, context)
        this.state = {}
      }

      componentDidMount () {
        this.init(this.props)
      }

      componentWillReceiveProps (nextProps) {
        this.init(nextProps)
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
          let doctor = this.props.diagnosingDoctorA
          let doctorPublicKey = this.props.diagnosingDoctorAPublicKey.substring(2)
          const doctorEncryptedCaseKey = reencryptCaseKey({account: currentAccount(), encryptedCaseKey, doctorPublicKey, caseKeySalt})
          send(caseAddress, 'authorizeDiagnosisDoctor', doctor, '0x' + doctorEncryptedCaseKey)()
        } else if (status === '8') {
          let doctor = this.props.diagnosingDoctorB
          let doctorPublicKey = this.props.diagnosingDoctorBPublicKey.substring(2)
          const doctorEncryptedCaseKey = reencryptCaseKey({account: currentAccount(), encryptedCaseKey, doctorPublicKey, caseKeySalt})
          send(caseAddress, 'authorizeChallengeDoctor', doctor, '0x' + doctorEncryptedCaseKey)()
        }
      }

      render () {
        if (!this.props.status) { return <tr></tr> }

        const caseRoute = formatRoute(routes.PATIENTS_CASE, { caseAddress: this.props.caseAddress })

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
                <Link to={caseRoute}>{this.props.caseAddress}</Link>
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
  }))))

CaseRowContainer.propTypes = {
  caseAddress: PropTypes.string,
  caseIndex: PropTypes.any,
  showModal: PropTypes.bool
}
