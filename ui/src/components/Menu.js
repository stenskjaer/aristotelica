import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import { Menu } from 'antd';

const { Item } = Menu;

class SideMenu extends Component {
  render() {
    return (
      <Menu theme="light">
        <Item key="1">
          <Link to="/">
            Main
          </Link>
        </Item>
        <Item key="2">
          <Link to="/texts">
            Texts
          </Link>
        </Item>
      </Menu>
    );
  }
}

export default withRouter(SideMenu);
