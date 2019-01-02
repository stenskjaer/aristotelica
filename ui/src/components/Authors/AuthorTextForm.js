import React, { Component } from "react";
import gql from "graphql-tag";
import { Form, Input, Modal, Radio, Select, Popover } from 'antd';

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

export const AuthorTextForm = Form.create()(
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