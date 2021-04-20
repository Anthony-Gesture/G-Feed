import React, { useState, useEffect } from 'react'
import axios from 'axios'
import ClipLoader from 'react-spinners/ClipLoader'
import Feed from './Feed'

import './FeedScreen.css'

const FeedScreen = () => {
  const [feeds, setFeeds] = useState([])
  const [loadingFeeds, setLoadingFeeds] = useState(false)
  const [loadingMoreFeeds, setLoadingMoreFeeds] = useState(false)

  // const [feedID, setFeedID] = useState('') // to pass feed id to modal
  // const [feedOwnerID, setFeedOwnerID] = useState('')
  // const [isPrivate, setIsPrivate] = useState(null)
  // const [modalShow, setModalShow] = useState(false)

  const [name, setName] = useState('')
  const [uid, setUid] = useState('')

  const [numberOfReports, setNumberOfReports] = useState(0)

  let search = window.location.search
  let parameter = new URLSearchParams(search)
  const tokenId = parameter.get('tokenId') || '124' // composerName = 'Misbah' if tokenId === '123' else 'Anthony'

  useEffect(() => {
    window.scrollTo(0, 0)

    const fetchFeeds = async () => {
      setLoadingFeeds(true)

      const res = await axios.get(
        `https://us-central1-gesture-dev.cloudfunctions.net/feed_api?tokenId=${tokenId}`
      )
      const currentFeeds = res.data.data

      setFeeds(currentFeeds)

      setLoadingFeeds(false)
    }

    const getUserIdAndName = async () => {
      const userRes = await axios.get(
        `https://us-central1-gesture-dev.cloudfunctions.net/feed_api/tokens/${tokenId}`
      )

      if (!userRes) return

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

  return (
    <>
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
              // sorts the array by creationTime
              // the latest feed displays on top
              return b.creationTime - a.creationTime
            })
            .map(feed => (
              <Feed key={feed.id} feed={feed} tokenid={tokenId} userid={uid} />
            ))}

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
