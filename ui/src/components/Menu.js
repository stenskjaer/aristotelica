import React from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import { Menu } from 'antd';

const { Item } = Menu;

function SideMenu() {
  return (
    <Menu theme="light">
      <Item key="home">
        <Link to="/">
          Main
        </Link>
      </Item>
      <Item key="texts">
        <Link to="/texts">
          Texts
        </Link>
      </Item>
      <Item key="authors">
        <Link to="/authors">
          Authors
        </Link>
      </Item>
    </Menu>
  );
}

export default withRouter(SideMenu);
