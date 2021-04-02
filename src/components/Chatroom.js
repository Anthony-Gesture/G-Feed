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

  const [hasMore, setHasMore] = useState(true)
  const [messages, setMessages] = useState([])

  const [message, setMessage] = useState('')

  const [messagesLoading, setMessagesLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    // getMessages(messageSorter)

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
      // let newestMessage = ''

      snapshot.forEach(data => {
        messagesList.push(data.val())
      })

      setMessages(messagesList)
      setMessagesLoading(false)
    })

    return () => messagesRef.off()
  }, [feedID])

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

      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      }
      const res = await axios.post(
        `https://us-central1-gesture-dev.cloudfunctions.net/feed_api/${feedID}/messages`,
        newMessage,
        config
      )

      console.log('res.data.data.message:', res.data.data.message)

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
                  <ClipLoader size={20} color="#8585ff" />
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
