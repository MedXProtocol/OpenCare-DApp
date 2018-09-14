import React, { Component } from 'react'
import { all } from 'redux-saga/effects'
import { connect } from 'react-redux'
import ReactCSSTransitionReplace from 'react-css-transition-replace';
import ReactTimeout from 'react-timeout'
import { cacheCall, withSaga, cacheCallValue, contractByName, nextId } from '~/saga-genesis'
import { Modal } from 'react-bootstrap'
import get from 'lodash.get'
import { DaiFaucetAPI } from '~/components/betaFaucet/DaiFaucetAPI'
import { EthFaucetAPI } from '~/components/betaFaucet/EthFaucetAPI'
import { AddDoctorAPI } from '~/components/betaFaucet/AddDoctorAPI'
import { weiToEther } from '~/utils/weiToEther'

function mapStateToProps (state) {
  let etherWasDripped, doctorWasAdded, daiWasMinted
  const Dai = contractByName(state, 'Dai')
  const daiBalance = cacheCallValue(state, Dai, 'balanceOf', address)
  const address = get(state, 'sagaGenesis.accounts[0]')
  const ethBalance = get(state, 'sagaGenesis.ethBalance.balance')
  const betaFaucetModalDismissed = get(state, 'betaFaucet.betaFaucetModalDismissed')
  const manuallyOpened = get(state, 'betaFaucet.manuallyOpened')
  const MedXToken = contractByName(state, 'MedXToken')
  const DoctorManager = contractByName(state, 'DoctorManager')
  const isOwner = address && (cacheCallValue(state, DoctorManager, 'owner') === address)
  const CaseManager = contractByName(state, 'CaseManager')
  const isDoctor = cacheCallValue(state, DoctorManager, 'isDoctor', address)
  const isDermatologist = cacheCallValue(state, DoctorManager, 'isDermatologist', address)
  const BetaFaucet = contractByName(state, 'BetaFaucet')
  const hasBeenSentEther = cacheCallValue(state, BetaFaucet, 'sentAddresses', address)

  const externalTransactions = get(state, 'externalTransactions.transactions')
  for (let i = 0; i < externalTransactions.length; i++) {
    const { inFlight, txType, success } = externalTransactions[i]
    if (txType === 'sendEther' && (inFlight || (!inFlight && success))) {
      etherWasDripped = true
    } else if (txType === 'addDoctor' && (inFlight || (!inFlight && success))) {
      doctorWasAdded = true
    } else if (txType === 'mintDai' && (inFlight || (!inFlight && success))) {
      daiWasMinted = true
    }
  }

  const fieldsAreUndefined = isDoctor === undefined || isDermatologist === undefined || hasBeenSentEther === undefined || ethBalance === undefined
  const canBeDoctor = (!isDoctor && !isDermatologist)
  const needsEth = weiToEther(ethBalance) < 0.1 && !hasBeenSentEther
  const needsDai = weiToEther(daiBalance) < 0.1

  const showBetaFaucetModal =
    !fieldsAreUndefined &&
    !betaFaucetModalDismissed &&
    (needsEth || canBeDoctor || needsDai || manuallyOpened)

  return {
    address,
    BetaFaucet,
    showBetaFaucetModal,
    canBeDoctor,
    needsEth,
    needsDai,
    CaseManager,
    ethBalance,
    Dai,
    daiBalance,
    hasBeenSentEther,
    DoctorManager,
    MedXToken,
    isOwner,
    isDoctor,
    isDermatologist,
    etherWasDripped,
    daiWasMinted,
    doctorWasAdded,
    manuallyOpened
  }
}

function* saga({ Dai, BetaFaucet, CaseManager, MedXToken, DoctorManager, address }) {
  if (!Dai || !BetaFaucet || !CaseManager || !MedXToken || !DoctorManager || !address) { return }

  yield all([
    cacheCall(Dai, 'balanceOf', address),
    cacheCall(CaseManager, 'getPatientCaseListCount', address),
    cacheCall(DoctorManager, 'owner'),
    cacheCall(BetaFaucet, 'sentAddresses', address),
    cacheCall(DoctorManager, 'isDoctor', address),
    cacheCall(DoctorManager, 'isDermatologist', address)
  ])
}

function mapDispatchToProps(dispatch) {
  return {
    hideModal: () => {
      dispatch({ type: 'HIDE_BETA_FAUCET_MODAL' })
    },
    dispatchAddExternalTransaction: (transactionId, txType, txHash, call) => {
      dispatch({ type: 'ADD_EXTERNAL_TRANSACTION', transactionId, txType, txHash, call })
    },
    dispatchSagaGenesisTransaction: (transactionId, txType, txHash, call) => {
      dispatch({ type: 'TRANSACTION_HASH', transactionId, txHash, call })
    }
  }
}

export const BetaFaucetModal = ReactTimeout(connect(mapStateToProps, mapDispatchToProps)(
  withSaga(saga)(
    class _BetaFaucetModal extends Component {
      constructor(props) {
        super(props)
        this.state = {}
      }

      componentDidMount() {
        this.init(this.props)
      }

      componentWillReceiveProps(nextProps) {
        this.init(nextProps)
      }

      init(props) {
        this.setState({ step: this.nextStep(this.state.step, props) })
      }

      nextStep = (step, props) => {
        if (!step) {
          step = 1
        }

        if (step === 1 && (!props.needsEth || props.etherWasDripped)) {
          step = 2
        }

        if (step === 2 && (!props.needsDai || props.daiWasMinted)) {
          step = 3
        }

        if (step === 3 && (!props.canBeDoctor || props.doctorWasAdded)) {
          step = -1
        }

        return step
      }

      addExternalTransaction = (txType, txHash) => {
        const id = nextId()
        const call = { method: txType, address: '0x0444d61FE60A855d6f40C21f167B643fD5F17aF3' } // junk address for cache invalidator to be happy
        this.props.dispatchAddExternalTransaction(id, txType, txHash, call)
        this.props.dispatchSagaGenesisTransaction(id, txType, txHash, call)
      }

      closeModal = () => {
        this.setState({
          step: null
        }, this.props.hideModal)
      }

      handleMoveToNextStep = (e) => {
        e.preventDefault()
        this.setState({ step: this.nextStep(this.state.step + 1, this.props) })
      }

      render() {
        let content
        let totalSteps = '2'
        const { step } = this.state
        const {
          ethBalance,
          daiBalance,
          address
        } = this.props

        if (!this.props.showBetaFaucetModal) { return null }

        if (step === 1) {
          content = <EthFaucetAPI
            key="ethFaucet"
            address={address}
            ethBalance={ethBalance}
            addExternalTransaction={this.addExternalTransaction}
            handleMoveToNextStep={this.handleMoveToNextStep} />
        } else if (step === 2) {
          content = <DaiFaucetAPI
            key='daiFaucet'
            address={address}
            daiBalance={daiBalance}
            addExternalTransaction={this.addExternalTransaction}
            handleMoveToNextStep={this.handleMoveToNextStep} />
        } else if (step === 3) {
          content = <AddDoctorAPI
            key="addDoctorAPI"
            address={address}
            addExternalTransaction={this.addExternalTransaction}
            handleMoveToNextStep={this.handleMoveToNextStep} />
        } else {
          content = (
            <div className="col-xs-12 text-center">
              <br />
              <br />
              <h2 className="header--no-top-margin">
                You're all set!
              </h2>
              <p>
                There is nothing more to do to start using Hippocrates.
              </p>
              <hr />
              <p>
                <a onClick={this.closeModal} className="btn btn-primary">Close this</a>
              </p>
            </div>
          )
        }

        let stepText

        if (step > 0) {
          stepText = (
            <React.Fragment>
              &nbsp;<small>(Step {step} of {totalSteps})</small>
            </React.Fragment>
          )
        }

        return (
          <Modal show={this.props.showBetaFaucetModal} onHide={this.closeModal}>
            <Modal.Header>
              <div className="row">
                <div className="col-xs-12 text-center">
                  <h4>Welcome to the Hippocrates Beta
                    <br className="visible-xs hidden-sm hidden-md hidden-lg" />
                    {stepText}
                  </h4>
                </div>
              </div>
            </Modal.Header>
            <Modal.Body className="modal__beta-faucet">
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
