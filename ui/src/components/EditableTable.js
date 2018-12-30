import React, { Component } from 'react'
import { Table, Input, InputNumber, Divider, Form, Button } from 'antd';
import { createGUID } from './utils';

const FormItem = Form.Item;
const EditableContext = React.createContext();

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

class EditableTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editingKey: ''
    }
    this.columns = [
      ...this.props.contentColumns,
      {
        title: 'Operation',
        dataIndex: 'operation',
        render: (text, record) => {
          const editing = this.isEditing(record);
          return (
            <div>
              {editing ? (
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
                    <a onClick={() => this.delete(record.key)}>Delete</a>
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
      language: '',
      key: createGUID(),
    };
    this.setState({
      data: [...data, newData],
    });
    this.edit(newData.key)
  }

  delete = async (nameid) => {
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
    console.log(key)
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

    });
  }

  cancel = () => {
    this.setState({ editingKey: '' });
  };

  showPagination = (records) => records.length > 10

  render() {
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };

    const columns = this.columns.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          inputType: col.dataIndex === 'age' ? 'number' : 'text',
          dataIndex: col.dataIndex,
          title: col.title,
          editing: this.isEditing(record),
        }),
      };
    });

    return (
      <div>
        <Table
          components={components}
          columns={columns}
          rowClassName="editable-row"
          bordered
          pagination={this.showPagination(this.props.dataSource)}
          {...this.props}
        />
        <Button onClick={this.handleAdd} type="primary" style={{ margin: '8px 0 16px' }}>
          Add a row
        </Button>
      </div>

    );
  }
}

export default EditableTable