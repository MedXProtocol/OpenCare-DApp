import { hashWithSalt } from '~/services/hashWithSalt'
import { genKey } from '~/services/gen-key'
import { deriveKey } from '~/utils/derive-key'

test('Returns a hex string if input is hex or array buffer', () => {
  var masterPassword = '01dbd9117f45f8c098221569d101d2ab15c640dd4704df830838a82f6786c058'

  var salt = genKey()
  var preimageSalt = genKey()

  let [ preimage1 ] = hashWithSalt(masterPassword, salt)
  let [ storedMasterPassword1 ] = hashWithSalt(preimage1, preimageSalt)
  storedMasterPassword1 = storedMasterPassword1.toString('hex')

  var preimage = deriveKey(masterPassword, salt)
  var storedMasterPassword = deriveKey(preimage, preimageSalt).toString('hex')

  expect(preimage).toEqual(preimage1)
  expect(storedMasterPassword1).toEqual(storedMasterPassword)
})
