import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom'
import App from './components/App';
import Auth from './components/Auth';
import Callback from './components/Callback';
import registerServiceWorker from './registerServiceWorker';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';

import 'antd/dist/antd.css'
import './style/custom.css'

const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_URI
})

const auth = new Auth();
const handleAuthentication = (nextState, replace) => {
  if (/access_token|id_token|error/.test(nextState.location.hash)) {
    auth.handleAuthentication();
  }
}

const Main = () => (
  <BrowserRouter>
    <ApolloProvider client={client}>
      <Route path="/callback" render={(props) => {
        handleAuthentication(props);
        return <Callback {...props} />
      }} />
      <App />
    </ApolloProvider>
  </BrowserRouter>
)

ReactDOM.render(<Main />, document.getElementById('root'));
registerServiceWorker();
