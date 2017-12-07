import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {BounceLoader} from 'react-spinners';
import './Spinner.css';

class Spinner extends Component {
    render() {
        return this.props.loading ?
            <div className="loading">
                <BounceLoader color={'#051A38'}  />
            </div> : null;
    }
}

Spinner.propTypes = {
    loading: PropTypes.bool
};

Spinner.defaultProps = {
    loading: true
};

export default Spinner;