import React, { Component } from "react";
import { Button, List, Table, Divider } from 'antd';
import { createGUID } from '../utils'
import { AuthorTextForm } from './AuthorTextForm'
import { normCertainty } from '../utils'
import DescriptionList from "../DescriptionList";


class AuthorTexts extends Component {
  state = {
    visibleForm: false,
    visibleDetails: [],
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

      form.resetFields();
      this.setState({ visibleForm: false });
    })
  }

  handleDelete = async (nodeId) => {

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

  displayDetails = (id, e) => {
    const contentList = this.state.visibleDetails
    const idx = contentList.indexOf(id)
    if (idx === -1) {
      contentList.push(id)
    } else {
      contentList.splice(idx)
    }
    this.setState(contentList)
  }

  attributionName = (attribution) => {
    const certainty = attribution.certainty ? ' (' + normCertainty(attribution.certainty) + ')' : ''
    return (attribution.person.name + certainty)
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
                    <React.Fragment>
                      <a onClick={() => this.updateModal({
                        id: record.id,
                        textid: record.textid,
                        certainty: record.certainty,
                        source: record.source,
                        note: record.note,
                      })}>Edit</a>
                      <Divider type="vertical" />
                      <a onClick={() => this.handleDelete(record.id)}>Remove</a>
                    </React.Fragment>
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