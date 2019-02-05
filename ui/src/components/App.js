import React from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import { Switch, Route } from 'react-router-dom'
import { Layout } from 'antd';
import AuthorList from './Authors/AuthorList';
import AuthorDetails from './Authors/AuthorDetails';
import TextDetails from './Texts/TextDetails';
import TextList from './Texts/TextList';
import ManuscriptList from './Manuscripts/ManuscriptList';
import ManuscriptDetails from './Manuscripts/ManuscriptDetails';
import Login from './Login';
import { SideMenu } from './Menu';

const { Sider, Header, Content, Footer } = Layout;


const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_URI
})

function App(props) {

  const auth = props.auth

  return (
    <ApolloProvider client={client}>
      <Layout>
        <Header className="header">
          <h1>Aristotelica</h1>
        </Header>
        <Content style={{ padding: '0 50px' }}>
          <Layout>
            <Sider theme='light'>
              <SideMenu />
              <Login auth={auth} {...props} />
            </Sider>
            <Content>
              <div style={{ background: '#fff', padding: 12, minHeight: '100%' }}>
                <Switch>
                  <Route exact path="/texts" component={TextList} />
                  <Route exact path="/authors" component={AuthorList} />
                  <Route exact path="/author/:id" render={props => <AuthorDetails auth={auth} {...props} />} />
                  <Route exact path="/text/:id" component={TextDetails} />
                  <Route exact path="/manuscripts" component={ManuscriptList} />
                  <Route exact path="/manuscript/:id" render={props => <ManuscriptDetails auth={auth} {...props} />} />
                </Switch>
              </div>
            </Content>
          </Layout>
        </Content>
        <Footer>Footer content</Footer>
      </Layout>
    </ApolloProvider>
  );
}

export default App;
