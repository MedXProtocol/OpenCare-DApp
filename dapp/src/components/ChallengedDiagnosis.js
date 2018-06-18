import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { downloadJson } from '~/utils/storage-util'
import { cacheCallValue, withSaga, cacheCall, addContract } from '~/saga-genesis'
import { connect } from 'react-redux'
import { getFileHashFromBytes } from '~/utils/get-file-hash-from-bytes'

function mapStateToProps(state, { caseAddress }) {
  const challengeHash = getFileHashFromBytes(cacheCallValue(state, caseAddress, 'challengeHash'))
  return {
    challengeHash
  }
}

function* saga({ caseAddress }) {
  yield addContract({ address: caseAddress, contractKey: 'Case' })
  yield cacheCall(caseAddress, 'challengeHash')
}

const ChallengedDiagnosis = connect(mapStateToProps)(withSaga(saga, { propTriggers: 'caseAddress' })(class _ChallengedDiagnosis extends Component {
    constructor(props){
        super(props)

        this.state = {
            diagnosis: {},
            hidden: true
        }
    }

    async componentDidMount() {
        const diagnosisHash = this.props.challengeHash

        if(diagnosisHash !== null && diagnosisHash !== "0x") {
            const diagnosisJson = await downloadJson(diagnosisHash, this.props.caseKey)
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
                    <h2 className="card-title">{this.props.title}</h2>
                </div>
                <div className="card-body">
                    <div className="row">

                        <div className="col-xs-12">
                            <label>Diagnosis</label>
                            <p>{this.state.diagnosis.diagnosis}</p>
                        </div>
                        <div className="col-lg-6 col-md-12">
                            <label>Recommendation</label>
                            <p>{this.state.diagnosis.recommendation}</p>
                        </div>
                    </div>
                </div>
            </div>
    }
}))

ChallengedDiagnosis.propTypes = {
  caseAddress: PropTypes.string,
  caseKey: PropTypes.string,
  title: PropTypes.string
}

ChallengedDiagnosis.defaultProps = {
  caseAddress: null,
  title: 'Diagnosis'
}

export default ChallengedDiagnosis
