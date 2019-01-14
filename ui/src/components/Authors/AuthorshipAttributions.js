import React, { Component } from 'react'
import gql from "graphql-tag";
import { Table, Input, InputNumber, Divider, Form, Button, Select } from 'antd';
import { createGUID } from '../utils';
import { Languages } from '../languages';
import Defaults from '../defaults';

const FormItem = Form.Item;
const EditableContext = React.createContext();

const ADD_NAME = gql`
  mutation createName(
    $nameid: ID!
    $personid: ID!
    $name: String!
    $language: String!
  ) {
    CreateName(
      id: $nameid
      value: $name
      language: $language
    ) {
      id
    }
    AddPersonNames(
      personid: $personid
      nameid: $nameid
    ) {
      id
    }
  }
`

const addPersonName = async (values, client) => {
  const { error, data } = await client.mutate({
    mutation: ADD_NAME,
    variables: {
      nameid: values.key,
      personid: values.personid,
      language: values.language,
      name: values.name
    },
    refetchQueries: ['allPersons']
  });
  if (error) {
    console.warn(error.message)
  }
  return data.CreateName.id
}

const UPDATE_NAME = gql`
  mutation updateName(
    $nameid: ID!
    $language: String
    $name: String
  ) {
    UpdateName(
      id: $nameid
      language: $language
      value: $name
    ) {
      id
    }
  }
`

const updateName = async (values, client) => {
  const { error, data } = await client.mutate({
    mutation: UPDATE_NAME,
    variables: {
      nameid: values.key,
      language: values.language,
      name: values.name
    },
    refetchQueries: ['allPersons']
  });
  if (error) {
    console.warn(error.message)
  }
  return data.UpdateName.id
}

const DELETE_NAME = gql`
  mutation deleteName(
    $nameid: ID!
  ) {
    DeleteName(
      id: $nameid
    ) {
      id
    }
  }
`

const deleteName = async (nameid, client) => {
  const { error, data } = await client.mutate({
    mutation: DELETE_NAME,
    variables: {
      nameid: nameid,
    },
    refetchQueries: ['allPersons']
  });
  if (error) {
    console.warn(error.message)
  }
  return data.DeleteName.id
}

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
  getInput = () => {
    if (this.props.inputType === 'number') {
      return <InputNumber />;
    } else if (this.props.inputType === 'select') {
      const children = this.props.selectData.selectChildren
      return <Select {...this.props.selectData.selectProps}>{Object.keys(children).map(i => {
        const values = [children[i].isoName, children[i].nativeName, children[i].langCode].join(';')
        return (
          <Select.Option values={values} key={children[i].langCode} value={children[i].langCode}>
            {children[i].isoName} ({children[i].nativeName})
          </Select.Option>
        )
      }
      )}</Select>
    }
    return <Input />;
  };

  render() {
    const {
      editing,
      dataIndex,
      title,
      inputType,
      record,
      index,
      selectData,
      ...restProps
    } = this.props;
    return (
      <EditableContext.Consumer>
        {(form) => {
          const { getFieldDecorator } = form;
          return (
            <td {...restProps}>
              {editing ? (
                <FormItem style={{ margin: 0 }}>
                  {getFieldDecorator(dataIndex, {
                    rules: [{
                      required: true,
                      message: `Input ${title}!`,
                    }],
                    initialValue: record[dataIndex],
                  })(this.getInput())}
                </FormItem>
              ) : restProps.children}
            </td>
          );
        }}
      </EditableContext.Consumer>
    );
  }
}

class AuthorshipAttributions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.author.names.map(name => ({
        name: name.value,
        language: name.language,
        key: name.id
      })),
      authorId: this.props.author.id,
      editingKey: '',
    }
    this.columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        inputType: 'text',
        enabled: true,
      },
      {
        title: 'Language',
        dataIndex: 'language',
        inputType: 'select',
        enabled: true,
        selectData: {
          selectProps: {
            showSearch: true,
            style: { width: 200 },
            placeholder: "Select language",
            optionFilterProp: "values",
            filterOption: (input, option) => option.props.values.toLowerCase().indexOf(input.toLowerCase()) >= 0
          },
          selectChildren: Languages,
        },
        render: (text, record) => (Languages[text].isoName)
      },
      {
        title: 'Operation',
        dataIndex: 'operation',
        render: (text, record) => {
          const editable = this.isEditing(record);
          return (
            <div>
              {editable ? (
                <span>
                  <EditableContext.Consumer>
                    {form => (
                      <a
                        onClick={() => this.save(form, record)}
                        style={{ marginRight: 8 }}
                      >
                        Save
                      </a>
                    )}
                  </EditableContext.Consumer>
                  <Divider type="vertical" />
                  <a onClick={() => this.cancel(record.key)}>Cancel</a>
                </span>
              ) : (
                  <React.Fragment>
                    <a onClick={() => this.edit(record.key)}>Edit</a>
                    <Divider type="vertical" />
                    <a onClick={() => this.delete(record.key)}>Remove</a>
                  </React.Fragment>
                )}
            </div>
          );
        },
      },
    ];
  }

  handleAdd = () => {
    const { data } = this.state;
    const newData = {
      name: '',
      language: Defaults.language,
      key: createGUID(),
    };
    this.setState({
      data: [...data, newData],
    });
    this.edit(newData.key)
  }

  delete = async (nameid) => {
    deleteName(nameid, this.props.client)
    const newData = [...this.state.data];
    const index = newData.findIndex(item => nameid === item.key);
    newData.splice(index, 1);
    this.setState({ data: newData })
  }

  isEditing = (record) => {
    return record.key === this.state.editingKey;
  };

  edit(key) {
    this.setState({ editingKey: key });
  }

  save(form, record) {
    form.validateFields((error, values) => {
      if (error) {
        return;
      }
      const client = this.props.client

      // Update the state
      const newData = [...this.state.data];
      const index = newData.findIndex(item => record.key === item.key);
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...values,
      });
      this.setState({
        data: newData,
        editingKey: ''
      });

      // Run corresponding queries
      if (this.props.author.names.find(name => name.id === record.key)) {
        updateName(newData[index], client)
      } else {
        addPersonName({ ...newData[index], personid: this.state.authorId }, client)
      }

    });
  }

  cancel = () => {
    this.setState({ editingKey: '' });
  };

  showPagination = (records) => records.length > 10

  render() {
    const { editable } = this.props

    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };

    const columns = this.columns
      .filter(c => {
        if (c.dataIndex === 'operation' && !editable) {
          return false
        }
        return true
      })
      .map((col) => {
        if (!col.editable) {
          return col;
        }
        return {
          ...col,
          onCell: record => ({
            record,
            inputType: col.inputType,
            dataIndex: col.dataIndex,
            title: col.title,
            editing: this.isEditing(record),
            selectData: col.selectData,
          }),
        };
      });

    return (
      <div>
        <Table
          components={components}
          size={'small'}
          bordered
          dataSource={this.state.data}
          columns={columns}
          rowClassName="editable-row"
          pagination={this.showPagination(this.props.author.names)}
        />
        {editable &&
          (
            <Button onClick={this.handleAdd} type="primary" style={{ margin: '8px 0 16px' }}>
              New name
          </Button>
          )
        }

      </div>

    );
  }
}

export default AuthorshipAttributions