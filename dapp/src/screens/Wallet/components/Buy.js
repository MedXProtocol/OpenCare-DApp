import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

class Buy extends Component {
    navigateToMintScreen = () => {
        this.props.history.push('/mint');
    }

    render() {
        return (
            <div className="card card-account-balance">
                <div className="card-header">
                    <div className="row">
                        <div className="col-xs-2">
                            <div className="icon-big icon-success text-center">
                                <i className="ti-money"></i>
                            </div>
                        </div>
                        <div className="col-xs-10 text-right">
                            <h4 className="card-title">Buy</h4>
                            <p className="category">Buy MEDX tokens</p>
                        </div>
                    </div>
                </div>
                <div className="card-content">
                    <div className="row">
                        <div className="col text-center">
                            <button 
                                type="button" 
                                className="btn btn-primary btn-fill"
                                onClick={() => this.navigateToMintScreen()}>
                                Buy MEDX
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(Buy);