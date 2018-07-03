import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { currentAccount } from '~/services/sign-in'
import { downloadJson } from '~/utils/storage-util'
import { cacheCallValue, withSaga, cacheCall, addContract } from '~/saga-genesis'
import { getFileHashFromBytes } from '~/utils/get-file-hash-from-bytes'

function mapStateToProps(state, { caseAddress, challengingDoctorAddress }) {
  const account = currentAccount()
  const diagnosisBLocationHash = getFileHashFromBytes(cacheCallValue(state, caseAddress, 'diagnosisBLocationHash'))
  const patientAddress = cacheCallValue(state, caseAddress, 'patient')
  const isPatient = account.address() === patientAddress
  const isChallengingDoctor = account.address() === challengingDoctorAddress

  return {
    isChallengingDoctor,
    diagnosisBLocationHash,
    isPatient
  }
}

function* saga({ caseAddress }) {
  yield addContract({ address: caseAddress, contractKey: 'Case' })
  yield cacheCall(caseAddress, 'diagnosisBLocationHash')
}

const ChallengedDiagnosis = connect(mapStateToProps)(withSaga(saga, { propTriggers: 'caseAddress' })(class _ChallengedDiagnosis extends Component {
    constructor(props){
        super(props)

        this.state = {
            diagnosis: {},
            hidden: true
        }
    }

    componentDidMount () {
      this.init(this.props)
    }

    componentWillReceiveProps (nextProps) {
      this.init(nextProps)
    }

    async init (props) {
      const diagnosisHash = props.diagnosisBLocationHash

      if (
        diagnosisHash !== null
        && diagnosisHash !== "0x"
        && props.caseKey
        && (props.isPatient || props.isChallengingDoctor)
      ) {
        const diagnosisJson = await downloadJson(diagnosisHash, props.caseKey)
        const diagnosis = JSON.parse(diagnosisJson)
        this.setState({
          diagnosis: diagnosis,
          hidden: false
        })
      }
    }

    render() {
      return this.state.hidden ?
          <div/> :
          <div className="card">
              <div className="card-header">
                  <h3 className="card-title">{this.props.title}</h3>
              </div>
              <div className="card-body">
                  <div className="row">

                      <div className="col-xs-12">
                          <label>Diagnosis</label>
                          <p>{this.state.diagnosis.diagnosis}</p>
                      </div>
                      <div className="col-xs-12">
                          <label>Recommendation</label>
                          <p>{this.state.diagnosis.recommendation}</p>
                      </div>
                      {(this.state.diagnosis.additionalRecommendation)
                        ? (
                            <div className="col-xs-12">
                              <label>Additional Recommendation:</label>
                              <p>{this.state.diagnosis.additionalRecommendation}</p>
                            </div>
                          )
                        : null}
                  </div>
              </div>
          </div>
    }
}))

ChallengedDiagnosis.propTypes = {
  caseAddress: PropTypes.string,
  caseKey: PropTypes.string,
  title: PropTypes.string,
  challengingDoctorAddress: PropTypes.string
}

ChallengedDiagnosis.defaultProps = {
  caseAddress: null,
  title: 'Diagnosis',
  challengingDoctorAddress: ''
}

export default ChallengedDiagnosis
