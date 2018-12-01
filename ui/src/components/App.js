import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom'
import { Layout } from 'antd';
import AuthorList from './Authors/AuthorList';
import AuthorDetails from './Authors/AuthorDetails';
import EditAuthor from './Authors/EditAuthor';
import TextItem from './Texts/TextItem';
import EditText from './Texts/EditText';
import TextList from './Texts/TextList';
import SideMenu from './Menu';

const { Sider } = Layout

const { Content } = Layout;

class App extends Component {
  render() {
    return (
      <Layout>
        <Sider>
          <SideMenu />
        </Sider>
        <Content style={{ padding: '0 50px' }}>
          <div style={{ background: '#fff', padding: 12, minHeight: 280 }}>
            <Switch>
              <Route exact path='/' render={() => <Redirect to='/texts' />} />
              <Route exact path="/texts" component={TextList} />
              <Route exact path="/authors" component={AuthorList} />
              <Route exact path="/author/:id" component={AuthorDetails} />
              <Route exact path="/author/edit/:id" component={EditAuthor} />
              <Route exact path="/text/:id" component={TextItem} />
              <Route exact path="/text/edit/:id" component={EditText} />
            </Switch>
          </div>
        </Content>
      </Layout>
    );
  }
}

export default App;
