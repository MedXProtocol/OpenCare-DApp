import { caseStatusToName } from './case-status-to-name'

export class Status {
  constructor (code) {
    this.code = parseInt(code)
  }

  hasDiagnosis () {
    return this.code >= 5
  }

  toString() {
    return caseStatusToName(this.code)
  }
}
