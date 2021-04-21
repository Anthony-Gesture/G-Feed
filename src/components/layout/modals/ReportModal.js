import axios from 'axios'
import { useState } from 'react'
import { Modal } from 'react-bootstrap'
import './ReportModal.css'

const ReportModal = props => {
  const [text, setText] = useState('')

  const handleReportSubmit = async e => {
    e.preventDefault()

    // console.log(`Feed ID: ${props.feedid}`)
    // console.log(`Token ID: ${props.tokenid}`)
    // console.log(`Text: ${text}`)

    const res = await axios.post(
      `https://us-central1-gesture-dev.cloudfunctions.net/feed_api/${props.feedid}/report?tokenId=${props.tokenid}`,
      { text, uid: props.tokenid }
    )

    props.onHide()
    window.location.reload()
  }

  return (
    <Modal
      {...props}
      size='lg'
      aria-labelledby='contained-modal-title-vcenter'
      centered
      animation={false}
    >
      <Modal.Header>
        <Modal.Title id='contained-modal-title-vcenter'>
          <p className='modal-title'>Report Post: {props.feedid}</p>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <form onSubmit={handleReportSubmit}>
          <div className='report-post-container'>
            <div className='report-post-text-area'>
              <textarea
                cols='30'
                rows='10'
                className='report-post-input-text'
                value={text}
                placeholder='What seems to be the issue?'
                onChange={e => setText(e.target.value)}
              ></textarea>
            </div>

            <div className='report-post-buttons'>
              <button
                className='report-post-each-button report-post-cancel'
                style={{ backgroundColor: '#aaa' }}
                onClick={props.onHide}
              >
                Cancel
              </button>

              <button
                className='report-post-each-button report-post-submit'
                style={{ backgroundColor: '#8585ff' }}
              >
                Report
              </button>
            </div>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default ReportModal
