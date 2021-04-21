import { useState } from 'react'
import axios from 'axios'
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

  const handleFeedPrivacy = async () => {
    console.log(`Feed ID: ${props.feedid}`)
    console.log(`Token ID: ${props.tokenid}`)

    const res = await axios.post(
      `https://us-central1-gesture-dev.cloudfunctions.net/feed_api/${props.feedid}/privacy?tokenId=${props.tokenid}`,
      { privacy: true }
    )

    console.log(res)

    props.onHide()
    window.location.reload()
  }

  return (
    <>
      <ReportModal
        show={reportModalShow}
        feedid={feedID}
        tokenid={props.tokenid}
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
              <button
                className='edit-feed-modal-each-button block'
                onClick={handleFeedPrivacy}
              >
                {props.ispublic ? 'Make Private' : 'Make Public'}
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
