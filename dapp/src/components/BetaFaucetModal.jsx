import React, { Component } from 'react'
import ReactTimeout from 'react-timeout'
import { connect } from 'react-redux'
import { cacheCallValue, contractByName } from '~/saga-genesis/state-finders'
import { withSaga } from '~/saga-genesis'
import { cacheCall } from '~/saga-genesis/sagas'
import { Modal } from 'react-bootstrap'
import { currentAccount } from '~/services/sign-in'
import get from 'lodash.get'
import getWeb3 from '~/get-web3'
import { EthFaucetAPI } from '~/components/welcome/EthFaucetAPI'

function mapStateToProps (state) {
  const address = get(state, 'sagaGenesis.accounts[0]')
  const DoctorManager = contractByName(state, 'DoctorManager')
  const isOwner = address && (cacheCallValue(state, DoctorManager, 'owner') === address)
  const ropsten = (state.sagaGenesis.network.networkId === 3)

  return {
    address,
    DoctorManager,
    isOwner,
    ropsten
  }
}

function* saga({ DoctorManager, address }) {
  if (!DoctorManager || !address) { return }
  yield cacheCall(DoctorManager, 'owner')
}

export const BetaFaucetModal = ReactTimeout(connect(mapStateToProps)(
  withSaga(saga, { propTriggers: ['DoctorManager', 'address'] })(
    class extends Component {

      constructor(props) {
        super(props)

        this.state = {
          ethBalance: undefined
        }
      }

      getEtherBalance = () => {
        const address = currentAccount().address()
        // console.log('checking ethBalance ...')

        getWeb3().eth.getBalance(address).then(balance => {
          this.setState({
            ethBalance: parseFloat(getWeb3().utils.fromWei(balance, 'ether'))
          })
        })
      }

      componentDidMount() {
        this.getEtherBalance()

        // start a check Eth loop
        // console.log('mounting interval')
        this.etherBalanceInterval = this.props.setInterval(this.getEtherBalance, 3000)
      }

      componentWillUnmount() {
        this.props.clearInterval(this.etherBalanceInterval)
      }

      render() {
        let content
        let showBetaFaucetModal = false
        const { ethBalance } = this.state
        const { ropsten, isOwner, address } = this.props

        // console.log(ethBalance)

        if (isOwner) { return }

        // console.log(ropsten)
        if (ropsten && (ethBalance !== undefined)) {
          if (ethBalance < 0.1) {
            showBetaFaucetModal = true
            content = <EthFaucetAPI
              onSuccess={this.getEtherBalance}
              address={address}
              ethBalance={ethBalance} />
          } else {
            // console.log('killing etherBalanceInterval')
            this.props.clearInterval(this.etherBalanceInterval)
            showBetaFaucetModal = false
          }
        }

        return (
          <Modal show={showBetaFaucetModal}>
            <Modal.Header>
              <div className="row">
                <div className="col-xs-12 text-center">
                  <h4>Welcome to the Hippocrates Beta</h4>
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
))

