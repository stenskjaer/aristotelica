import React from "react";
import { Input, Form, Button } from "antd";

class EditableTextArea extends React.Component {
  state = {
    editing: false,
    editable: true,
    content: this.props.author[this.props.field]
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

  toggleEdit = () => {
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if (editing) {
        this.input.focus();
      }
    });
  }

  handleClickOutside = (e) => {
    const { editing } = this.state;
    if (editing && this.field !== e.target && !this.field.contains(e.target)) {
      this.save();
    }
  }

  handleSave = (content) => {
    this.setState({ content: content });
  }

  save = () => {
    this.form.validateFields((error, values) => {
      if (error) {
        return;
      }
      this.toggleEdit();
      this.handleSave(values.description);
    });
  }

  form = this.props.form;

  render() {
    const { editing, editable, content } = this.state;
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
              {content}
            </div>
          )
      );
    }
    return (
      <React.Fragment>
        <h2>{this.props.heading} {editable ? <Button onClick={this.toggleEdit} shape="circle" size="small" icon="edit" style={{ marginLeft: '1ex' }} /> : ''}</h2>

        <div ref={node => (this.field = node)}>
          {editable ? editableContent() : content}
        </div>
      </React.Fragment>
    );
  }
}

export default Form.create()(EditableTextArea);