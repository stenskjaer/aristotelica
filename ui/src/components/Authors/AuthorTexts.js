import React, { Component } from "react";
import gql from "graphql-tag";
import { Form, Input, Modal, Radio, Select, Button, Table, Divider } from 'antd';
import { createGUID } from '../utils'
import DescriptionList from "../DescriptionList";

const TEXTS = gql`
query allTexts {
  Text(orderBy: title_asc) {
    id
    title
    authors {
      names {
        value
      }
    }
  }
}
`

const prefetchTexts = async (client) => {
  const { error, data } = await client.query({
    query: TEXTS
  });
  if (error) {
    console.log("prefetchTexts" + error.message)
  }
  return (
    data.Text
  )
}

const AuthorTextForm = Form.create()(
  class extends Component {
    state = {
      data: [],
    }

    componentDidMount() {
      prefetchTexts(this.props.client)
        .then(e => {
          this.setState({ data: e })
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
                  optionFilterProp="title"
                  defaultActiveFirstOption={false}
                  showArrow={true}
                  filterOption={
                    (input, option) => {
                      return (option.props.filterValues.toLowerCase().indexOf(input.toLowerCase()) >= 0)
                    }
                  }
                  onChange={this.handleChange}
                >

                  {this.state.data.map(d => {
                    const authorNames = d.authors.map(a => a.names[0].value).join(', ')
                    const filterValues = [d.title, authorNames].join(';')
                    return (
                      <Select.Option key={d.id} title={d.title} filterValues={filterValues}>
                        {d.title} ({authorNames})
                      </Select.Option>
                    )
                  })}
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
  };

  handleCancel = () => {
    this.setState({ visibleForm: false });
    this.formRef.props.form.resetFields();
  }

  handleCreateUpdate = async () => {
    const form = this.formRef.props.form;

    form.validateFields(async (err, values) => {
      if (err) {
        return;
      }

      if (values.id === undefined) {
        values.id = createGUID()
      }
      values.textid = this.props.textId

      // Insert create/update logic here!

      form.resetFields();
      this.setState({ visibleForm: false });
    })
  }

  handleDelete = async (nodeId) => {
    // Insert delete logic
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
    const author = this.props.author

    return (
      <div>
        <Table
          columns={[
            { title: 'Title', dataIndex: 'title' },
            {
              title: 'Operation',
              dataIndex: 'operation',
              render: (text, record) => {
                return (
                  <div>
                    <a onClick={() => this.updateModal({
                      id: record.id,
                      textid: record.textid,
                      certainty: record.certainty,
                      source: record.source,
                      note: record.note,
                    })}>Edit</a>
                    <Divider type="vertical" />
                    <a onClick={() => this.handleDelete(record.id)}>Remove</a>
                  </div>
                );
              },
            },
          ]}
          dataSource={author.attributions.map(attribution => ({
            key: attribution.id,
            title: attribution.text.title,
            textid: attribution.text.id,
            note: attribution.note,
            source: attribution.source,
            certainty: attribution.certainty,
          }))}
          size={'small'}
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
        <div style={{ margin: '10px 0 0 0' }}>
          <AuthorTextForm
            client={this.props.client}
            wrappedComponentRef={this.saveFormRef}
            visible={this.state.visibleForm}
            onCancel={this.handleCancel}
            onCreate={this.handleCreateUpdate}
            author={author}
          />
          <Button type="primary" onClick={this.showModal}>New attribution</Button>
        </div>
      </div>
    );
  }
}

export default AuthorTexts