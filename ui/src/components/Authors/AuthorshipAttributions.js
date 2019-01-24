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

const addPersonName = async ({ values, client }) => {
  const { error, data } = await client.mutate({
    mutation: ADD_NAME,
    variables: {
      nameid: values.id,
      personid: values.personid,
      language: values.language,
      name: values.value
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

const updateName = async ({ values, client }) => {
  const { error, data } = await client.mutate({
    mutation: UPDATE_NAME,
    variables: {
      nameid: values.id,
      language: values.language,
      name: values.value
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

const deleteName = async ({ nameid, client }) => {
  await client.mutate({
    mutation: DELETE_NAME,
    variables: {
      nameid: nameid,
    },
    refetchQueries: ['allPersons']
  })
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
  state = {
    editingKey: '',
  }

  isEditing = (record) => {
    return record.key === this.state.editingKey;
  };

  edit(key) {
    this.setState({ editingKey: key });
  }

  add = () => {
    const newData = [...this.props.data];
    const newItem = {
      value: '',
      language: Defaults.language,
      id: createGUID(),
      draft: true,
    }
    newData.push(newItem)
    // Send up the state
    this.props.handleUpdate({
      relation: 'names',
      data: newData,
      updaters: [],
      operation: 'add'
    })
    this.edit(newItem.id)
  }

  delete = (record) => {
    const newData = [...this.props.data];
    const index = newData.findIndex(item => item.id === record.id);
    newData.splice(index, 1);
    let updaters = []
    if (!this.props.isDrafted(record.id)) {
      updaters.push({
        id: record.id,
        func: deleteName,
        variables: { nameid: record.id, client: this.props.client }
      })
    }
    this.props.handleUpdate({
      relation: 'names',
      data: newData,
      operation: 'remove',
      updaters
    })
  }

  cancel = (record) => {
    const newData = [...this.props.data];
    const index = newData.findIndex(item => item.id === record.id);
    newData.splice(index, 1);
    this.props.handleUpdate({
      relation: 'names',
      data: newData,
      operation: 'remove',
      updaters: []
    })
    this.setState({ editingKey: '' });
  };

  save(form, record) {
    form.validateFields((error, values) => {
      if (error) {
        return;
      }

      // Update the data
      const newData = [...this.props.data];
      const index = newData.findIndex(item => item.id === record.key);
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...values,
      });

      let updaters = []
      // Save the mutation functions in the updater registry
      if (!record.draft) {
        updaters.push({
          id: record.key,
          func: updateName,
          variables: {
            values: newData[index],
            client: this.props.client
          },
          accumulate: false
        })
      } else {
        updaters.push({
          id: record.key,
          func: addPersonName,
          variables: {
            values: { ...newData[index], personid: this.props.id },
            client: this.props.client
          },
          accumulate: false
        })
      }
      this.props.addDraft(record.key)

      // Send up the state
      this.props.handleUpdate({
        relation: 'names',
        data: newData,
        updaters,
        operation: 'update'
      })
      this.setState({
        editingKey: ''
      });

    });
  }

  showPagination = (records) => records.length > 10

  render() {
    const { editable } = this.props

    const columns = [
      {
        title: 'Name',
        dataIndex: 'value',
        inputType: 'text',
        enabled: true,
        editable: 'true'
      },
      {
        title: 'Language',
        dataIndex: 'language',
        inputType: 'select',
        enabled: true,
        editable: 'true',
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
                  <a onClick={() => this.cancel(record)}>Cancel</a>
                </span>
              ) : (
                  <React.Fragment>
                    <a onClick={() => this.edit(record.key)}>Edit</a>
                    <Divider type="vertical" />
                    <a onClick={() => this.delete(record)}>Remove</a>
                  </React.Fragment>
                )}
            </div>
          );
        },
      }]
      .filter(c => {
        if (c.dataIndex === 'operation') {
          if (!this.props.editable) {
            return false
          }
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

    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };

    const dataSource = this.props.data.map(name => ({
      ...name,
      key: name.id
    }))

    return (
      <React.Fragment>
        <h2>
          {this.props.heading}
          {
            editable
              ? <Button onClick={this.add} shape="circle" size="small" icon="plus" style={{ marginLeft: '1ex' }} />
              : ''
          }
        </h2>
        <Table
          components={components}
          size={'small'}
          bordered
          dataSource={dataSource}
          columns={columns}
          rowClassName="editable-row"
          pagination={this.showPagination(this.props.data)}
        />
      </React.Fragment>

    );
  }
}

export default AuthorshipAttributions
