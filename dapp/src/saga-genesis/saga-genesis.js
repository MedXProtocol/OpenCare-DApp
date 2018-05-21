class SagaGenesis {
  invalidateContract (contract) {

  }

  invalidateMethod (method) {

  }

  register (sagaContext, call) {

  }

  clear (sagaContext) {

  }

  newContext () {
    return new SagaContext({genesis: this})
  }
}
