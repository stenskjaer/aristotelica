import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom'
import { Layout } from 'antd';
import TextItem from './TextItem';
import EditText from './EditText';
import TextList from './TextList';
import Menu from './Menu';

const { Content } = Layout;

class App extends Component {
  render() {
    return (
      <Layout>
        <Menu />
        <Content style={{ padding: '0 50px' }}>
          <div style={{ background: '#fff', padding: 12, minHeight: 280 }}>
            <Switch>
              <Route exact path='/' render={() => <Redirect to='/texts' />} />
              <Route exact path="/texts" component={TextList} />
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
