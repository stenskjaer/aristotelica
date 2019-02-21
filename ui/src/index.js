import ReactDOM from 'react-dom';
import React from 'react'
import registerServiceWorker from './utils/registerServiceWorker';
import { Route, Router } from 'react-router-dom';
import App from './components/App';
import Auth from './components/Auth';
import history from './utils/history';


import 'antd/dist/antd.css'
import './style/custom.css'

const auth = new Auth();

const handleAuthentication = (nextState, replace) => {
  if (/access_token|id_token|error/.test(nextState.location.hash)) {
    auth.handleAuthentication();
  }
}

export const authRoutes = () => {
  return (
    <Router history={history} component={App}>
      <React.Fragment>
        <Route path="/" render={(props) => (<App auth={auth} {...props} />)} />
        <Route path="/callback" render={(props) => {
          handleAuthentication(props);
          return <div />
        }} />
      </React.Fragment>
    </Router>
  );
}

ReactDOM.render(
  authRoutes(),
  document.getElementById('root')
);

registerServiceWorker();
