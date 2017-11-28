import React, { Component } from 'react';
import CreateCase from './components/CreateCase';

class NewCase extends Component {
    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-xs-12">
                        <CreateCase />
                    </div>
                </div>
            </div>
        );
    }
}

export default NewCase;
