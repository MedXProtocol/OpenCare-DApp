import React, { Component } from 'react'
import { connect } from 'react-redux'
import { cacheCallValue, contractByName } from '~/saga-genesis/state-finders'
import { withSaga } from '~/saga-genesis'
import { cacheCall } from '~/saga-genesis/sagas'
import { Modal } from 'react-bootstrap'
import { currentAccount } from '~/services/sign-in'
import get from 'lodash.get'
import getWeb3 from '~/get-web3'
import { isBlank } from '~/utils/isBlank'
import { EthFaucetAPI } from '~/components/welcome/EthFaucetAPI'

function mapStateToProps (state) {
  const address = get(state, 'sagaGenesis.accounts[0]')
  const DoctorManager = contractByName(state, 'DoctorManager')
  const isOwner = address && (cacheCallValue(state, DoctorManager, 'owner') === address)

  return {
    address,
    DoctorManager,
    isOwner
  }
}

function* saga({ DoctorManager, address }) {
  if (!DoctorManager || !address) { return }
  yield cacheCall(DoctorManager, 'owner')
}

export const BetaFaucetModal = connect(mapStateToProps)(
  withSaga(saga, { propTriggers: ['DoctorManager', 'address'] })(
    class extends Component {

      constructor(props) {
        super(props)

        this.state = {
          ethBalance: undefined
        }
      }

      async componentDidMount() {
        const address = currentAccount().address()
        await getWeb3().eth.getBalance(address).then(balance => {
          this.setState({
            ethBalance: parseFloat(getWeb3().utils.fromWei(balance, 'ether'))
          })
        })
      }

      render() {
        let content
        let showBetaFaucetModal = false
        const { ethBalance } = this.state

        console.log(ethBalance)

        if (this.props.isOwner) {
          return
        } else if (ethBalance !== undefined && ethBalance < 0.1) {
          showBetaFaucetModal = true
          content = <EthFaucetAPI address={this.props.address} ethBalance={ethBalance} />
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
)

