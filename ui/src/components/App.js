import React, { Component } from 'react'
import { Layout } from 'antd';
import TextItem from './TextItem'
import TextList from './TextList';

const { Content } = Layout;

class App extends Component {
  render() {
    return (
        <Layout>
          <Content style={{ padding: '0 50px' }}>
            <div style={{ background: '#fff', padding: 12, minHeight: 280 }}>
              <h1>Welcome to Commentaria Aristotelica</h1>
              <TextItem item="86"/>
              <TextList />
            </div>
          </Content>
        </Layout>
    );
  }
}

export default App;
