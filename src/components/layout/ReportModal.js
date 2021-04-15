import { Modal, Button } from 'react-bootstrap'
import './ReportModal.css'

const ReportModal = props => {
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
          <p className='modal-title'>Report Post</p>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <form onSubmit={() => console.log('Submitted')}>
          <div className='report-post-container'>
            <div className='report-post-text-area'>
              <textarea
                cols='30'
                rows='10'
                className='report-post-input-text'
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
                Submit
              </button>
            </div>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default ReportModal
