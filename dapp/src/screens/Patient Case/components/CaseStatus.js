import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Spinner from '../../../components/Spinner';
import { getCaseStatus, acceptDiagnosis, challengeDiagnosis } from '../../../utils/web3-util';

class CaseStatus extends Component {
    constructor(){
        super()

        this.state = {
            status: {},
            buttonsHidden: true,
            submitInProgress: false
        };
    }

    async componentDidMount() {
        const status = await getCaseStatus(this.props.caseAddress);

        this.setState({status: status});

        if(status.code === 2) {
            this.setState({buttonsHidden: false});
        }
    }

    handleAcceptDiagnosis = async () => {
        this.setState({submitInProgress: true});

        acceptDiagnosis(this.props.caseAddress, (error, result) => {
            if(error !== null) {
                this.onError(error);
            } else {
                this.onSuccess();
            }
        });
    }

    handleChallengeDiagnosis = async () => {
        this.setState({submitInProgress: true});

        challengeDiagnosis(this.props.caseAddress, (error, result) => {
            if(error !== null) {
                this.onError(error);
            } else {
                this.onSuccess();
            }
        });
    }

    onError = (error) => {
        this.setState({
            error: error,
            submitInProgress: false
        });
    }

    onSuccess = () => {
        this.setState({submitInProgress: false});
    }

    render() {
        return ( this.state.hidden ?
            <div /> :
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Resolution</h2>
                    <p className="category">Review case make desicion</p>
                </div>
                <div className="card-content">
                    <div className="row">
                    {
                        this.state.buttonsHidden ? null :
                        <div className="col-xs-12" >
                            <button onClick={this.handleAcceptDiagnosis} type="button" className="btn btn-defult">Accept</button>
                            <button onClick={this.handleChallengeDiagnosis} type="button" className="btn btn-defult">Challenge</button>
                        </div>
                    }
                    </div>
                </div>
                <Spinner loading={this.state.submitInProgress}/>
            </div>
        );
    }
}

CaseStatus.propTypes = {
    caseAddress: PropTypes.string
};

CaseStatus.defaultProps = {
    caseAddress: null
};

export default CaseStatus;