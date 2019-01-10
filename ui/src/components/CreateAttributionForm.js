import React, { Component } from "react";
import gql from "graphql-tag";
import { Form, Input, Modal, Radio, Select } from 'antd';
import { defaultName } from "./utils";

const AUTHORS = gql`
query allAuthors {
  Person {
    id
    names {
      id
      value
      language
    }
  }
}
`

const prefetchAuthors = async (client) => {
  const { error, data } = await client.query({
    query: AUTHORS
  });
  if (error) {
    console.warn("prefetchAuthors" + error.message)
  }
  return (
    data.Person.sort((a, b) => defaultName(a).localeCompare(defaultName(b)))
  )
}

export const AuthorCreateForm = Form.create()(
  class extends Component {
    state = {
      data: [],
    }

    componentDidMount() {
      prefetchAuthors(this.props.client)
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
          title="Create new attribution"
          okText="Save"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form>
            {getFieldDecorator('id')(<Input disabled style={{ display: 'none' }} />)}
            <Form.Item label="Author">
              {getFieldDecorator(
                'personid',
              )(
                <Select
                  showSearch
                  placeholder="Search for author"
                  optionFilterProp="values"
                  defaultActiveFirstOption={false}
                  showArrow={true}
                  filterOption={
                    (input, option) => {
                      return (option.props.values.toLowerCase().indexOf(input.toLowerCase()) >= 0)
                    }
                  }
                  onChange={this.handleChange}
                >

                  {this.state.data.map(d => {
                    const values = d.names.map(n => (n.value)).join(';')
                    return (
                      <Select.Option key={d.id} values={values}>
                        {d.names[0].value}
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