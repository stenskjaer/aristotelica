import React from "react";
import { Input, Form, Button } from "antd";

function NoData() {
  return (
    <span style={{ opacity: 0.65 }}>No data</span>
  )
}

class EditableTextArea extends React.Component {
  state = {
    editing: false,
    content: this.props.author[this.props.field] || ''
  }

  componentDidMount() {
    if (this.state.editable) {
      document.addEventListener('click', this.handleClickOutside, true);
    }
  }

  componentWillUnmount() {
    if (this.state.editable) {
      document.removeEventListener('click', this.handleClickOutside, true);
    }
  }

  handleCreateUpdateDB = this.props.handleCreateUpdateDB;

  handleClickOutside = (e) => {
    const { editing } = this.state;
    if (editing && this.field !== e.target && !this.field.contains(e.target)) {
      this.save();
    }
  }

  toggleEdit = () => {
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if (editing) {
        this.input.focus();
      }
    });
  }

  save = () => {
    this.form.validateFields((error, values) => {
      if (error) {
        return;
      }
      this.toggleEdit();
      this.setState({ content: values.description });
      this.handleCreateUpdateDB({ [this.props.field]: values.description })
    });
  }

  form = this.props.form;

  render() {
    const { editing, content } = this.state;
    const { editable } = this.props;

    const editableContent = () => {
      return (
        editing ? (
          <Form.Item style={{ margin: 0 }}>
            {this.form.getFieldDecorator('description', {
              rules: [{
                required: false,
                message: `Required.`,
              }],
              initialValue: content,
            })(
              <Input.TextArea
                ref={node => (this.input = node)}
                onPressEnter={this.save}
                autosize={'true'}
              />
            )}
          </Form.Item>
        ) : (
            <div
              className="editable-cell-value-wrap"
              style={{ paddingRight: 24 }}
              onClick={this.toggleEdit}
            >
              {content || <span style={{ opacity: 0.65 }}>{'Field is empty, click to add a ' + this.props.field}</span>}
            </div>
          )
      );
    }
    return (
      <React.Fragment>
        <h2>{this.props.heading}
          {
            editable
              ? <Button onClick={this.toggleEdit} shape="circle" size="small" icon="edit" style={{ marginLeft: '1ex' }} />
              : ''
          }
        </h2>

        <div ref={node => (this.field = node)}>
          {editable
            ? editableContent()
            : content || <NoData />}
        </div>
      </React.Fragment>
    );
  }
}

export default Form.create()(EditableTextArea);