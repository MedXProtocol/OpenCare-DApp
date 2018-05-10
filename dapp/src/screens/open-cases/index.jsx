import React, {
  Component
} from 'react'
import MainLayout from '@/layouts/MainLayout.js'
import {
  Button,
  Table
} from 'react-bootstrap'
import { getNextCaseFromQueue, openCaseCount } from '@/utils/web3-util';
import IpfsApi from 'ipfs-api';

export class OpenCases extends Component {
  constructor (props) {
    super(props)
    this.state = {
      openCaseCount: 0
    }
    openCaseCount().then((response) => {
      this.setState({openCaseCount: response.toString()})
    })
  }

  onClickRequestCase = async (e) => {
    await getNextCaseFromQueue()
  }

  render () {
    return (
      <MainLayout>
        <div className="container">
          <div className="row">
            <div className='col-xs-12'>
              <h2>Open Cases: {this.state.openCaseCount}</h2>
            </div>
            <div className="col-xs-12">
              <Button disabled={this.state.openCaseCount === '0'} onClick={this.onClickRequestCase} bsStyle="primary">Request Case</Button>
            </div>
            <div className="col-xs-12">
              <h2>Cases</h2>
              <Table>
                <thead>

                </thead>
              </Table>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }
}
