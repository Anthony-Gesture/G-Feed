import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { Button, Form } from 'react-bootstrap'
import { timeSince } from '../utils/utils.js'
import { db } from '../utils/firebase'
import ClipLoader from 'react-spinners/ClipLoader'

import './Chatroom.css'

// 3. Personalisation
//    get the user's name from the endpoint: `/tokens/:tokenId`
//    and update composerName with that name

// 4/11/2021
// we need to make the chatroom layout fully responsive
// I'm thinking of making it a flexbox and centering it?
// we also have to figure out how to make it look better by getting rid of weird space at the bottom of the page
// how to get the token? how to display the page to only those who have token?

const Chatroom = ({ match }) => {
  const feedID = match.params.id
  const numOfMessagesPerLoad = 8

  const [hasMore, setHasMore] = useState(true) // for the Load more button display
  const [messages, setMessages] = useState([]) // all the messages for each feed
  const [message, setMessage] = useState('') // message - text input

  const [messagesLoading, setMessagesLoading] = useState(false) // for the spinner when the first 8 messages are being loaded
  const [loadingMore, setLoadingMore] = useState(false) // for the spinner when users click Load more button
  const [posting, setPosting] = useState(false) // for the spinner when users click Post button

  let search = window.location.search
  let parameter = new URLSearchParams(search)
  const tokenId = parameter.get('tokenId') // composerName = 'Misbah' if tokenId === '123' else 'Anthony' go check FeedScreen.js line 16

  useEffect(() => {
    window.scrollTo(0, 0)

    let messagesRef = db
      .ref(`/social_feed_messages/${feedID}`)
      .orderByChild('sorter')
      .limitToFirst(numOfMessagesPerLoad) // the first {8} newest data
    // 4/6/2021
    // someone manually modified the timestamp of the message on top of feed2
    // with composerName C as in Cake
    // its creationTime and sorter are actually different numbers
    // and that's why the message's on top when it's written 45 years ago

    setMessagesLoading(true)

    messagesRef.on('value', snapshot => {
      if (!snapshot.exists() || snapshot.length === 0) {
        setMessagesLoading(false)
        return
      } // do nothing and just return if there is no message

      const messagesList = []

      snapshot.forEach(data => {
        messagesList.push(data.val())
      })

      setMessages(messagesList)
      // https://stackoverflow.com/questions/34687091/can-i-execute-a-function-after-setstate-is-finished-updating
      setMessagesLoading(false)
    })

    return () => messagesRef.off()
  }, [])

  const getOlderMessages = async () => {
    setLoadingMore(true)

    const paginateKey = (
      messages && messages[messages.length - 1].sorter + 1
    ).toString()

    const res = await axios.get(
      `https://us-central1-gesture-dev.cloudfunctions.net/feed_api/${feedID}/messages?paginateKey=${paginateKey}`
    )

    const olderMessages = res.data.data.messages.sort((a, b) => {
      return a.sorter - b.sorter
    })

    if (olderMessages.length < numOfMessagesPerLoad) {
      setHasMore(false)
    }

    setMessages([...messages, ...olderMessages])

    setLoadingMore(false)
  }

  const postMessageHandler = async e => {
    e.preventDefault()
    setPosting(true)

    const userRes = await axios.get(
      `https://us-central1-gesture-dev.cloudfunctions.net/feed_api/tokens/${tokenId}`
    )

    let userName = userRes.data.data.name

    try {
      const newMessage = {
        message,
        creationTime: Date.now(),
        sorter: Date.now() * -1,
        composerName: userName,
      }
      const res = await axios.post(
        `https://us-central1-gesture-dev.cloudfunctions.net/feed_api/${feedID}/messages`,
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

  // to make spinner on Post button look better
  // if everything gets sorted out, get rid of this
  const postButtonCSSTestHandler = e => {
    e.preventDefault()
    console.log('clicked')
  }

  return (
    <>
      <section className='main-comments'>
        <div className='main-comments-top'>
          <div className='main-comments-go-back'>
            <Link to='/' className='go-back-btn'>
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

        {messagesLoading && (
          <div className='messages-loading'>
            <ClipLoader size={40} color='#8585ff' />
          </div>
        )}
        <div id='comments' className='comments'>
          <div className='comments-scrollable-area'>
            <div className='comments-area'>
              {messages.length === 0 && !messagesLoading ? (
                <div style={{ textAlign: 'center' }}>
                  <p className='mt-3'>This feed has no messages yet.</p>
                </div>
              ) : (
                messages
                  .sort((a, b) => {
                    return a.sorter - b.sorter
                  })
                  .map(msg => (
                    <div className='com-each-comment' key={msg.creationTime}>
                      <div className='user-and-comment'>
                        <p className='username-display'>
                          <span>{msg.composerName}</span>
                        </p>
                        <p className='com-text-comment'>{msg.message}</p>
                      </div>

                      <div className='comment-footer'>
                        <small className='comment-timestamp'>
                          {timeSince(msg.creationTime)}
                        </small>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className='comments-load-more'>
              {hasMore &&
                !messagesLoading &&
                messages.length >= numOfMessagesPerLoad && (
                  <button
                    className='load-more-button'
                    onClick={getOlderMessages}
                  >
                    {loadingMore ? (
                      <div className='more-messages-loading'>
                        <ClipLoader size={18} color='#fff' />
                      </div>
                    ) : (
                      'Load more'
                    )}
                  </button>
                )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Chatroom
