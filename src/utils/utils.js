// this function is going to be moved to another js file
// for the sake of the cleanliness
export const timeSince = timestamp => {
  const currentTime = new Date().getTime()
  const timeDifference = currentTime - timestamp

  if (timeDifference >= 31536000000) {
    const years = Math.floor(timeDifference / 31536000000)

    return years > 1 ? years + ' years ago' : years + ' year ago'
  } else if (timeDifference >= 2419200000) {
    const months = Math.floor(timeDifference / 2419200000)
    return months > 1 ? months + ' months ago' : months + ' month ago'
  } else if (timeDifference >= 86400000) {
    const days = Math.floor(timeDifference / 86400000)
    return days > 1 ? days + ' days ago' : days + ' day ago'
  } else if (timeDifference >= 3600000) {
    const hours = Math.floor(timeDifference / 3600000)
    return hours > 1 ? hours + ' hours ago' : hours + ' hour ago'
  } else if (timeDifference >= 60000) {
    const minutes = Math.floor(timeDifference / 60000)
    return minutes > 1 ? minutes + ' minutes ago' : minutes + ' minute ago'
  } else if (timeDifference >= 1000) {
    const seconds = Math.floor(timeDifference / 1000)
    return seconds > 1 ? seconds + ' seconds ago' : 'Just now'
  }
}
