import React, { Component } from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import { Switch, Route } from 'react-router-dom'
import { Layout } from 'antd';
import AuthorList from './Authors/AuthorList';
import EditAuthor from './Authors/EditAuthor';
import TextItem from './Texts/TextItem';
import EditText from './Texts/EditText';
import TextList from './Texts/TextList';
import Login from './Login';
import { SideMenu } from './Menu';

const { Sider, Header, Content, Footer } = Layout;


const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_URI
})

class App extends Component {

  render() {
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
                <Login auth={this.props.auth} />
              </Sider>
              <Content>
                <div style={{ background: '#fff', padding: 12, minHeight: '100%' }}>
                  <Switch>
                    <Route exact path="/texts" component={TextList} />
                    <Route exact path="/authors" component={AuthorList} />
                    <Route exact path="/author/:id" component={EditAuthor} />
                    <Route exact path="/text/:id" component={TextItem} />
                    <Route exact path="/text/edit/:id" component={EditText} />
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
}

export default App;
