import React, { Component } from "react";
import { List, Button, Form, Modal, Input } from "antd";
import { createGUID } from '../../utils/functions';
import DatingList from "../DatingList";
import {
  DELETE_DATING,
  DELETE_DATE,
  CREATE_PERSON_EVENT,
  UPDATE_PERSON_EVENT,
  REMOVE_PERSON_EVENT,
  REMOVE_DATING_DATE,
  REMOVE_DATING_EVENT
} from '../GQL/Mutations';


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
  isDrafted = this.props.isDrafted

  createEvent = async ({ id, type, description }) => {
    await this.props.client.mutate({
      mutation: CREATE_PERSON_EVENT,
      variables: {
        eventid: id,
        personid: this.props.id,
        description,
        type
      },
    })
  }

  updateEvent = async ({ id, type, description }) => {
    await this.props.client.mutate({
      mutation: UPDATE_PERSON_EVENT,
      variables: {
        eventid: id,
        description,
        type
      },
    });
  }

  deleteEvent = async (variables) => {
    await this.props.client.mutate({
      mutation: REMOVE_PERSON_EVENT,
      variables: variables,
    });
  }

  deleteDating = async (datingid) => {
    await this.props.client.mutate({
      mutation: DELETE_DATING,
      variables: { datingid },
    })
  }

  deleteDatingDate = async (variables) => {
    await this.props.client.mutate({
      mutation: REMOVE_DATING_DATE,
      variables: variables,
    })
  }

  deleteDatingEvent = async (variables) => {
    await this.props.client.mutate({
      mutation: REMOVE_DATING_EVENT,
      variables: variables,
    })
  }

  deleteDate = async ({ dateid }) => {
    await this.props.client.mutate({
      mutation: DELETE_DATE,
      variables: { dateid }
    })
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
          updaters.push(...dating.dates.map(date => ({
            id: date.id,
            func: this.deleteDatingDate,
            variables: {
              datingid: dating.id,
              dateid: date.id
            },
            strategy: 'accumulate'
          })))
          // Remove dating
          updaters.push({
            id: dating.id,
            func: this.deleteDatingEvent,
            variables: {
              datingid: dating.id,
              eventid: event.id
            },
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
    let operation = ''
    const newData = [...this.props.data]
    const newItem = {
      ...values,
      id: values.id || createGUID(),
    }
    const itemIndex = newData.findIndex(x => x.id === newItem.id)
    if (itemIndex > -1) {
      operation = 'update'
      newData.splice(itemIndex, 1, {
        ...newData[itemIndex],
        ...values
      })
    } else {
      operation = 'add'
      newData.push(newItem)
    }

    // Save the mutation functions
    let updaters = []
    if (operation === 'add') {
      updaters.push({
        id: newItem.id,
        func: this.createEvent,
        variables: newItem,
        strategy: 'accumulate'
      })
    } else {
      updaters.push({
        id: newItem.id,
        func: this.updateEvent,
        variables: newItem,
        strategy: 'accumulate'
      })
    }

    this.handleUpdate({
      id: newItem.id,
      relation: 'events',
      data: newData,
      operation,
      updaters
    })

    this.toggleModal()
    this.setState({ updating: false })
    this.formRef.props.form.resetFields();
  }

  handleDatingUpdate = ({ event, updaters, operation, id }) => {
    // Push the dating updates from the child to the parent state
    const newData = [...this.props.data]
    const eventIndex = newData.findIndex(x => x.id === event.id)
    if (eventIndex > -1) {
      newData.splice(eventIndex, 1, event)
    } else {
      newData.push(event)
    }
    this.handleUpdate({
      id,
      relation: 'events',
      data: newData,
      updaters,
      operation,
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
            editable &&
            <Button onClick={() => this.updateModal(event)} shape="circle" size="small" icon="edit" style={{ marginLeft: '1ex' }} />
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