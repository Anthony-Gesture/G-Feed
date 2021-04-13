import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import FeedScreen from './components/FeedScreen'
import Chatroom from './components/Chatroom'
import Navbar from './components/Navbar'
import ReportScreen from './components/ReportScreen'

import './bootstrap.min.css'
import './App.css'

const App = () => {
  return (
    <>
      <Router>
        <Navbar />
        <Switch>
          <Route exact path='/' component={FeedScreen} />
          <Route exact path='/report' component={ReportScreen} />
          <Route exact path='/:id/messages' component={Chatroom} />
        </Switch>
      </Router>
    </>
  )
}

export default App
