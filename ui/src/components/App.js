import React, { Component } from 'react';
import { Switch, Route, Redirect, Router } from 'react-router-dom'
import { Layout, Button } from 'antd';
import history from './history';
import Auth from './Auth';
import AuthorList from './Authors/AuthorList';
import Callback from './Callback';
import EditAuthor from './Authors/EditAuthor';
import TextItem from './Texts/TextItem';
import EditText from './Texts/EditText';
import TextList from './Texts/TextList';
import { SideMenu, TopMenu } from './Menu';

const { Sider, Header } = Layout

const { Content } = Layout;

const auth = new Auth();

class App extends Component {

  login() {
    auth.login();
  }

  logout() {
    auth.logout();
  }

  render() {

    const { isAuthenticated } = auth;
    return (
      <Layout>
        {
          !isAuthenticated() && (
            <Button
              onClick={() => this.login()}
            >
              Log In
            </Button>
          )
        }
        {
          isAuthenticated() && (
            <Button
              onClick={() => this.logout()}
            >
              Log Out
            </Button>
          )
        }
        <Header className="header">
          <TopMenu />
        </Header>
        <Content style={{ padding: '0 50px' }}>
          <Layout>
            <Sider>
              <SideMenu />
            </Sider>
            <Content>
              <div style={{ background: '#fff', padding: 12, minHeight: 280 }}>
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

      </Layout>
    );
  }
}

export default App;
