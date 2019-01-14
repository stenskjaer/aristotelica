import React, { Component } from "react";
import gql from "graphql-tag";
import { Form, Input, Modal, Radio, Select, Button, Table, Divider, message } from 'antd';
import { createGUID } from '../utils'
import DescriptionList from "../DescriptionList";
import { Link } from 'react-router-dom';

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
      person {
        id
      }
      text {
        id
        title
      }
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
                      return (option.props.values.toLowerCase().indexOf(input.toLowerCase()) >= 0)
                    }
                  }
                >

                  {this.state.data.map(d => {
                    const authorNames = d.authors.map(a => a.names[0].value).join(', ')
                    const filterValues = [d.title, authorNames].join(';')
                    return (
                      <Select.Option key={d.id} value={d.id} title={d.title} values={filterValues}>
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
    attributions: this.props.author.attributions
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
      let updating = false;

      if (values.id === undefined) {
        values.id = createGUID();
      } else {
        updating = true;
        this.deleteAttribution(values.id);
      }

      values.personid = this.props.author.id

      // Create/update logic
      const { error, data } = await this.props.client.mutate({
        mutation: CREATE_ATTRIBUTION,
        variables: values,
        refetchQueries: ['allTexts'],
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

      // Update the state
      const updateAttributions = [...this.state.attributions];
      if (updating) {
        const index = updateAttributions.findIndex(item => item.id === values.id);
        updateAttributions.splice(index, 1, {
          ...data.CreateTextAttribution,
          ...data.UpdateAttribution
        });
      } else {
        updateAttributions.push({
          ...data.CreateTextAttribution,
          ...data.UpdateAttribution
        });
      }

      this.setState({
        attributions: updateAttributions,
        visibleForm: false,
      });
      form.resetFields();
    })
  }

  deleteAttribution = async id => {
    const { error } = await this.props.client.mutate({
      mutation: DELETE_ATTRIBUTION,
      variables: { id: id },
      optimisticResponse: {
        "DeleteAttribution": {
          __typename: "Attribution",
          id: id
        }
      }
    });
    if (error) {
      console.warn(error.message)
    }
  }

  handleDelete = (id) => {
    this.deleteAttribution(id)

    const newData = [...this.state.attributions];
    const index = newData.findIndex(item => item.id === id);
    newData.splice(index, 1);
    this.setState({ attributions: newData })
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
        <Table
          columns={columns.filter(c => c.enabled)}
          dataSource={
            this.state.attributions.map(attribution => ({
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
        }

      </div>
    );
  }
}

export default AuthorTexts