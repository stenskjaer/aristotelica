import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import { Layout } from 'antd';

const { Header } = Layout;

class Menu extends Component {
  render() {
    return (
      <Layout>
        <Header>
          <Link to="/">
            Main
          </Link>
          <Link to="/texts">
            Texts
          </Link>
        </Header>
      </Layout>
    );
  }
}

export default withRouter(Menu);
