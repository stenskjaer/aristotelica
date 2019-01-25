import React, { Component } from "react";
import gql from "graphql-tag";
import { List, Button, Form, Modal, Input, message } from "antd";
import { createGUID } from '../utils';
import DatingList from "../DatingList";

const CREATE_PERSON_EVENT = gql`
  mutation createPersonEvent(
    $eventid: ID!
    $personid: ID!
    $type: String!
    $description: String
  ) {
    CreateEvent(
      id: $eventid
      type: $type
      description: $description
    ) {
      id
    }
    AddPersonEvents(
      personid: $personid
      eventid: $eventid
    ) {
      id
    }
  }
`

const UPDATE_PERSON_EVENT = gql`
  mutation updatePersonEvent(
    $eventid: ID!
    $type: String!
    $description: String
  ) {
    UpdateEvent(
      id: $eventid
      type: $type
      description: $description
    ) {
      id
    }
  }
`

const REMOVE_PERSON_EVENT = gql`
  mutation removePersonEvents(
    $personid: ID!
    $eventid: ID!
  ) {
    RemovePersonEvents(
      personid: $personid
      eventid: $eventid
    ) {
      id
    }
    DeleteEvent(
      id: $eventid
    ) {
      id
    }
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

const DELETE_RELATED_DATES = gql`
  mutation deleteDatingFromDating($datingid: ID!) {
    DeleteRelatedDates(datingid: $datingid) {
      id
    }
  }
`

export const CreateUpdateEvent = Form.create()(
  class extends Component {

    render() {
      const { visible, onCancel, onCreate, handleDelete, updating, form } = this.props;
      const { getFieldDecorator } = form

      return (
        <Modal
          visible={visible}
          onCancel={onCancel}
          title="Create new event"
          okText="Save"
          footer={[
            <Button key="back" onClick={onCancel}>Cancel</Button>,
            <Button key="submit" type="primary" onClick={onCreate}>
              Submit
            </Button>,
            (
              updating &&
              <Button key="remove" type="danger" onClick={() => handleDelete()}>
                Delete
            </Button>
            )

          ]}
        >
          <Form>
            {getFieldDecorator('id')(<Input disabled style={{ display: 'none' }} />)}
            <Form.Item label="Type">
              {getFieldDecorator('type')(<Input />)}
            </Form.Item>
            <Form.Item label="Description">
              {getFieldDecorator('description')(<Input.TextArea rows={3} />)}
            </Form.Item>
          </Form>

        </Modal>
      );
    }
  }
);


class AuthorEvents extends Component {
  state = {
    visibleForm: false
  }
  handleUpdate = this.props.handleUpdate
  addUpdater = this.props.addUpdater
  removeUpdater = this.props.removeUpdater
  isDrafted = this.props.isDrafted

  createEvent = async ({ id, type, description }) => {
    const { error, data } = await this.props.client.mutate({
      mutation: CREATE_PERSON_EVENT,
      variables: {
        eventid: id,
        personid: this.props.id,
        description,
        type
      },
    });
    if (error) {
      console.warn(error.message)
    }
    return data.CreateEvent.id
  }

  updateEvent = async ({ id, type, description }) => {
    const { error, data } = await this.props.client.mutate({
      mutation: UPDATE_PERSON_EVENT,
      variables: {
        eventid: id,
        description,
        type
      },
    });
    if (error) {
      console.warn(error.message)
    }
    return data.UpdateEvent.id
  }

  deleteEvent = async (variables) => {
    const { error, data } = await this.props.client.mutate({
      mutation: REMOVE_PERSON_EVENT,
      variables: variables,
    });
    if (error) {
      console.warn(error.message)
    }
    return data.RemovePersonEvents.id
  }

  deleteDating = async (datingid) => {
    const { error } = await this.props.client.mutate({
      mutation: DELETE_DATING,
      variables: { datingid: datingid },
      refetchQueries: this.props.refetchQueries,
    });
    if (error) {
      message.error(error.message)
    }
  }

  deleteDates = async (datingid) => {
    const { error } = await this.props.client.mutate({
      mutation: DELETE_RELATED_DATES,
      variables: { datingid }
    });
    if (error) {
      console.warn("Error in deleting Dates on Dating " + datingid)
      console.warn(error.message)
    }
  }

  delete = () => {
    const form = this.formRef.props.form;
    let values = form.getFieldsValue()
    const newData = [...this.props.data]

    const event = newData.find(x => x.id === values.id)
    // If event is saved in DB (not only drafted), register remove updaters
    let updaters = []
    if (!this.isDrafted(event.id)) {
      // Remove datings
      if (event.datings && event.datings.length > 0) {
        event.datings.forEach(dating => {
          // Remove dates
          updaters.push({
            id: dating.id,
            func: this.deleteDates,
            variables: { datingid: dating.id },
            strategy: 'accumulate'
          })
          // Remove dating
          updaters.push({
            id: dating.id,
            func: this.deleteDating,
            variables: { datingid: dating.id },
            strategy: 'accumulate'
          })
        })
      }
      // Remove event
      updaters.push({
        id: event.id,
        func: this.deleteEvent,
        variables: {
          eventid: event.id,
          personid: this.props.id
        },
        strategy: 'accumulate'
      })
    }

    // Remove the event from the state
    const eventIndex = newData.findIndex(x => x.id === values.id)
    newData.splice(eventIndex, 1)
    this.handleUpdate({
      id: event.id,
      relation: 'events',
      data: newData,
      operation: 'remove',
      updaters,
    })

    this.toggleModal()
    this.setState({ updating: false })
    this.formRef.props.form.resetFields();
  }

  handleCancel = () => {
    this.toggleModal();
    this.setState({ updating: false })
    this.formRef.props.form.resetFields();
  }

  save = () => {
    const form = this.formRef.props.form;
    let values = form.getFieldsValue()
    const newData = [...this.props.data]
    const newItem = {
      ...values,
      id: values.id || createGUID(),
    }
    const itemIndex = newData.findIndex(x => x.id === newItem.id)
    if (itemIndex > -1) {
      newData.splice(itemIndex, 1, {
        ...newData[itemIndex],
        ...values
      })
    } else {
      newData.push(newItem)
    }

    // Save the mutation functions
    let updaters = []
    if (this.isDrafted(newItem.id)) {
      updaters.push({
        id: newItem.id,
        func: this.createEvent,
        variables: newItem
      })
    } else {
      updaters.push({
        id: newItem.id,
        func: this.updateEvent,
        variables: newItem
      })
    }

    this.handleUpdate({
      id: newItem.id,
      relation: 'events',
      data: newData,
      operation: 'update',
      updaters: updaters
    })

    this.toggleModal()
    this.setState({ updating: false })
    this.formRef.props.form.resetFields();
  }

  handleDatingUpdate = (event) => {
    // Push the dating updates from the child to the parent state
    const newData = [...this.props.data]
    const eventIndex = newData.findIndex(x => x.id === event.id)
    if (eventIndex > -1) {
      newData.splice(eventIndex, 1, event)
    } else {
      newData.push(event)
    }
    this.handleUpdate({
      relation: 'events',
      data: newData
    })
  }

  saveFormRef = (formRef) => {
    this.formRef = formRef;
  }

  updateModal = (event) => {
    const form = this.formRef.props.form;
    form.setFieldsValue({
      id: event.id,
      type: event.type,
      description: event.description
    })
    this.setState({ updating: true })
    this.toggleModal()
  }

  toggleModal = () => {
    this.setState(prev => ({
      visibleForm: !prev.visibleForm,
    }));
  }

  render() {
    const { data, client, editable } = this.props
    const eventsList = data.map(event => {
      const title =
        <span>
          {event.type}
          {
            editable
              ? <Button onClick={() => this.updateModal(event)} shape="circle" size="small" icon="edit" style={{ marginLeft: '1ex' }} />
              : ''
          }
        </span>
      return ({
        title: title,
        description: event.description,
        content: <DatingList
          datings={event.datings}
          event={event}
          client={this.props.client}
          editable={this.props.editable}
          handleDatingUpdate={this.handleDatingUpdate}
          addUpdater={this.addUpdater}
          removeUpdater={this.removeUpdater}
          isDrafted={this.isDrafted}
          refetchQueries={['authorInfo']}
        />
      })
    })

    return (
      <React.Fragment>
        <h2>
          {this.props.heading}
          {
            editable
              ? <Button onClick={this.toggleModal} shape="circle" size="small" icon="plus" style={{ marginLeft: '1ex' }} />
              : ''
          }
        </h2>
        <List
          bordered={true}
          itemLayout="vertical"
          dataSource={eventsList}
          renderItem={item => (
            <List.Item key={item.id}>
              <List.Item.Meta
                title={item.title}
                description={item.description}
              />
              {item.content}
            </List.Item>
          )}
        />
        <CreateUpdateEvent
          client={client}
          wrappedComponentRef={this.saveFormRef}
          visible={this.state.visibleForm}
          updating={this.state.updating}
          handleUpdate={this.props.handleUpdate}
          handleDelete={this.delete}
          onCancel={this.handleCancel}
          onCreate={this.save}
        />
      </React.Fragment>
    );

  }
}

export default AuthorEvents