import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from 'react-bootstrap'
import EditFeedModal from '../layout/modals/EditFeedModal'

const Feed = ({ feed, tokenid, userid }) => {
  const [feedID, setFeedID] = useState(feed.id) // to pass feed id to modal
  const [feedOwnerID, setFeedOwnerID] = useState(feed.ownder_id)
  const [modalShow, setModalShow] = useState(false)

  // let search = window.location.search
  // let parameter = new URLSearchParams(search)
  // const tokenId = parameter.get('tokenId') // composerName = 'Misbah' if tokenId === '123' else 'Anthony' go check FeedScreen.js line 16

  const handleModalGetFeedID = data => {
    setFeedID(data.id)
    setFeedOwnerID(data.owner_id)
    setModalShow(true)
  }

  return (
    <>
      {' '}
      <EditFeedModal
        uid={userid}
        show={modalShow}
        tokenid={tokenid}
        ispublic={feed.sorter}
        feedid={feedID}
        feedownerid={feedOwnerID}
        onHide={() => setModalShow(false)}
      />
      <Card key={feed.id}>
        <Card.Header className='feed-post-header'>
          <p className='post-fromto-info my-1 text-center'>
            <span className='post-fromto'>{feed.from}</span> sent a Gesture to{' '}
            <span className='post-fromto'>{feed.to}</span>
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
            <small>Posted on {feed.creationTime}</small>{' '}
            {userid === feed.owner_id ? (
              <p>This is your post.</p>
            ) : (
              <p>This is your friend's post.</p>
            )}
          </div>

          <div className='post-chatroom-btn'>
            <Link
              to={`/${feed.id}/messages?tokenId=${tokenid}`}
              className='post-chatroom-button'
            >
              <i className='fas fa-comments'></i>
            </Link>
          </div>
        </Card.Footer>
      </Card>
    </>
  )
}

export default Feed
