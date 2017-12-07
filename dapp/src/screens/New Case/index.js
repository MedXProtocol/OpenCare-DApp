import React, { Component } from 'react';
import MainLayout from '../../layouts/MainLayout';
import CreateCase from './components/CreateCase';

class NewCase extends Component {
    render() {
        return (
            <MainLayout>
                <div className="container">
                    <div className="row">
                        <div className="col-xs-12">
                            <CreateCase />
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }
}

export default NewCase;
