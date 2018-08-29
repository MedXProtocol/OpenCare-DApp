import { sha3 } from '~/saga-genesis/utils/sha3'
import { decode } from '~/saga-genesis/utils/decode'

export class ABIHelper {
  constructor (abi) {
    this._lookup = {}
    this._topic0Lookup = {}
    abi.forEach((definition) => {
      this._lookup[definition.name] = definition
      if (definition.type === 'Event') {
        const topic0 = this.topic0(definition)
        this._topic0Lookup[topic0] = definition
      }
    })
  }

  lookup (name) {
    return this._lookup[name]
  }

  topic0 (nameOrDefinition) {
    let definition
    if (typeof nameOrDefinition === 'string') {
      definition = this._lookup[nameOrDefinition]
    } else {
      definition = nameOrDefinition
    }
    const types = definition.inputs.map(input => input.type)
    return sha3(`${definition.name}(${types.join(',')})`)
  }

  decodeLogParameters (log) {
    const definition = this._topic0Lookup[log.topics[0]]
    return decode.log(definition.inputs, log.data, log.topics)
  }
}
