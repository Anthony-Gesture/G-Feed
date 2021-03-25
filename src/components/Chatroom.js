import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { Button } from 'react-bootstrap'
import { timeSince } from '../utils/utils.js'
import { db } from '../utils/firebase'

import './Chatroom.css'

const Chatroom = ({ match }) => {
  const feedID = match.params.id
  const [hasMore, setHasMore] = useState(true)
  const [messagesBackLength, setMessagesBackLength] = useState(0)
  const feedSorter = new Date().getTime() * -1

  /*
  
  - Do we need messagesBackLength, setMessagesBackLength state still,
      as now we are able to get messages with listener?
      If we don't, we have to refactor our code for the condition of hasMore

  - We do not need fetchComments any longer, as now we got the listener working

  - Also, a wild warning has appeared in the console:
      @firebase/database: FIREBASE WARNING: Using an unspecified index.
      Your data will be downloaded and filtered on the client.
      Consider adding ".indexOn": "sorter" at /social_feed_messages/feed2 to your security rules for better performance. 
    We should ask Daniel to create an index for this?
  
  */

  const [comments, setComments] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchComments()
    firebaseListenToComments(feedID)
  }, [])

  const fetchComments = async () => {
    const res = await axios.get(
      `https://us-central1-gesture-dev.cloudfunctions.net/feed_api/${feedID}/messages?paginateKey=${feedSorter}`
    )

    const sortedMessages = res.data.data.messages.sort(
      (a, b) => b.sorter - a.sorter
    )

    setMessagesBackLength(res.data.data.messages.length)
    setComments(sortedMessages)
  }

  const firebaseListenToComments = id => {
    let startDate = new Date().getTime()
    db.ref(`/social_feed_messages/${id}`)
      .orderByChild('creationTime')
      .startAt(startDate)
      .limitToFirst(2)
      .on('child_added', data => {
        let newComment = data.val()
        console.log(newComment)

        setComments([newComment, ...comments])
      })
  }

  const getOlderMessages = async () => {
    const paginateKey = (comments[comments.length - 1].sorter + 1).toString()

    const res = await axios.get(
      `https://us-central1-gesture-dev.cloudfunctions.net/feed_api/${feedID}/messages?paginateKey=${paginateKey}`
    )

    const olderMessages = res.data.data.messages.sort((a, b) => {
      return b.sorter - a.sorter
    })

    // console.log(olderMessages.length)

    if (olderMessages.length < messagesBackLength) {
      setHasMore(false)
    }

    setComments([...comments, ...olderMessages])
  }

  const postMessage = async e => {
    e.preventDefault()

    try {
      const randomNumber = Math.floor(Math.random() * 100).toString()
      const composerName = 'Tester name ' + randomNumber
      const creationTime = new Date().getTime()
      const sorter = creationTime * -1
      const formData = { message, composerName, creationTime, sorter }

      const res = await axios.post(
        `https://us-central1-gesture-dev.cloudfunctions.net/feed_api/${feedID}/messages`,
        {
          message,
          composerName,
          creationTime,
          sorter,
        }
      )

      if (res.data.code === 'SUCCESS') {
        const duplicateComments = [...comments]
        setComments([formData, ...duplicateComments])
        setMessage('')
      }
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
                <span>Post</span>
              </Button>
            </form>
          </div>
        </div>

        <div className="comments">
          <div className="comments-area">
            {comments
              .sort((a, b) => {
                return a.sorter - b.sorter
              })
              .map(comment => (
                <div className="com-each-comment" key={comment.creationTime}>
                  <div className="user-and-comment">
                    <p className="username-display">
                      <span>{comment.composerName}</span>
                    </p>
                    <p className="com-text-comment">{comment.message}</p>
                  </div>

                  <div className="comment-footer">
                    <small className="comment-timestamp">
                      {timeSince(comment.creationTime)}
                    </small>
                  </div>
                </div>
              ))}
          </div>

          <div className="comments-load-more">
            {hasMore && (
              <button className="load-more-button" onClick={getOlderMessages}>
                Load more
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

export default Chatroom
