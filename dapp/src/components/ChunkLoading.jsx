import React from 'react'
import { LoadingLines } from '~/components/LoadingLines'

export const ChunkLoading = props => (
  <div className='container chunk-loading'>
    <div className='card'>
      <div className='card-body'>
        <div className='row'>
          <div className='chunk-loading--col col-sm-12 text-center'>
            <br />
            <LoadingLines visible={true} /> &nbsp;
            <br />
          </div>
        </div>
      </div>
    </div>
  </div>
)
