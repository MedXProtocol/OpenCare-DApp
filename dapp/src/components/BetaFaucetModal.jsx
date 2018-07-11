import React, { Component } from 'react'
import { connect } from 'react-redux'
import { cacheCallValue, contractByName } from '~/saga-genesis/state-finders'
import { withSaga } from '~/saga-genesis'
import { cacheCall } from '~/saga-genesis/sagas'
import { Modal } from 'react-bootstrap'
import get from 'lodash.get'
import { EthFaucetAPI } from '~/components/betaFaucet/EthFaucetAPI'
import { MedXFaucetAPI } from '~/components/betaFaucet/MedXFaucetAPI'

function mapStateToProps (state) {
  const address = get(state, 'sagaGenesis.accounts[0]')
  const ethBalance = get(state, 'sagaGenesis.ethBalance.balance')
  const betaFaucetModalDismissed = get(state, 'betaFaucet.betaFaucetModalDismissed')
  const MedXToken = contractByName(state, 'MedXToken')
  const DoctorManager = contractByName(state, 'DoctorManager')
  const medXBalance = cacheCallValue(state, MedXToken, 'balanceOf', address)
  const isOwner = address && (cacheCallValue(state, DoctorManager, 'owner') === address)
  const networkId = state.sagaGenesis.network.networkId
  const CaseManager = contractByName(state, 'CaseManager')
  const caseListCount = cacheCallValue(state, CaseManager, 'getPatientCaseListCount', address)
  const previousCase = (caseListCount > 0)

  return {
    address,
    betaFaucetModalDismissed,
    ethBalance,
    medXBalance,
    DoctorManager,
    MedXToken,
    isOwner,
    previousCase,
    networkId
  }
}

function* saga({ CaseManager, MedXToken, DoctorManager, address }) {
  if (!CaseManager || !MedXToken || !DoctorManager || !address) { return }
  yield cacheCall(CaseManager, 'getPatientCaseListCount', address)
  yield cacheCall(MedXToken, 'balanceOf', address)
  yield cacheCall(DoctorManager, 'owner')
}

function mapDispatchToProps(dispatch) {
  return {
    dismissModal: () => {
      dispatch({ type: 'BETA_FAUCET_MODAL_DISMISSED' })
    }
  }
}

export const BetaFaucetModal = connect(mapStateToProps, mapDispatchToProps)(
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
        let showBetaFaucetModal

        if (props.ethBalance !== undefined && props.ethBalance < 0.03) {
          showBetaFaucetModal = true
        } else if (props.ethBalance !== undefined && props.ethBalance >= 0.03) {
          showBetaFaucetModal = false
        }

        this.setState({
          showBetaFaucetModal
        })
      }

      moveToNextStep = (e) => {
        if (e !== undefined) {
          e.preventDefault()
        }

        if (this.state.step === 1) {
          this.setState({
            step: 2
          })
        } else if (this.state.step === 2) {
          this.props.dismissModal()
          this.setState({
            showBetaFaucetModal: false
          })
        }
      }

      render() {
        if (this.props.betaFaucetModalDismissed) { return null }

        let content
        const { showBetaFaucetModal, step } = this.state
        const { medXBalance, previousCase, ethBalance, networkId, isOwner, address } = this.props
        const showOnThisNetwork = (networkId === 3 || networkId === 1234)

        if (isOwner) { return null }

        // Don't show this if they've already been onboarded
        if (medXBalance > 0 || previousCase) { return null }

        if (showOnThisNetwork) {
          if (step === 1) {
            content = <EthFaucetAPI
              address={address}
              ethBalance={ethBalance}
              moveToNextStep={this.moveToNextStep} />
          } else if (step === 2) {
            content = <MedXFaucetAPI
              address={address}
              medXBalance={medXBalance}
              moveToNextStep={this.moveToNextStep} />
          }
        }

        return (
          <Modal show={showBetaFaucetModal}>
            <Modal.Header>
              <div className="row">
                <div className="col-xs-12 text-center">
                  <h4>Welcome to the Hippocrates Beta <small>(Step {step} of 3)</small></h4>
                </div>
              </div>
            </Modal.Header>
            <Modal.Body>
              <div className="row">
                <div className="col-xs-12 text-center">
                  {content}
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
            </Modal.Footer>
          </Modal>
        );
      }
    }
  )
)
