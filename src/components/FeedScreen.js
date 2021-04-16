import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { Card } from 'react-bootstrap'
import ClipLoader from 'react-spinners/ClipLoader'
import EditFeedModal from './layout/EditFeedModal'

import './FeedScreen.css'

const FeedScreen = () => {
  const [feeds, setFeeds] = useState([])
  const [loadingFeeds, setLoadingFeeds] = useState(false)
  const [loadingMoreFeeds, setLoadingMoreFeeds] = useState(false)
  const [modalShow, setModalShow] = useState(false)
  const [feedID, setFeedID] = useState('') // to pass feed id to modal
  const [feedOwnerID, setFeedOwnerID] = useState('')
  const [name, setName] = useState('')
  const [uid, setUid] = useState('')

  let search = window.location.search
  let parameter = new URLSearchParams(search)
  const tokenId = parameter.get('tokenId') // composerName = 'Misbah' if tokenId === '123' else 'Anthony' go check FeedScreen.js line 16

  useEffect(() => {
    window.scrollTo(0, 0)

    const fetchFeeds = async () => {
      setLoadingFeeds(true)

      const res = await axios.get(
        'https://us-central1-gesture-dev.cloudfunctions.net/feed_api'
      )
      const currentFeeds = res.data.data

      setFeeds(currentFeeds)

      setLoadingFeeds(false)
    }

    const getUserIdAndName = async () => {
      const userRes = await axios.get(
        `https://us-central1-gesture-dev.cloudfunctions.net/feed_api/tokens/${tokenId}`
      )

      setName(userRes.data.data.name)
      setUid(userRes.data.data.uid)
    }

    fetchFeeds()
    getUserIdAndName()
  }, [])

  const getOlderFeeds = async () => {
    setLoadingMoreFeeds(true)

    const res = await axios.get(
      'https://us-central1-gesture-dev.cloudfunctions.net/feed_api?paginate=23'
    )

    const olderFeeds = res.data.data.sort((a, b) => {
      return b.creationTime - a.creationTime
    })

    setFeeds([...feeds, ...olderFeeds])

    setLoadingMoreFeeds(false)
  }

  const handleModalGetFeedID = data => {
    setFeedID(data.id)
    setFeedOwnerID(data.owner_id)
    setModalShow(true)
  }

  return (
    <>
      <EditFeedModal
        uid={uid}
        // tokenId={tokenId}
        show={modalShow}
        feedid={feedID}
        feedownerid={feedOwnerID}
        // setfeedownerid={setFeedOwnerID}
        // setFeedID={setFeedID}
        onHide={() => setModalShow(false)}
      />

      <header className='navbar-feed-screen new-navbar'>
        <img
          src='https://sendagesture.com/static/media/New_Gesture_Logo.cfb01162.png'
          alt='Gesture Logo'
        />
      </header>

      <div>
        <section>
          {loadingFeeds && (
            <div className='feeds-loading'>
              <ClipLoader size={50} color='#8585ff' />
            </div>
          )}
          {feeds
            .sort((a, b) => {
              // sorts the array by createdAt
              // the latest feed displays on top
              return b.createdAt - a.createdAt
            })
            .map(feed => {
              return (
                <Card key={feed.id}>
                  <Card.Header className='feed-post-header'>
                    <p className='post-fromto-info my-1 text-center'>
                      <span className='post-fromto'>{feed.from}</span> sent a
                      Gesture to <span className='post-fromto'>{feed.to}</span>
                    </p>

                    <span>
                      <button
                        className='edit-button'
                        onClick={() => handleModalGetFeedID(feed)}
                      >
                        <i className='fas fa-ellipsis-h'></i>
                      </button>
                    </span>
                  </Card.Header>

                  {feed.main_image ? (
                    <Card.Body className='feed-post-body'>
                      <img
                        src={feed.main_image}
                        alt={`A Gesture sent from ${feed.from} to ${feed.to}`}
                        className='feed-post-main-image'
                      />

                      <div className='split-line'></div>

                      <div className='message-doodle'>
                        <div className='post-message text-center'>
                          <p className='m-0'>
                            <i className='fas fa-quote-left'></i>
                            <em>
                              {feed.message?.length > 100
                                ? feed.message.substring(0, 100) + '...'
                                : feed.message}
                            </em>
                            <i className='fas fa-quote-right'></i>
                          </p>
                        </div>

                        <div className='post-sub-image'>
                          <img
                            src={feed.sub_image}
                            alt={'A doodle created by ' + feed.from}
                            className='feed-post-sub-image'
                          />
                        </div>
                      </div>
                    </Card.Body>
                  ) : (
                    <Card.Body className='feed-post-body'>
                      <div className='split-line'></div>

                      <div className='message-doodle'>
                        <div className='post-message text-center'>
                          <p className='m-0'>
                            <i className='fas fa-quote-left'></i>
                            <em>
                              {feed.message?.length > 100
                                ? feed.message.substring(0, 100) + '...'
                                : feed.message}
                            </em>

                            <i className='fas fa-quote-right'></i>
                          </p>
                        </div>

                        <div className='post-sub-image'>
                          <img
                            src={feed.sub_image}
                            alt={'A doodle created by ' + feed.from}
                            className='feed-post-sub-image'
                          />
                        </div>
                      </div>
                    </Card.Body>
                  )}

                  <div className='split-line mb-3'></div>

                  <Card.Footer className='feed-post-footer'>
                    <div className='post-timestamp'>
                      <small>Posted on {feed.createdAt}</small>{' '}
                      {`uid123` === feed.owner_id ? (
                        <p>This is your post.</p>
                      ) : (
                        <p>This is your friend's post.</p>
                      )}
                    </div>

                    <div className='post-chatroom-btn'>
                      <Link
                        to={`/${feed.id}/messages?tokenId=${tokenId}`}
                        className='post-chatroom-button'
                      >
                        <i className='fas fa-comments'></i>
                      </Link>
                    </div>
                  </Card.Footer>
                </Card>
              )
            })}

          {!loadingFeeds && (
            <button
              className='load-more-btn load-more-feeds'
              onClick={getOlderFeeds}
            >
              {loadingMoreFeeds ? (
                <div className='more-feeds-loading'>
                  <ClipLoader size={18} color='#fff' />
                </div>
              ) : (
                'Load more'
              )}
            </button>
          )}
        </section>
      </div>
    </>
  )
}

export default FeedScreen
