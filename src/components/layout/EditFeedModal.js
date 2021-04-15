import { useState } from 'react'
import { Modal, Button } from 'react-bootstrap'
import ReportModal from './ReportModal'

import './EditFeedModal.css'

const EditFeedModal = props => {
  const [reportModalShow, setReportModalShow] = useState(false)

  const openReportFeedModal = () => {
    props.onHide()
    setReportModalShow(true)
  }

  return (
    <>
      <ReportModal
        show={reportModalShow}
        onHide={() => setReportModalShow(false)}
      />

      <Modal
        {...props}
        size='lg'
        aria-labelledby='contained-modal-title-vcenter'
        centered
        className='edit-feed-modal-container'
        animation={false}
      >
        <div className='edit-feed-modal-buttons-container'>
          <Modal.Body>
            {props.uid === 'uid123' && (
              <button className='edit-feed-modal-each-button' block>
                Make Public/Private
              </button>
            )}

            {props.uid !== 'uid123' && (
              <button
                className='edit-feed-modal-each-button'
                block
                onClick={() => openReportFeedModal()}
              >
                Report Post
              </button>
            )}

            <button
              className='edit-feed-modal-each-button'
              block
              onClick={props.onHide}
            >
              Cancel
            </button>
          </Modal.Body>
        </div>
      </Modal>
    </>
  )
}

export default EditFeedModal
