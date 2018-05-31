export default function (state, address) {
  address = address.toLowerCase()
  var networkId = state.sagaGenesis.network.networkId
  if (state.sagaGenesis &&
      state.sagaGenesis.contracts &&
      state.sagaGenesis.contracts.networks[networkId]
    ) {
    return state.sagaGenesis.contracts.networks[networkId].addressContractKey[address]
  }
}
