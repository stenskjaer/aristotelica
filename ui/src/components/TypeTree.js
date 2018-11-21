import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Tree, Icon } from 'antd';

const TEXT_TYPES = gql`
query TextType {
  TextType {
    id
    name
    parent { id }
    children {
      id
      name
      parent { id }
    }
  }
}
`

const THIS_TEXT_TYPES = gql`
  query Text($id: ID!) {
    Text(id: $id) {
      id
      types {
        name
        id
        children {
          name
          id
        }
      }
    }
  }
`

class TypeTree extends Component {

  annotateTree = (fullTree, includedNodes) => (
    fullTree.map(node => ({
      ...node,
      icon: includedNodes.includes(node.key) ? <Icon type="check" /> : null,
      children: node.children && node.children.length > 0 ? this.annotateTree(node.children, includedNodes) : [],
    }))
  )

  setAllTypes = (data) => (
    data.map(type => ({
      title: type.name,
      key: type.id,
      value: type.id,
      icon: <Icon type="smile-o" />,
      children: type.children && type.children.length > 0 ? this.setAllTypes(type.children) : [],
    }))
  )

  renderTreeNodes = (data) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <Tree.TreeNode title={item.title} key={item.key} dataRef={item} icon={item.icon}>
            {this.renderTreeNodes(item.children)}
          </Tree.TreeNode>
        );
      }
      return <Tree.TreeNode {...item} />;
    });
  }

  render() {

    return (
      <Query query={TEXT_TYPES} >
        {({ loading, error, data }) => {
          if (loading) return <div>Fetching</div>
          if (error) return <div>{error.message}</div>

          // Build type tree from the root nodes.
          const typeTree = this.setAllTypes(data.TextType.filter(x => x.parent === null));

          return (
            <Query query={THIS_TEXT_TYPES} variables={{ id: this.props.textId }}>
              {({ loading, error, data }) => {
                if (loading) return <div>Fetching</div>
                if (error) return <div>{error.message}</div>

                const types = data.Text ? data.Text[0].types : undefined
                if (!types) {
                  console.log("Error getting the types field on the item ID ", data.Text.id)
                }
                const currentTypes = types.map(item => (item.id))
                const annotatedTree = this.annotateTree(typeTree, currentTypes)

                return (
                  <Tree
                    treeData={annotatedTree}
                    showIcon
                    defaultExpandAll
                  />
                )
              }}
            </Query>
          )
        }}
      </Query >
    );
  }
}

export default TypeTree