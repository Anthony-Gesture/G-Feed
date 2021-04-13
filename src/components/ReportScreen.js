import React from 'react'
import { Link } from 'react-router-dom'
import { Button, Form } from 'react-bootstrap'

import ClipLoader from '../components/layout/Spinner'

import './ReportScreen.css'

const ReportScreen = () => {
  return (
    <>
      <section className='report-screen'>
        <div className='report-screen-top'>
          <div className='report-screen-go-back'>
            <div className='report-screen-title'>
              <p>Report Post</p>
            </div>
          </div>

          <div className='report-form'>
            <Form className='report-send-form'>
              <div className='report-input-area'>
                <textarea className='report-text-input-area'></textarea>
              </div>

              <div className='report-buttons-area'>
                <div className='go-back'>
                  <Link to='/' className='go-back-btn'>
                    <Button
                      className='cancel-report-button'
                      style={{ backgroundColor: '#bababa', border: 'none' }}
                    >
                      Cancel
                    </Button>
                  </Link>
                </div>

                <div className='report-submit'>
                  <Button
                    className='submit-report-button'
                    type='submit'
                    style={{ backgroundColor: '#8585ff', border: 'none' }}
                  >
                    Report
                  </Button>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </section>
    </>
  )
}

export default ReportScreen
