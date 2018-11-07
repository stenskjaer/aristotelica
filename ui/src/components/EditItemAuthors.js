import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Button, List, message } from 'antd';
import { createGUID } from './utils'
import { AuthorCreateForm } from './CreateAttributionForm'

const ATTRIBUTIONS_QUERY = gql`
query attributionsQuery($id: ID!) {
  Text(id: $id) {
    id
    attributions {
      id
      person {
        name
        id
      }
      note
      source
      certainty
    }
  }
}
`

const CREATE_ATTRIBUTION = gql`
mutation CreateTextAttribution(
  $id: ID!,
  $textid: ID!,
  $personid: ID!,
  $note: String,
  $source: String,
  $certainty: AttributionCertainty
) {
  CreateTextAttribution(
    id: $id,
    textid: $textid,
    personid: $personid,
  ) {
    __typename
    id
    person {id}
    text {id}
  }
  UpdateAttribution(
    id: $id
    note: $note,
    source: $source,
    certainty: $certainty
  ) {
    __typename
    id
    note
    source
    certainty
  }
}
`

const DELETE_ATTRIBUTION = gql`
mutation deleteAttribution(
  $id: ID!
) {
  DeleteAttribution(
    id: $id
  ) {
    id
  }
}
`

class EditItemAuthors extends Component {
  state = {
    visibleForm: false,
  };

  showModal = () => {
    this.setState({ visibleForm: true });
  }

  handleCancel = () => {
    this.setState({ visibleForm: false });
  }

  handleCreate = async () => {
    const form = this.formRef.props.form;

    form.validateFields(async (err, values) => {
      if (err) {
        return;
      }

      values.id = createGUID()
      values.textid = this.props.textId

      const { error, data } = await this.props.client.mutate({
        mutation: CREATE_ATTRIBUTION,
        variables: values,
        refetchQueries: ['attributionsQuery'],
        optimisticResponse: {
          "CreateTextAttribution": {
            __typename: "Attribution",
            id: values.id,
            person: {
              __typename: "Person",
              id: values.personid
            },
            text: {
              __typename: "Text",
              id: values.textid
            }
          },
          "UpdateAttribution": {
            __typename: "Attribution",
            certainty: values.certainty,
            id: values.id,
            note: values.note ? values.note : null,
            source: values.source ? values.source : null,
          }
        }
      });
      if (error) {
        message.error(error.message)
      }
      if (data.CreateTextAttribution === null) {
        message.error("Text attribution was not created.")
      }
      if (data.UpdateAttribution === null) {
        message.error("Properties were not given to the attribution.")
      }
      form.resetFields();
      this.setState({ visibleForm: false });
    })
  }

  handleDelete = async (nodeId) => {
    const { error } = await this.props.client.mutate({
      mutation: DELETE_ATTRIBUTION,
      variables: { id: nodeId },
      refetchQueries: ['attributionsQuery'],
      optimisticResponse: {
        "DeleteAttribution": {
          __typename: "Attribution",
          id: nodeId
        }
      }
    });
    if (error) {
      message.error(error.message)
    }
  }

  saveFormRef = (formRef) => {
    this.formRef = formRef;
  }

  render() {

    return (
      <Query query={ATTRIBUTIONS_QUERY} variables={{ id: this.props.textId }}>
        {({ loading, error, data, client }) => {

          if (loading) return <div>Fetching</div>
          if (error) return <div>{error.message}</div>

          return (
            <div>
              <List
                itemLayout="vertical"
                dataSource={data.Text[0].attributions}
                renderItem={item => (
                  <List.Item
                    key={item.id}
                    actions={[
                      <a onClick={this.showModal}>Edit</a>,
                      <a onClick={() => this.handleDelete(item.id)}>Delete</a>
                    ]}
                  >
                    <List.Item.Meta
                      title={item.person.name}
                      description={item.certainty}
                    />
                    {item.note ? <p>Note: {item.note}</p> : null}
                    {item.source ? <p>Source: {item.source}</p> : null}
                  </List.Item>
                )}
              />
              <div>
                <Button type="primary" onClick={this.showModal}>New attribution</Button>
                <AuthorCreateForm
                  client={client}
                  wrappedComponentRef={this.saveFormRef}
                  visible={this.state.visibleForm}
                  onCancel={this.handleCancel}
                  onCreate={this.handleCreate}
                />
              </div>
            </div>
          );
        }}
      </Query>
    );
  }
}

export default EditItemAuthors