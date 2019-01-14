import React from 'react'
import { Link } from 'react-router-dom'
import { Menu } from 'antd';

const { Item } = Menu;

export function SideMenu() {
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

