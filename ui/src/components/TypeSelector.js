import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { TreeSelect } from 'antd';

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

const ADD_TYPE = gql`
  mutation AddTextType(
    $texttext_id: ID!,
    $texttypeid: ID!
  ){
    AddTextType(
      texttext_id: $texttext_id, 
      texttypeid: $texttypeid
    ) {
      title
      type {
        name
        id
      }
    }
  }
`

const REMOVE_TYPE = gql`
  mutation RemoveTextType(
    $texttext_id: ID!,
    $texttypeid: ID!
  ){
    RemoveTextType(
      texttext_id: $texttext_id, 
      texttypeid: $texttypeid
    ) {
      type {
        name
        id
      }
    }
  }
`

class TypeSelector extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: this.setCurrentTypes(props.currentTextTypes)
    }
  }

  onChange = (value, node, extra) => {
    this.setState({ value });
    this.handleTypeUpdate(
      {
        hasRelation: !extra.checked,
        variables: {
          texttext_id: this.props.textId,
          texttypeid: extra.triggerValue
        }
      }
    )
  }

  setCurrentTypes = (data) => (
    (data.map(item => (
      {
        label: item.name,
        value: item.id
      }
    )))
  )

  setAllTypes = (data) => {
    return (
      data.map(type => ({
        title: type.name,
        key: type.id,
        value: type.id,
        children: type.children && type.children.length > 0 ? this.setAllTypes(type.children) : [],
      }))
    )
  }

  handleTypeUpdate = async ({ hasRelation, variables }) => {
    // Determine which mutation to use, based on `hasRelation` value.
    const TYPE_MUTATION = hasRelation === true ? REMOVE_TYPE : ADD_TYPE
    // Run the mutation.
    const { errors } = await this.props.client.mutate({
      mutation: TYPE_MUTATION,
      variables: variables
    });
    if (errors) {
      console.log(errors)
    }
  }

  render() {

    return (
      <Query query={TEXT_TYPES}>
        {({ loading, error, data }) => {
          if (loading) return <div>Fetching</div>
          if (error) return <div>Error: {this.props.data.error.message}</div>

          // Build type tree from the root nodes.
          const typeTree = this.setAllTypes(data.TextType.filter(x => x.parent === null))

          return (
            <TreeSelect
              style={{ width: 300 }}
              value={this.state.value}
              dropdownStyle={{ maxHeight: 500, overflow: 'auto' }}
              treeData={typeTree}
              placeholder="Select type"
              treeDefaultExpandAll
              multiple
              treeCheckable
              treeCheckStrictly
              onChange={(value, node, extra) => this.onChange(value, node, extra)}
            />
          )
        }}

      </Query>
    );
  }
}

export default TypeSelector