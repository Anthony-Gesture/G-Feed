import { useState } from 'react'
import { Modal } from 'react-bootstrap'
import ReportModal from './ReportModal'

import './EditFeedModal.css'

const EditFeedModal = props => {
  const [reportModalShow, setReportModalShow] = useState(false)
  const [feedID, setFeedID] = useState(props.feedid)

  const openReportFeedModal = () => {
    props.onHide()
    setFeedID(props.feedid)
    setReportModalShow(true)
  }

  return (
    <>
      <ReportModal
        show={reportModalShow}
        feedid={feedID}
        // setFeedID={setFeedID}
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
            {props.uid === props.feedownerid ? (
              <button className='edit-feed-modal-each-button block'>
                Make Public/Private
              </button>
            ) : (
              <button
                className='edit-feed-modal-each-button block'
                onClick={() => openReportFeedModal()}
              >
                Report Post: {props.feedid}
              </button>
            )}

            <button
              className='edit-feed-modal-each-button block'
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
