import storePromise from '@/store'

export default function(action) {
  storePromise.then(({ store }) => { store.dispatch(action) })
}
