import redirectService from '../redirect-service'

describe('redirect-service', () => {

  let isSignedIn, hasAccount, pathname

  beforeEach(() => {
    // do this
  })

  describe('no previous account in cookies', () => {
    it('should send them to welcome', () => {
      expect(redirectService({isSignedIn: false, hasAccount: false, pathname: '/'}))
        .toEqual('/welcome')
    })

    it('should do nothing if already on sign up page', () => {
      expect(redirectService({isSignedIn: false, hasAccount: false, pathname: '/sign-up'}))
        .toEqual('')
    })

    it('should do nothing if already on sign in page', () => {
      expect(redirectService({isSignedIn: false, hasAccount: false, pathname: '/sign-in'}))
        .toEqual('')
    })
  })

  describe('previous account found in cookies', () => {
    it('should send them to sign in', () => {
      expect(redirectService({isSignedIn: false, hasAccount: true, pathname: '/'}))
        .toEqual('/sign-in')
    })

    it('should let them sign up if they want', () => {
      expect(redirectService({isSignedIn: false, hasAccount: true, pathname: '/sign-up'}))
        .toEqual('')
    })

    it('should let them sign in if they want', () => {
      expect(redirectService({isSignedIn: false, hasAccount: true, pathname: '/sign-in'}))
        .toEqual('')
    })

    describe('when they are signed in', () => {
      it('should do nothing', () => {
        expect(redirectService({isSignedIn: true, hasAccount: true, pathname: '/wallet'}))
          .toEqual('')
      })

      it('should redirect if they try to sign in', () => {
        expect(redirectService({isSignedIn: true, hasAccount: true, pathname: '/sign-in'}))
          .toEqual('/patients/cases')
      })

      it('should redirect if they try to sign up', () => {
        expect(redirectService({isSignedIn: true, hasAccount: true, pathname: '/sign-up'}))
          .toEqual('/patients/cases')
      })
    })
  })
})
