import { Modal, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import './Modal.css'

const MyVerticallyCenteredModal = props => {
  return (
    <Modal
      {...props}
      size='lg'
      aria-labelledby='contained-modal-title-vcenter'
      centered
    >
      <Modal.Header>
        <Modal.Title id='contained-modal-title-vcenter'>
          <p className='modal-title'>Edit Post</p>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Button block>Make Public/Private</Button>

        <Link to='/report' className='go-to-report'>
          <Button block>Report Post</Button>
        </Link>

        <Button block onClick={props.onHide}>
          Close
        </Button>
      </Modal.Body>
    </Modal>
  )
}

export default MyVerticallyCenteredModal
