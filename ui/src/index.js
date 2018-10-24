import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';

import "antd/dist/antd.css"

const client = new ApolloClient({
    uri: process.env.REACT_APP_GRAPHQL_URI
})

const Main = () => (
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>
)

ReactDOM.render(<Main />, document.getElementById('root'));
registerServiceWorker();
