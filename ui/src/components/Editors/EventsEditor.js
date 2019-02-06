import React, { Component } from "react";
import { List, Button, Form, Modal, Input } from "antd";
import { createGUID } from '../utils';
import DatingList from "../DatingList";
import {
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

const mutations = {
  deleteDatingDate: async (variables) => {
    await this.props.client.mutate({
      mutation: REMOVE_DATING_DATE,
      variables: variables,
    })
  },
  deleteDatingEvent: async (variables) => {
    await this.props.client.mutate({
      mutation: REMOVE_DATING_EVENT,
      variables: variables,
    })
  },
}

class EventsEditor extends Component {
  state = {
    visibleForm: false
  }
  handleUpdate = this.props.handleUpdate
  isDrafted = this.props.isDrafted
  createEvent = this.props.createItemEvent
  updateEvent = this.props.updateItemEvent
  deleteEvent = this.props.deleteItemEvent

  save = () => {
    const form = this.formRef.props.form;
    let values = form.getFieldsValue()
    let operation = ''
    const newData = [...this.props.data.events]
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

    this.handleUpdate({
      id: newItem.id,
      relation: 'events',
      data: newData,
      operation,
      updaters: [{
        id: newItem.id,
        func: operation === 'add' ? this.createEvent : this.updateEvent,
        variables: {
          variables: {
            itemid: this.props.data.id,
            eventid: newItem.id,
            ...newItem
          },
          client: this.props.client
        },
      }]
    })

    this.toggleModal()
    this.setState({ updating: false })
    this.formRef.props.form.resetFields();
  }

  delete = () => {
    const form = this.formRef.props.form;
    let values = form.getFieldsValue()
    const newData = [...this.props.data.events]

    const event = newData.find(x => x.id === values.id)
    let updaters = []
    // If event is saved in DB (not only drafted), register remove updaters
    if (!this.isDrafted(event.id)) {
      // Remove datings
      if (event.datings && event.datings.length > 0) {
        event.datings.forEach(dating => {
          // Remove dates
          updaters.push(...dating.dates.map(date => ({
            id: date.id,
            func: mutations.deleteDatingDate,
            variables: {
              datingid: dating.id,
              dateid: date.id
            },
            strategy: 'accumulate'
          })))
          // Remove dating
          updaters.push({
            id: dating.id,
            func: mutations.deleteDatingEvent,
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

  handleDatingUpdate = ({ event, updaters, operation, id }) => {
    // Push the dating updates from the child to the parent state
    const newData = [...this.props.data.events]
    const eventIndex = newData.findIndex(x => x.id === event.id)
    newData.splice(eventIndex, 1, event)

    this.handleUpdate({
      id,
      relation: 'events',
      data: newData,
      updaters,
      operation,
    })
  }

  handleCancel = () => {
    this.toggleModal();
    this.setState({ updating: false })
    this.formRef.props.form.resetFields();
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
    const { client, editable } = this.props
    const eventsList = this.props.data.events.map(event => {
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

export default EventsEditor