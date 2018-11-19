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

const ADD_TYPE = gql`
  mutation AddTextTypes(
    $textid: ID!,
    $texttypeid: ID!
  ){
    AddTextTypes(
      textid: $textid, 
      texttypeid: $texttypeid
    ) {
      types {
        __typename
        id
      }
    }
  }
`

const REMOVE_TYPE = gql`
  mutation RemoveTextTypes(
    $textid: ID!,
    $texttypeid: ID!
  ){
    RemoveTextTypes(
      textid: $textid, 
      texttypeid: $texttypeid
    ) {
      types {
        __typename
        id
      }
    }
  }
`

class TypeSelector extends Component {

  onChange = (value, node, extra) => {
    this.handleTypeUpdate(
      {
        hasRelation: !extra.checked,
        variables: {
          textid: this.props.textId,
          texttypeid: extra.triggerValue,
        }
      }
    )
  }

  setCurrentTypes = (data) => (
    data.map(item => (
      {
        label: item.name,
        value: item.id
      }
    ))
  )

  setAllTypes = (data) => (
    data.map(type => ({
      title: type.name,
      key: type.id,
      value: type.id,
      children: type.children && type.children.length > 0 ? this.setAllTypes(type.children) : [],
    }))
  )

  handleTypeUpdate = async ({ hasRelation, variables }) => {
    // Determine which mutation to use, based on `hasRelation` value.
    if (hasRelation === true) {
      // Run the mutation.
      const { errors } = await this.props.client.mutate({
        mutation: REMOVE_TYPE,
        variables: variables,
        refetchQueries: ['thisTextTypes'],
        optimisticResponse: {
          "RemoveTextTypes": {
            __typename: "Text",
            types: [
              {
                id: variables.texttypeid,
                __typename: 'TextType',
              }
            ]
          }
        }
      });
      if (errors) {
        console.log(errors)
      }
    } else {
      const { errors } = await this.props.client.mutate({
        mutation: ADD_TYPE,
        variables: variables,
        refetchQueries: ['thisTextTypes'],
        optimisticResponse: {
          "AddTextTypes": {
            __typename: "Text",
            types: [
              {
                id: variables.texttypeid,
                __typename: 'TextType',
              }
            ]
          }
        }
      });
      if (errors) {
        console.log(errors)
      }
    }
  }

  // IMPLEMENT UPTIMISTIC UI AND REFETCH!

  render() {

    return (
      <Query query={TEXT_TYPES}>
        {({ loading, error, data }) => {
          if (loading) return <div>Fetching</div>
          if (error) return <div>{error.message}</div>

          // Build type tree from the root nodes.
          const typeTree = this.setAllTypes(data.TextType.filter(x => x.parent === null));

          return (
            <Query query={THIS_TEXT_TYPES} variables={{ id: this.props.textId }} >
              {({ loading, error, data }) => {
                if (loading) return <div>Fetching</div>
                if (error) return <div>{error.message}</div>

                const types = data.Text ? data.Text[0].types : undefined
                if (!types) {
                  console.log("Error getting the types field on the item ID ", data.Text.id)
                }
                const currentTypes = this.setCurrentTypes(types)

                return (
                  <TreeSelect
                    style={{ width: 300 }}
                    value={currentTypes}
                    dropdownStyle={{ maxHeight: 500, overflow: 'auto' }}
                    treeData={typeTree}
                    placeholder="Select types"
                    treeDefaultExpandAll
                    multiple
                    treeCheckable
                    treeCheckStrictly
                    onChange={(value, node, extra) => this.onChange(value, node, extra)}
                  />
                )
              }}
            </Query>
          )
        }
        }
      </Query >
    );
  }
}

export default TypeSelector