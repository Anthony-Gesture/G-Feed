import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { Button } from 'react-bootstrap'
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

  const messageSorter = new Date().getTime() * -1

  const [hasMore, setHasMore] = useState(true)
  const [messagesBackLength, setMessagesBackLength] = useState(0)
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')

  const [messagesLoading, setMessagesLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    console.log('getMessages in useEffect starts') // 1
    getMessages(messageSorter)
    console.log('getMessages in useEffect ends') // 3

    // let startDate = new Date().getTime()

    let messagesRef = db
      .ref(`/social_feed_messages/${feedID}`)
      .orderByChild('sorter')
      .limitToFirst(1) // the newest data is on top
    // .startAt(startDate * -1) // the bigger the number, the older as it's negative value

    // 3/29/2021 12:14 pm
    // this startAt method has been prohibiting the re-render of the component so far
    // if we disable this, child_added event works. everytime i post something, it gets logged
    // actually we don't even need startAt because it's already been sorted by orderByChild('sorter')

    // now what needs to be done is to be able to turn all the objects data.val() into one array
    // that we can map through and push into another array (our messages state) with spread operator

    console.log('Listener in useEffect starts') // 4
    messagesRef.on('child_added', data => {
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

      let newestMessage = data.val()
      console.log('Newest message from database:', newestMessage)
    })

    console.log('Listener in useEffect ends') // 5

    return () => messagesRef.off()
  }, [feedID])

  const getMessages = async paginateKey => {
    console.log('getMessages declaration starts') // 2
    setMessagesLoading(true)

    const res = await axios.get(
      `https://us-central1-gesture-dev.cloudfunctions.net/feed_api/${feedID}/messages?paginateKey=${paginateKey}`
    )

    /*
      const sortedMessages = res.data.data.messages.sort(
        (a, b) => a.sorter - b.sorter
      )
    */
    setMessagesBackLength(res.data.data.messages.length)

    setMessages(res.data.data.messages)

    setMessagesLoading(false)

    console.log('getMessages declaration ends') // 6
  }

  const getOlderMessages = async () => {
    console.log('getOlderMessages starts')
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

    if (olderMessages.length < messagesBackLength) {
      setHasMore(false)
    }

    setMessages([...messages, ...olderMessages])

    setLoadingMore(false)
    console.log('getOlderMessages ends')
  }

  const postMessage = async e => {
    e.preventDefault()
    console.log('postMessages starts')
    setPosting(true)

    try {
      /*
      const randomNumber = Math.floor(Math.random() * 100).toString()
      const composerName = 'Tester name ' + randomNumber
      const creationTime = new Date().getTime()
      const sorter = creationTime * -1
      const formData = { message, composerName, creationTime, sorter }

      const res = await axios.post(
        `https://us-central1-gesture-dev.cloudfunctions.net/feed_api/${feedID}/messages`,
        { message, composerName, creationTime, sorter }
      )

      if (res.data.code === 'SUCCESS') {
        setMessages([formData, ...messages])
        setMessage('')
      } */

      const newMessage = {
        composerName:
          'Tester Name ' + Math.floor(Math.random() * 100).toString(),
        creationTime: new Date().getTime(),
        sorter: new Date().getTime() * -1,
        message,
      }

      console.log('Message just posted:', newMessage)
      setMessages([newMessage, ...messages])
      setMessage('')

      console.log('postMessages ends')
      await db.ref(`/social_feed_messages/${feedID}`).push(newMessage)
      document.getElementById('comments').scrollTo(0, 0) // scroll to top after a new message is posted
      setPosting(false)
    } catch (error) {
      console.log('postMessages ends')
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
            <form className="comment-send-form" onSubmit={postMessage}>
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
            </form>
          </div>
        </div>

        {messagesLoading && (
          <div className="messages-loading">
            <ClipLoader size={40} color="#8585ff" />
          </div>
        )}
        <div id="comments" className="comments">
          <div className="comments-area">
            {messages
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
              ))}
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
