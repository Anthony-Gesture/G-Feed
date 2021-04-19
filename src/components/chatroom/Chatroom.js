import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { db } from '../../utils/firebase'
import ClipLoader from 'react-spinners/ClipLoader'
import ChatroomTextInput from './ChatroomTextInput'
import ChatroomMessages from './ChatroomMessages'

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
  const [messagesLoading, setMessagesLoading] = useState(false) // for the spinner when the first 8 messages are being loaded
  const [loadingMore, setLoadingMore] = useState(false) // for the spinner when users click Load more button

  const [name, setName] = useState('')
  const [uid, setUid] = useState('')

  let search = window.location.search
  let parameter = new URLSearchParams(search)
  const tokenId = parameter.get('tokenId') || '' // composerName = 'Misbah' if tokenId === '123' else 'Anthony' go check FeedScreen.js line 16

  useEffect(() => {
    window.scrollTo(0, 0)

    handleSetUserName()

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

  const handleSetUserName = async () => {
    const userRes = await axios.get(
      `https://us-central1-gesture-dev.cloudfunctions.net/feed_api/tokens/${tokenId}`
    )

    if (!userRes) return

    setName(userRes.data.data.name)
    setUid(userRes.data.data.uid)
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
        <ChatroomTextInput tokenid={tokenId} feedid={feedID} name={name} />

        {messagesLoading && (
          <div className='messages-loading'>
            <ClipLoader size={40} color='#8585ff' />
          </div>
        )}
        <div id='comments' className='comments'>
          <div
            id='comments-scrollable-area'
            className='comments-scrollable-area'
          >
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
                    <ChatroomMessages key={msg.creationTime} msg={msg} />
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
