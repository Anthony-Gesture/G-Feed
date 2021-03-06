import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import FeedScreen from './components/feedscreen/FeedScreen'
import Chatroom from './components/chatroom/Chatroom'
import Navbar from './components/Navbar'

import './bootstrap.min.css'
import './App.css'

const App = () => {
  return (
    <>
      <Router>
        <Navbar />
        <Switch>
          <Route exact path='/:tokenId?' component={FeedScreen} />
          <Route exact path='/:id/messages' component={Chatroom} />
        </Switch>
      </Router>
    </>
  )
}

export default App
