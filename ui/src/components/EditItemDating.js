import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { createGUID } from './utils'
import { List, Button, message } from 'antd';
import { CreateUpdateDating } from './CreateUpdateDating';

const DATING_QUERY = gql`
  query textDating($id: ID!) {
    Text(id: $id) {
      id
      datings {
        id
        dates {
          id
          type
          year {
            id
            value
          }
        }
      }
    }
  }
`

const CREATE_DATING = gql`
  mutation createDating(
    $textid: ID!
    $datingid: ID!
    $dateid: ID!
    $datetype: DateType!
    $yearid: ID!
  ) {
    CreateDating(
      id:$datingid
    ) {id}
    CreateDate(
      id:$dateid
      type:$datetype
    ) {id}
    AddDatingText(
      datingid:$datingid
      textid:$textid
    ) {id}
    AddDatingDates(
      datingid:$datingid
      dateid:$dateid
    ) {id}
    AddDateYear(
      dateid:$dateid
      yearid:$yearid
    ) {id}
  }
`

const DELETE_DATING = gql`
  mutation deleteDating(
    $datingid: ID!
  ) {
    DeleteDating(
      id:$datingid
    ) {id}
  }
`

const DELETE_DATE = gql`
 mutation deleteDate(
   $dateid: ID!
 ) {
  DeleteDate(
    id:$dateid
  ) {id}
 }
`



const GET_YEAR = gql`
  query getYear($value: Int!) {
    Year(value: $value) {
      id
    }
  }
`

class EditItemDating extends Component {
  state = {
    visibleForm: false,
  };

  handleCancel = () => {
    this.setState({ visibleForm: false });
    this.formRef.props.form.resetFields();
  }

  handleCreateUpdate = async () => {
    const form = this.formRef.props.form;
    const values = form.getFieldsValue()

    console.log(values)

    if (values.datingid === undefined) {
      values.datingid = createGUID()
    }
    values.textid = this.props.textId
    values.dateid = createGUID()

    const year = await this.props.client.query({
      query: GET_YEAR,
      variables: { value: values.year }
    })
    values.yearid = year.data.Year[0].id

    const { error, data } = await this.props.client.mutate({
      //mutation: CREATE_DATING,
      variables: values,
      refetchQueries: ['textDating'],
      // optimisticResponse: {}
    });
    console.log("After mutation: ", data)
    if (error) {
      message.error(error.message)
    }
    form.resetFields();
    this.setState()
    this.setState({ visibleForm: false });

  }

  handleDelete = async (datingsObj) => {
    console.log(datingsObj)
    const datingId = datingsObj.id
    const dates = datingsObj.dates
    dates.map(async d => {
      const { error } = await this.props.client.mutate({
        mutation: DELETE_DATE,
        variables: { dateid: d.id }
      });
      if (error) {
        console.log("Error in deleting Date: " + d.id)
        console.log(error.message)
      }
    })
    const { error } = await this.props.client.mutate({
      mutation: DELETE_DATING,
      variables: { datingid: datingId },
      refetchQueries: ['textDating'],
      // optimisticResponse: {}
    });
    if (error) {
      message.error(error.message)
    }
  }

  normDateType = (type) => {
    const normalization = {
      START: 'Start',
      END: 'End',
      SINGLE: 'Single',
    }
    return normalization[type]
  }

  saveFormRef = (formRef) => {
    this.formRef = formRef;
  }

  showModal = () => {
    this.setState({
      visibleForm: true,
    });
  }

  updateModal = (values) => {
    const form = this.formRef.props.form;
    form.setFieldsValue({})
    this.showModal()
  }

  render() {
    return (
      <Query query={DATING_QUERY} variables={{ id: this.props.textId }}>
        {({ loading, error, data, client }) => {

          if (loading) return <div>Fetching...</div>
          if (error) return <div>{error.message}</div>

          return (
            <div>
              <List
                itemLayout="vertical"
                dataSource={data.Text[0].datings}
                renderItem={item => (
                  <List.Item
                    key={item.id}
                    actions={[
                      <a onClick={() => { }}>Edit</a>,
                      <a onClick={() => this.handleDelete(item)}>Delete</a>
                    ]}
                  >
                    <List.Item.Meta
                      title={item.dates[0].year.value}
                    />
                    {item.dates[0].type}
                  </List.Item>
                )}
              />
              <div style={{ margin: '10px 0 0 0' }}>
                <CreateUpdateDating
                  client={this.props.client}
                  wrappedComponentRef={this.saveFormRef}
                  visible={this.state.visibleForm}
                  onCancel={this.handleCancel}
                  onCreate={this.handleCreateUpdate}
                />
                <Button type="primary" onClick={this.showModal}>New dating</Button>
              </div>
            </div>
          );
        }}
      </Query>
    )
  }
}

export default EditItemDating