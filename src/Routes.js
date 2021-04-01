import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ChatRoom from './pages/ChatRoom';
import ChatRoomCreate from './pages/ChatRoomCreate';

class Routes extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={Login}/>
          <Route exact path="/signup" component={Signup}/>
          <Route exact path="/createChat" component={ChatRoomCreate}/>
          <Route exact path="/login" component={Login}/>
          <Route exact path="/chat/:channelId" component={ChatRoom}/>
        </Switch>
      </Router>
    )
  }
}
export default Routes;