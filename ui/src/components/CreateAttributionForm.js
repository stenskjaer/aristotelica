import React, { Component } from "react";
import gql from "graphql-tag";
import { Form, Input, Modal, Radio, Select } from 'antd';
import { Query } from "react-apollo";


const SEARCH_NAME = gql`
query SearchName($substring: String!) {
  personNameSubstring(substring: $substring) {
    name
    id
  }
}
`

const AUTHORS_BY_ATTRIBUTIONS = gql`
query byAttributions {
  personByAttributions {
    id
    name
  }
}
`

const searchName = async (substring, client) => {
  const { error, data } = await client.query({
    query: SEARCH_NAME,
    variables: { substring: substring }
  });
  if (error) {
    console.log("searchName: " + error.message)
  }
  return (
    data.personNameSubstring
  )
}

const prefetchByAttributions = async (client) => {
  const { error, data } = await client.query({
    query: AUTHORS_BY_ATTRIBUTIONS
  });
  if (error) {
    console.log("prefetchByAttributions" + error.message)
  }
  console.log(data)
  const l = data.personByAttributions
  console.log(l)
  return (
    l.map(p => <Select.Option key={p.id}>{p.name}</Select.Option>)
  )
}

let timeout;

export const AuthorCreateForm = Form.create()(
  class extends Component {
    state = {
      data: [],
    }


    fetch = (value, callback, client) => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }

      function run() {
        const result = searchName(value, client);
        result.then((d) => {
          const data = [];
          d.forEach((r) => {
            data.push({
              value: r.id,
              text: r.name,
            });
          });
          callback(data);
        })
      }
      timeout = setTimeout(run, 300);
    }


    handleSearch = (value) => {
      this.fetch(value, data => this.setState({ data }), this.props.client);
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
          title="Create new attribution"
          okText="Create"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form>
            <Form.Item label="Author">
              {getFieldDecorator('personid')(
                <Select
                  showSearch
                  placeholder="Search for author"
                  defaultActiveFirstOption={false}
                  showArrow={true}
                  filterOption={false}
                  onSearch={this.handleSearch}
                  onChange={this.handleChange}
                  notFoundContent={null}
                >

                  {this.state.data.map(d => <Select.Option key={d.value}>{d.text}</Select.Option>)}
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