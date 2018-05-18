import redirect from '../redirect'

describe('redirect', () => {
  let state

  beforeEach(() => {
    state = {}
  })

  describe('when not signed in', () => {
    let isSignedIn = false

    test('will redirect people with accounts to sign in', () => {
      expect(redirect({isSignedIn, hasAccount: true, pathname: '/foo', state})).toEqual({
        redirect: '/sign-in',
        requestedPathname: '/foo'
      })
    })

    test('will redirect people without accounts to sign up', () => {
      expect(redirect({isSignedIn, hasAccount: false, pathname: '/foo', state})).toEqual({
        redirect: '/sign-up',
        requestedPathname: '/foo'
      })
    })

    test('will preserve the pathname before redirect', () => {
      state = redirect({isSignedIn, hasAccount: true, pathname: '/foo', state})
      expect(redirect({isSignedIn, hasAccount: true, pathname: '/sign-in', state})).toEqual({
        redirect: '/sign-in',
        requestedPathname: '/foo'
      })
    })

    test('will have a sane pathname default after redirect', () => {
      expect(redirect({isSignedIn, hasAccount: true, pathname: '/sign-in', state})).toEqual({
        redirect: '/sign-in',
        requestedPathname: '/'
      })
    })

    test('if has account and not requesting the sign up page, go to sign in', () => {
      state = redirect({isSignedIn, hasAccount: false, pathname: '/foo', state})
      expect(state).toEqual({
        redirect: '/sign-up',
        requestedPathname: '/foo'
      })
      expect(redirect({isSignedIn, hasAccount: true, pathname: '/sign-up', state})).toEqual({
        redirect: '/sign-in',
        requestedPathname: '/foo'
      })
    })
  })

  describe('when signed in', () => {
    let isSignedIn = true
    let hasAccount = true

    test('will redirect to pathname', () => {
      state = {
        redirect: '',
        requestedPathname: '/foo'
      }
      expect(redirect({isSignedIn, hasAccount, pathname: '/sign-in', state})).toEqual({
        redirect: '/foo',
        requestedPathname: ''
      })
    })

    test('will clear old redirect', () => {
      state = {
        redirect: '/foo',
        requestedPathname: ''
      }
      expect(redirect({isSignedIn, hasAccount, pathname: '/sign-in', state})).toEqual({
        redirect: '',
        requestedPathname: ''
      })
    })
  })
})
