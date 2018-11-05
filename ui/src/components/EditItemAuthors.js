import React, { Component } from "react";
import { Mutation, Query } from "react-apollo";
import gql from "graphql-tag";
import { Form, Input, Button, List, Modal, Radio } from 'antd';
import { Formik } from 'formik'
import { createGUID } from './utils'

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

const CREATE_TEXT_ATTRIBUTION = gql`
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
      note: $note,
      source: $source,
      certainty: $certainty
    ) {
      id
      person {id}
      text {title}
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

const AuthorCreateForm = Form.create()(
  class extends React.Component {
    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;

      return (
        <Modal
          visible={visible}
          title="Create new attribution"
          okText="Create"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Mutation mutation={CREATE_TEXT_ATTRIBUTION}>
            {(createAttribution) => (

              <Formik onSubmit={values => { createAttribution({ variables: values }) }}>
                {({ values, handleSubmit, handleChange, isSubmitting }) => (
                  <Form>
                    <Form.Item label="Source">
                      {getFieldDecorator('source')(<Input />)}
                    </Form.Item>
                    <Form.Item label="Note">
                      {getFieldDecorator('note')(<Input.TextArea rows={3} />)}
                    </Form.Item>
                    <Form.Item label="Certainty">
                      {getFieldDecorator('certainty', {
                        initialValue: 'POSSIBLE',
                      })(
                        <Radio.Group buttonStyle="solid">
                          <Radio.Button value="CERTAIN">Certain</Radio.Button>
                          <Radio.Button value="POSSIBLE">Possible</Radio.Button>
                          <Radio.Button value="DUBIOUS">Dubious</Radio.Button>
                          <Radio.Button value="FALSE">False</Radio.Button>
                        </Radio.Group>
                      )}
                    </Form.Item>
                  </Form>
                )}
              </Formik>
            )}
          </Mutation>
        </Modal>
      );
    }
  }
);

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

  // handleCreate = () => {
  //   const form = this.formRef.props.form;
  //   form.validateFields((err, values) => {
  //     if (err) {
  //       return;
  //     }

  //     console.log('Received values of form: ', values);
  //     form.resetFields();
  //     this.setState({ visibleForm: false });
  //   });
  // }

  handleCreate = async ({ variables }) => {
    const form = this.formRef.props.form;

    form.validateFields(async (err, values) => {
      if (err) {
        return;
      }

      values.id = createGUID()
      values.textid = this.props.textId
      values.personid = "2"
      values.note = values.note ? values.note : ''
      values.source = values.source ? values.source : ''
      console.log('Received values of form: ', values);

      const { data } = await this.props.client.mutate({
        mutation: CREATE_TEXT_ATTRIBUTION,
        variables: values,
        refetchQueries: ['attributionsQuery'],
        // optimisticResponse: {
        //   "RemoveTextTypes": {
        //     __typename: "Text",
        //     types: [
        //       {
        //         id: variables.texttypeid,
        //         __typename: 'TextType',
        //       }
        //     ]
        //   }
        // }
      });
      console.log(data)
      form.resetFields();
      this.setState({ visibleForm: false });
    })
  }

  handleDelete = async (nodeId) => {
    const { data, error } = await this.props.client.mutate({
      mutation: DELETE_ATTRIBUTION,
      variables: { id: nodeId },
      refetchQueries: ['attributionsQuery'],
      // optimisticResponse: {
      //   "RemoveTextTypes": {
      //     __typename: "Text",
      //     types: [
      //       {
      //         id: variables.texttypeid,
      //         __typename: 'TextType',
      //       }
      //     ]
      //   }
      // }
    });
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
                    actions={[<a onClick={this.showModal}>Edit</a>, <a onClick={() => this.handleDelete(item.id)}>Delete</a>]}
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
                <Button type="primary" onClick={this.showModal}>New Collection</Button>
                <AuthorCreateForm
                  wrappedComponentRef={this.saveFormRef}
                  visible={this.state.visibleForm}
                  onCancel={this.handleCancel}
                  onCreate={this.handleCreate}
                />
              </div>
            </div>
          )
        }}
      </Query >
    )
  }
}

export default EditItemAuthors