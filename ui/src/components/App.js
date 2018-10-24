import React, { Component } from 'react'
import TextItem from './TextItem'

// Layout 
import { Layout } from 'antd';
const { Content } = Layout;

class App extends Component {
  render() {
    return (
        <Layout>
          <Content style={{ padding: '0 50px' }}>
            <div style={{ background: '#fff', padding: 12, minHeight: 280 }}>
              <h1>Welcome to Commentaria Aristotelica</h1>
              <TextItem item="180"/>
            </div>
          </Content>
        </Layout>
    );
  }
}

export default App;
