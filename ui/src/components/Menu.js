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

export class TopMenu extends React.Component {
  render() {
    return (
      <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={['2']}
        style={{ lineHeight: '64px' }}
      >
        <Menu.Item key="1">nav 1</Menu.Item>
        <Menu.Item key="2">nav 2</Menu.Item>
        <Menu.Item key="3">nav 3</Menu.Item>
      </Menu>
    )
  }
}

