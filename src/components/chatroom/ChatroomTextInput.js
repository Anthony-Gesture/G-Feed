import React, { useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { Button, Form } from 'react-bootstrap'
import ClipLoader from 'react-spinners/ClipLoader'

const ChatroomTextInput = ({ tokenid, feedid, name }) => {
  const [uid, setUid] = useState('')

  const [posting, setPosting] = useState(false) // for the spinner when users click Post button
  const [message, setMessage] = useState('') // message - text input
  const [messages, setMessages] = useState([]) // all the messages for each feed

  const postMessageHandler = async e => {
    e.preventDefault()
    setPosting(true)

    try {
      const newMessage = {
        message,
        creationTime: Date.now(),
        sorter: Date.now() * -1,
        composerName: name,
      }
      const res = await axios.post(
        `https://us-central1-gesture-dev.cloudfunctions.net/feed_api/${feedid}/messages`,
        newMessage
      )

      setMessages([res.data.data.message, ...messages])
      setMessage('')

      document.getElementById('comments').scrollTo(0, 0) // scroll to top after a new message is posted
      setPosting(false)
    } catch (error) {
      console.error(error.message)
    }
  }

  return (
    <>
      <div className='main-comments-top'>
        <div className='main-comments-go-back'>
          <Link to={`/?tokenId=${tokenid}`} className='go-back-btn'>
            <div className='go-back'>
              <i className='fas fa-chevron-circle-left fa-2x'></i>
            </div>
          </Link>

          <div className='main-comments-sender-info'>
            <p className='post-fromto-info my-1 comments-sender-info'>
              Comments
            </p>
          </div>
        </div>

        <div className='comment-form'>
          <Form className='comment-send-form' onSubmit={postMessageHandler}>
            <input
              type='text'
              name='text'
              value={message}
              style={{ fontSize: '16px' }}
              placeholder='Say something...'
              className='comment-form-input'
              onChange={e => setMessage(e.target.value)}
            />

            <Button
              className='msg-send-button'
              type='submit'
              disabled={message.length === 0 || posting}
            >
              {posting ? (
                <span>
                  <ClipLoader size={20} color='#8585ff' />
                </span>
              ) : (
                <span>Post</span>
              )}
            </Button>
          </Form>
        </div>
      </div>
    </>
  )
}

export default ChatroomTextInput
