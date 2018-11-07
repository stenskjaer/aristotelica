import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';

import 'antd/dist/antd.css'
import './style/custom.css'

const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_URI
})

const Main = () => (
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>
)

ReactDOM.render(<Main />, document.getElementById('root'));
registerServiceWorker();
