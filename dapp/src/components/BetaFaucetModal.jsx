import React, { Component } from 'react'
import { all } from 'redux-saga/effects'
import { connect } from 'react-redux'
import ReactCSSTransitionReplace from 'react-css-transition-replace';
import ReactTimeout from 'react-timeout'
import { cacheCallValue, contractByName } from '~/saga-genesis/state-finders'
import { withSaga } from '~/saga-genesis'
import { cacheCall } from '~/saga-genesis/sagas'
import { Modal } from 'react-bootstrap'
import get from 'lodash.get'
import { EthFaucetAPI } from '~/components/betaFaucet/EthFaucetAPI'
import { MedXFaucetAPI } from '~/components/betaFaucet/MedXFaucetAPI'
import { AddDoctorAPI } from '~/components/betaFaucet/AddDoctorAPI'

function mapStateToProps (state) {
  const address = get(state, 'sagaGenesis.accounts[0]')
  const ethBalance = get(state, 'sagaGenesis.ethBalance.balance')
  const betaFaucetModalDismissed = get(state, 'betaFaucet.betaFaucetModalDismissed')
  const MedXToken = contractByName(state, 'MedXToken')
  const DoctorManager = contractByName(state, 'DoctorManager')
  const medXBalance = cacheCallValue(state, MedXToken, 'balanceOf', address)
  const isOwner = address && (cacheCallValue(state, DoctorManager, 'owner') === address)
  const CaseManager = contractByName(state, 'CaseManager')
  const caseListCount = cacheCallValue(state, CaseManager, 'getPatientCaseListCount', address)
  const previousCase = (caseListCount > 0)
  const isDoctor = cacheCallValue(state, DoctorManager, 'isDoctor', address)

  return {
    address,
    betaFaucetModalDismissed,
    ethBalance,
    medXBalance,
    DoctorManager,
    MedXToken,
    isOwner,
    previousCase,
    isDoctor
  }
}

function* saga({ CaseManager, MedXToken, DoctorManager, address }) {
  if (!CaseManager || !MedXToken || !DoctorManager || !address) { return }
  yield all([
    cacheCall(CaseManager, 'getPatientCaseListCount', address),
    cacheCall(MedXToken, 'balanceOf', address),
    cacheCall(DoctorManager, 'owner'),
    yield cacheCall(DoctorManager, 'isDoctor', address)
  ])
}

function mapDispatchToProps(dispatch) {
  return {
    hideModal: () => {
      console.log('running dispatch hideModal')
      dispatch({ type: 'HIDE_BETA_FAUCET_MODAL' })
    }
  }
}

export const BetaFaucetModal = ReactTimeout(connect(mapStateToProps, mapDispatchToProps)(
  withSaga(saga, { propTriggers: ['ethBalance', 'medXBalance', 'CaseManager', 'DoctorManager', 'MedXToken', 'address'] })(
    class extends Component {

      constructor(props) {
        super(props)

        this.state = {
          step: 1,
          showBetaFaucetModal: false
        }
      }

      componentDidMount() {
        this.determineModalState(this.props)
      }

      componentWillReceiveProps(nextProps) {
        this.determineModalState(nextProps)
      }

      determineModalState(props) {
        // If they've already seen the faucet or they're currently viewing, skip
        if (props.betaFaucetModalDismissed || this.state.showBetaFaucetModal) {
          return
        }

        let showBetaFaucetModal
        let step

        const needEth = props.ethBalance !== undefined && props.ethBalance < 0.03
        const needMedX = props.medXBalance !== undefined && props.medXBalance < 15

        if (needEth) {
          showBetaFaucetModal = true
          step = 1
        } else if (needMedX) {
          showBetaFaucetModal = true
          step = 2
        } else if (!props.isDoctor) {
          showBetaFaucetModal = true
          step = 3
        }

        this.setState({
          showBetaFaucetModal,
          step
        })
      }

      nextState = () => {
        if (this.state.step === 1) {
          this.setState({
            step: 2
          })
        } else if (this.state.step === 2) {
          this.setState({
            step: 3
          })
        } else if (this.state.step === 3) {
          this.props.hideModal()
          this.setState({
            showBetaFaucetModal: false
          })
        }
      }

      handleMoveToNextStep = (e) => {
        e.preventDefault()

        this.moveToNextStep()
      }

      moveToNextStep = ({ withDelay = false } = {}) => {
        if (withDelay) {
          this.props.setTimeout(this.nextState, 2000)
        } else {
          this.nextState()
        }
      }

      render() {
        if (this.props.betaFaucetModalDismissed) { return null }

        let content
        const { showBetaFaucetModal, step } = this.state
        const { isDoctor, medXBalance, previousCase, ethBalance, isOwner, address } = this.props

        if (isOwner) { return null }

        if (step === 3) {
          if (isDoctor) {
            return null
          }
        } else {
          if (medXBalance > 0 || previousCase) {
            // Don't show this if they've already been onboarded
            return null
          }
        }

        if (step === 1) {
          content = <EthFaucetAPI
            key="ethFaucet"
            address={address}
            ethBalance={ethBalance}
            moveToNextStep={this.moveToNextStep}
            handleMoveToNextStep={this.handleMoveToNextStep} />
        } else if (step === 2) {
          content = <MedXFaucetAPI
            key="medXFaucet"
            address={address}
            medXBalance={medXBalance}
            moveToNextStep={this.moveToNextStep}
            handleMoveToNextStep={this.handleMoveToNextStep} />
        } else if (step === 3) {
          content = <AddDoctorAPI
            key="addDoctorAPI"
            address={address}
            moveToNextStep={this.moveToNextStep}
            handleMoveToNextStep={this.handleMoveToNextStep} />
        }

        return (
          <Modal show={showBetaFaucetModal}>
            <Modal.Header>
              <div className="row">
                <div className="col-xs-12 text-center">
                  <h4>Welcome to the Hippocrates Beta
                    <br className="visible-xs hidden-sm hidden-md hidden-lg" />
                    &nbsp;<small>(Step {step} of 3)</small></h4>
                </div>
              </div>
            </Modal.Header>
            <Modal.Body>
              <div className="row">
                <ReactCSSTransitionReplace transitionName="page"
                                           transitionEnterTimeout={400}
                                           transitionLeaveTimeout={400}>
                  {content}
                </ReactCSSTransitionReplace>
              </div>
            </Modal.Body>
            <Modal.Footer>
            </Modal.Footer>
          </Modal>
        );
      }
    }
  )
))
