import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { Button, Form } from 'react-bootstrap'
import { timeSince } from '../utils/utils.js'
import { db } from '../utils/firebase'
import ClipLoader from 'react-spinners/ClipLoader'

import './Chatroom.css'

// 3/30/2021
// basic spinner added both on chatroom.js and feedscreen.js
// spinner is displayed when feeds/messages are being loaded and when load more button is clicked
// in chatroom.js, when a new message is posted, scroll goes up to the top

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
    // .startAt(startDate * -1) // the bigger the number, the older as it's negative value

    // 3/29/2021 12:14 pm
    // this startAt method has been prohibiting the re-render of the component so far
    // if we disable this, child_added event works. everytime i post something, it gets logged
    // actually we don't even need startAt because it's already been sorted by orderByChild('sorter')

    setMessagesLoading(true)

    messagesRef.on('value', snapshot => {
      // 3/29/2021 12:14 pm
      // either 'value' or 'child_added' is fine
      // the difference is that,
      // to use 'value',
      // we have to make another callback function
      // Ref.on('values', snapshot => {
      //    snapshot.forEach(data => {
      //      // do something...
      //    })
      // })
      //
      // but to use 'child_added',
      // we cannot go deeper any more

      const messagesList = []
      let newestMessage = ''

      snapshot.forEach(data => {
        messagesList.push(data.val())
      })

      setMessages(messagesList)
      setMessagesLoading(false)
      newestMessage = messagesList[0]
      console.log('messagesList:', messagesList)
      console.log('newestMessage:', newestMessage)
    })

    return () => messagesRef.off()
  }, [])

  /*
  // 3.31.2021
  I'll just leave this here as a legacy...or, just in case
  check line 29 and you'll see that getMessages() is not being called any longer
  and we can still get messages through listener

  const getMessages = async paginateKey => {
    setMessagesLoading(true)

    const res = await axios.get(
      `https://us-central1-gesture-dev.cloudfunctions.net/feed_api/${feedID}/messages?paginateKey=${paginateKey}`
    )

      const sortedMessages = res.data.data.messages.sort(
        (a, b) => a.sorter - b.sorter
      )
    
    setMessagesBackLength(res.data.data.messages.length)
    setMessages(res.data.data.messages)
    setMessagesLoading(false)
  }
*/

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
        composerName:
          'Tester Name ' + Math.floor(Math.random() * 100).toString(),
        creationTime: Date.now(),
        sorter: Date.now() * -1,
        message,
      }

      // 3.31.2021
      // sticking to axios.post to post new messages
      // as I noticed that the database started to save items with weird-looking negative value ids
      // as firebase realtime database uses timestamp to create unique ids
      // and firebase listener has perfectly replaced the GET request (getMessages)
      // now the issue we have to fix is:
      // 1. we have to force re-render of messages page when a new message is posted
      //    looks like the page re-renders but only without the timestamp...just why?
      // 2. we have to prevent onChange function inside <input /> from re-rendering after each keystroke
      const res = await axios.post(
        `https://us-central1-gesture-dev.cloudfunctions.net/feed_api/${feedID}/messages`,
        newMessage
      )

      // if I can use firebase methods
      // await db.ref(`/social_feed_messages/${feedID}`).push(newMessage)
      // await db.ref(`/social_feed_messages/${feedID}`).push().set(newMessage)

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
