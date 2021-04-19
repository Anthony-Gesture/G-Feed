import React from 'react'
import { timeSince } from '../../utils/utils.js'

const ChatroomMessages = ({ msg }) => {
  return (
    <>
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
    </>
  )
}

export default ChatroomMessages
