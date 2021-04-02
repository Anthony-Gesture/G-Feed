import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { Button, Form } from 'react-bootstrap'
import { timeSince } from '../utils/utils.js'
import { db } from '../utils/firebase'
import ClipLoader from 'react-spinners/ClipLoader'

import './Chatroom.css'

const Chatroom = ({ match }) => {
  const feedID = match.params.id
  const numOfMessagesPerLoad = 8

  const [hasMore, setHasMore] = useState(true) // for the Load more button display
  const [messages, setMessages] = useState([]) // all the messages for each feed
  const [message, setMessage] = useState('') // message - text input

  const [messagesLoading, setMessagesLoading] = useState(false) // for the spinner when the first 8 messages are being loaded
  const [loadingMore, setLoadingMore] = useState(false) // for the spinner when users click Load more button
  const [posting, setPosting] = useState(false) // for the spinner when users click Post button

  useEffect(() => {
    let messagesRef = db
      .ref(`/social_feed_messages/${feedID}`)
      .orderByChild('sorter')
      .limitToFirst(numOfMessagesPerLoad) // the first {8} newest data

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

    try {
      const newMessage = {
        message,
        creationTime: Date.now(),
        sorter: Date.now() * -1,
        composerName:
          'Tester Name ' + Math.floor(Math.random() * 100).toString(),
      }

      // 4/2/2021
      // I think the reason it's working now
      // is because I specified the content type of the POST data?
      // turns out to be not the case (specifying the content type of data)
      /*
      const config = {
        headers: {
          'Content-Type': 'application/json
        }
      }
      */

      // 3.31.2021
      // sticking to axios.post to post new messages
      // as I noticed that the database started to save items with weird-looking negative value ids
      // as firebase realtime database uses timestamp to create unique ids
      // and firebase listener has perfectly replaced the GET request (getMessages)
      const res = await axios.post(
        `https://us-central1-gesture-dev.cloudfunctions.net/feed_api/${feedID}/messages`,
        newMessage
        // config
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
      <section className="main-comments">
        <div className="main-comments-top">
          <div className="main-comments-go-back">
            <Link to="/" className="go-back-btn">
              <div className="go-back">
                <i className="fas fa-chevron-circle-left fa-2x"></i>
              </div>
            </Link>

            <div className="main-comments-sender-info">
              <p className="post-fromto-info my-1 comments-sender-info">
                Comments
              </p>
            </div>
          </div>

          <div className="comment-form">
            <Form className="comment-send-form" onSubmit={postMessageHandler}>
              <input
                type="text"
                name="text"
                value={message}
                placeholder="Say something..."
                className="comment-form-input"
                onChange={e => setMessage(e.target.value)}
              />

              <Button
                className="msg-send-button"
                type="submit"
                disabled={message.length === 0}
              >
                {posting ? (
                  <span>
                    <ClipLoader size={20} color="#8585ff" />
                  </span>
                ) : (
                  <span>Post</span>
                )}
              </Button>
            </Form>
          </div>
        </div>

        {messagesLoading && (
          <div className="messages-loading">
            <ClipLoader size={40} color="#8585ff" />
          </div>
        )}
        <div id="comments" className="comments">
          <div className="comments-area">
            {messages.length === 0 && !messagesLoading ? (
              <div style={{ textAlign: 'center' }}>
                <p>This feed has no messages yet.</p>
              </div>
            ) : (
              messages
                .sort((a, b) => {
                  return a.sorter - b.sorter
                })
                .map(msg => (
                  <div className="com-each-comment" key={msg.creationTime}>
                    <div className="user-and-comment">
                      <p className="username-display">
                        <span>{msg.composerName}</span>
                      </p>
                      <p className="com-text-comment">{msg.message}</p>
                    </div>

                    <div className="comment-footer">
                      <small className="comment-timestamp">
                        {timeSince(msg.creationTime)}
                      </small>
                    </div>
                  </div>
                ))
            )}
          </div>

          <div className="comments-load-more">
            {hasMore &&
              !messagesLoading &&
              messages.length >= numOfMessagesPerLoad && (
                <button className="load-more-button" onClick={getOlderMessages}>
                  {loadingMore ? (
                    <div className="more-messages-loading">
                      <ClipLoader size={18} color="#fff" />
                    </div>
                  ) : (
                    'Load more'
                  )}
                </button>
              )}
          </div>
        </div>
      </section>
    </>
  )
}

export default Chatroom
