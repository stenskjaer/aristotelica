import React, { Component } from "react";
import gql from "graphql-tag";
import { Form, Input, Modal, Radio, Select, Button, Table, Divider, message } from 'antd';
import { createGUID } from '../utils'
import DescriptionList from "../DescriptionList";
import { Link } from 'react-router-dom';
import { TEXTS } from "../GQL/Queries";
import { CREATE_ATTRIBUTION, DELETE_ATTRIBUTION } from "../GQL/Mutations";

const mutations = {
  createAttribution: async ({ variables, client }) => {
    await client.mutate({
      mutation: CREATE_ATTRIBUTION,
      variables: variables,
      refetchQueries: ['allTexts'],
    });
  },
  deleteAttribution: async ({ id, client }) => {
    await client.mutate({
      mutation: DELETE_ATTRIBUTION,
      variables: { id },
      optimisticResponse: {
        "DeleteAttribution": {
          __typename: "Attribution",
          id: id
        }
      }
    });
  },
  updateAttribution: async ({ variables, client }) => {
    mutations.deleteAttribution({ id: variables.id, client })
    mutations.createAttribution({ variables, client })
  },
}

const prefetchTexts = async (client) => {
  const { error, data } = await client.query({
    query: TEXTS
  });
  if (error) {
    console.warn("prefetchTexts" + error.message)
  }
  return (
    data.Text
  )
}

const AuthorTextForm = Form.create()(
  class extends Component {
    state = {
      texts: this.props.allTexts.map(d => {
        const authorNames = d.authors.map(a => a.names[0].value).join(', ')
        return ({
          id: d.id,
          title: d.title,
          authorNames: authorNames,
          filterValues: [d.title, authorNames].join(';')
        })
      })

    }

    handleChange = (value) => {
      this.setState({ value });
    }

    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;

      return (
        <Modal
          visible={visible}
          title={"Attribution to " + this.props.author.names[0].value}
          okText="Save"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form>
            {getFieldDecorator('id')(<Input disabled style={{ display: 'none' }} />)}
            <Form.Item label="Text">
              {getFieldDecorator(
                'textid',
              )(
                <Select
                  showSearch
                  placeholder="Search for text"
                  defaultActiveFirstOption={false}
                  showArrow={true}
                  filterOption={
                    (input, option) => {
                      return (option.props.values.toLowerCase().indexOf(input.toLowerCase()) >= 0)
                    }
                  }
                >

                  {this.state.texts.map(d => (
                    <Select.Option key={d.id} value={d.id} title={d.title} values={d.filterValues}>
                      {d.title} ({d.authorNames})
                    </Select.Option>
                  )
                  )}
                </Select>
              )}
            </Form.Item>
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

        </Modal>
      );
    }
  }
);

class AuthorTexts extends Component {
  state = {
    visibleForm: false,
    allTexts: [],
  };
  handleUpdate = this.props.handleUpdate

  componentDidMount() {
    prefetchTexts(this.props.client)
      .then(e => {
        this.setState({ allTexts: e })
      })
  }

  handleCancel = () => {
    this.setState({ visibleForm: false });
    this.formRef.props.form.resetFields();
  }

  save = async () => {
    const form = this.formRef.props.form;

    form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      let operation = ''
      values.personid = this.props.id
      values.text = this.state.allTexts.find(x => x.id === values.textid)

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
      if (operation === 'update') {
        updaters.push({
          id: newItem.id,
          func: mutations.updateAttribution,
          variables: {
            variables: newItem,
            client: this.props.client
          },
        })
      } else {
        updaters.push({
          id: newItem.id,
          func: mutations.createAttribution,
          variables: {
            variables: newItem,
            client: this.props.client
          },
        })
      }

      this.handleUpdate({
        id: newItem.id,
        relation: 'attributions',
        data: newData,
        operation,
        updaters
      })

      this.setState({ visibleForm: false });
      form.resetFields();
    })
  }

  handleDelete = (id) => {
    const newData = [...this.props.data];
    const index = newData.findIndex(item => item.id === id);
    newData.splice(index, 1);

    this.handleUpdate({
      id,
      relation: 'attributions',
      data: newData,
      operation: 'remove',
      updaters: [{
        id,
        func: mutations.deleteAttribution,
        variables: {
          id,
          client: this.props.client
        },
      }]
    })
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
    form.setFieldsValue({
      id: values.id,
      textid: values.textid,
      source: values.source,
      note: values.note,
      certainty: values.certainty
    })
    this.showModal()
  }

  showPagination = (records) => records.length > 10

  render() {
    const { author, editable } = this.props

    const columns = [
      {
        title: 'Title',
        dataIndex: 'title',
        enabled: true,
        render: (text, record) => <Link to={`/text/${record.textid}`}>{text}</Link>
      },
      {
        title: 'Operation',
        dataIndex: 'operation',
        enabled: editable,
        render: (text, record) => {
          return (
            <div>
              <a onClick={() => this.updateModal({
                id: record.attributionId,
                textid: record.textid,
                certainty: record.certainty,
                source: record.source,
                note: record.note,
              })}>Edit</a>
              <Divider type="vertical" />
              <a onClick={() => this.handleDelete(record.attributionId)}>Remove</a>
            </div>
          );
        },
      },
    ]

    return (
      <div>
        <h2>{this.props.heading}
          {
            editable &&
            <Button onClick={this.showModal} shape="circle" size="small" icon="plus" style={{ marginLeft: '1ex' }} />
          }
        </h2>
        {editable &&
          <p>
            Editing or deleting an attribution will not change the text, only the connection between the author and the text. To edit the text, click the text title and edit it from the detailed view.
          </p>
        }
        <Table
          columns={columns.filter(c => c.enabled)}
          dataSource={
            this.props.data.map(attribution => ({
              key: attribution.id,
              attributionId: attribution.id,
              title: attribution.text.title,
              textid: attribution.text.id,
              note: attribution.note,
              source: attribution.source,
              certainty: attribution.certainty,
            })).sort((a, b) => a.title.localeCompare(b.title))
          }
          size={'small'}
          expandRowByClick
          expandedRowRender={record => (
            <DescriptionList
              items={[
                {
                  title: 'Certainty',
                  dataIndex: 'certainty',
                  description: record.certainty,
                  key: record.id + '_certainty'
                },
                {
                  title: 'Note',
                  dataIndex: 'note',
                  description: record.note || undefined,
                  key: record.id + '_note'
                },
                {
                  title: 'Source',
                  dataIndex: 'source',
                  description: record.source || undefined,
                  key: record.id + '_source'
                }
              ]}
            />
          )}
          bordered
          pagination={this.showPagination(this.props.author.names)}
        />
        {editable &&
          <AuthorTextForm
            client={this.props.client}
            wrappedComponentRef={this.saveFormRef}
            visible={this.state.visibleForm}
            allTexts={this.state.allTexts}
            onCancel={this.handleCancel}
            onCreate={this.save}
            author={author}
          />
        }

      </div>
    );
  }
}

export default AuthorTexts