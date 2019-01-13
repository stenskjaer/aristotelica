import ReactDOM from 'react-dom';
import React from 'react'
import registerServiceWorker from './registerServiceWorker';
import { Route, Router } from 'react-router-dom';
import App from './components/App';
import Auth from './components/Auth';
import Callback from './components/Callback';
import history from './components/history';


import 'antd/dist/antd.css'
import './style/custom.css'

const auth = new Auth();

const handleAuthentication = (nextState, replace) => {
  if (/access_token|id_token|error/.test(nextState.location.hash)) {
    auth.handleAuthentication();
  }
}

export const authRouting = () => {
  return (
    <Router history={history} component={App}>
      <div>
        <Route path="/" render={(props) => <App auth={auth} {...props} />} />
        <Route path="/callback" render={(props) => {
          console.log("callback:", props)
          handleAuthentication(props);
          return <Callback {...props} />
        }} />
      </div>
    </Router>
  );
}

ReactDOM.render(
  authRouting(),
  document.getElementById('root')
);

registerServiceWorker();
