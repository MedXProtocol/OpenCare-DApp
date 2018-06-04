import React from 'react';

import { SignInRedirect } from '@/sign-in-redirect';

function buildProps({ pathname, address, account, signedIn, web3Failed } = { web3Failed: false }) {
  return {
    location: {
      pathname
    },
    address,
    account,
    web3Failed
  }
}

function setup(props) {
  return shallow(<SignInRedirect {...props} />)
}

describe('components', () => {
  let enzymeWrapper
  let props

  describe('SignInRedirect', () => {
    describe('when has account', () => {
      it('should redirect when root requested', () => {
        props = buildProps({
          signedIn: false,
          address: '0x09',
          account: true,
          pathname: '/foo'
        })
        enzymeWrapper = setup(props)
        expect(enzymeWrapper.find('Redirect').props().to).toBe('/sign-in')
        expect(enzymeWrapper.state().requestedPathname).toBe('/foo')

        props.pathname = '/sign-in'
        enzymeWrapper.setProps(props)
        expect(enzymeWrapper.find('span')).not.toBe(null)
        expect(enzymeWrapper.state().requestedPathname).toBe('/foo')

        props.signedIn = true
        enzymeWrapper.setProps(props)
        expect(enzymeWrapper.state().requestedPathname).toBe('/foo')

        console.log(enzymeWrapper.find('Redirect'))
        console.log(enzymeWrapper.debug())

        // expect(enzymeWrapper.find('Redirect').props().to).toBe('/foo')
      })
    })
  })
})

