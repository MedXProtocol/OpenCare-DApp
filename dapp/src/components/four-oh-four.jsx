import React, { Component } from 'react'
import { MainLayout } from '~/layouts/MainLayout'

export const FourOhFour = function () {
  return (
    <MainLayout>
      <div className='container'>
        <div className='row'>
          <div className='col-sm-12 text-center'>
            <h1>This is the end of the line.</h1>
            <p className='lead'>We cannot find the page you are looking for, please go back.</p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
