import React, { Component } from 'react'
import ReactTimeout from 'react-timeout'
import { BodyClass } from '~/components/BodyClass'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { bugsnagClient } from '~/bugsnagClient'
import { Account } from '~/accounts/Account'
import metaMaskFoxAndWordmarkImg from '~/assets/img/metamask-fox-and-wordmark.svg'
import { PageTitle } from '~/components/PageTitle'
import * as routes from '~/config/routes'
import get from 'lodash.get'

function mapStateToProps(state, ownProps) {
  return {
    address: get(state, 'sagaGenesis.accounts[0]'),
    networkId: get(state, 'sagaGenesis.network.networkId')
  }
}

export const LoginToMetaMask = connect(mapStateToProps)(
  ReactTimeout(
    class _LoginToMetaMask extends Component {
      constructor(props) {
        super(props)

        this.state = {
          error: '',
          isUnlocked: undefined,
          isEnabled: undefined,
          isApproved: undefined
        }
      }

      enableEthereum = async (e) => {
        e.preventDefault()

        this.setState({ error: '' })

        if (window.ethereum) {
          try {
            await window.ethereum.enable()
          } catch (error) {
            if (error !== 'User rejected provider access') {
              bugsnagClient.notify(error)
            }

            this.setState({ error: error })
          }
        }
      }

      componentDidMount () {
        this.interval = this.props.setInterval(this.checkEthereum, 1000)
      }

      componentWillUmount () {
        this.props.clearInterval(this.interval)
      }

      checkEthereum = async () => {
        if (window.ethereum) {
          let isUnlocked,
            isEnabled,
            isApproved

          if (window.ethereum._metamask) {
            isUnlocked = await window.ethereum._metamask.isUnlocked()
            isEnabled  = await window.ethereum._metamask.isEnabled()
            isApproved = await window.ethereum._metamask.isApproved()
          }

          this.setState({
            isUnlocked,
            isEnabled,
            isApproved
          })
        }
      }

      redirectPath () {
        let redirectPath

        if (this.props.address) {
          if (Account.get(this.props.networkId, this.props.address)) {
            redirectPath = routes.SIGN_IN
          } else if (!Account.get(this.props.networkId, this.props.address)) {
            redirectPath = routes.SIGN_UP
          }
        }

        return redirectPath
      }

      render () {
        let redirect,
          redirectPath = this.redirectPath()
        if (redirectPath) {
          redirect = <Redirect to={redirectPath} />
        }

        return (
          <BodyClass isDark={true}>
            {redirect}
            <div>
              <PageTitle renderTitle={(t) => t('pageTitles.loginToMetaMask')} />
              <div className='container'>
                <div className='row'>
                  <div className='col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3'>
                    <h3 className='text-center text-white title--inverse'>
                      We see you're using MetaMask, nice!
                    </h3>

                    <div className="form-wrapper form-wrapper--inverse form-wrapper--account">
                      <div className="form-wrapper--body form-wrapper--body__extra-padding">
                        <p>
                          Sign in to your MetaMask account (the <img src={metaMaskFoxAndWordmarkImg} alt="MetaMask logo" width="20" /> fox in the top-right corner) and provide access for OpenCare to assist you in signing transactions.
                        </p>

                        {this.state.isUnlocked && !this.state.isApproved
                          ? (
                            <div className="text-center">
                              <br />
                              <a className="btn btn-primary btn-lg" onClick={this.enableEthereum}>
                                Authorize OpenCare
                              </a>
                              <br />
                              <br />

                              {this.state.error ?
                                (
                                  <p>
                                    There was an error: {this.state.error}
                                  </p>

                                ) : null
                              }
                            </div>
                          ) : null
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BodyClass>
        )
      }
    }
  )
)
