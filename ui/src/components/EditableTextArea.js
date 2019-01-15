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
  }
  form = this.props.form;
  handleUpdate = this.props.handleUpdate;

  componentDidUpdate() {
    if (this.props.editable) {
      document.addEventListener('click', this.handleClickOutside, true);
    }
  }

  componentWillUnmount() {
    if (this.props.editable) {
      document.removeEventListener('click', this.handleClickOutside, true);
    }
  }

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
      this.handleUpdate({ field: this.props.field, content: values.content })
    });
  }

  render() {

    const { editing } = this.state;
    const { editable, data, field, heading } = this.props;
    const content = data[field]

    const editableContent = () => {
      return (
        editing ? (
          <Form.Item style={{ margin: 0 }} key={data.id}>
            {this.form.getFieldDecorator('content', {
              initialValue: content,
            })(
              <Input.TextArea
                ref={node => (this.input = node)}
                onPressEnter={this.save}
                autosize
              />
            )}
          </Form.Item>
        ) : (
            <div
              className="editable-cell-value-wrap"
              style={{ paddingRight: 24 }}
              onClick={this.toggleEdit}
            >
              {content || <span style={{ opacity: 0.65 }}>{'Field is empty, click to add a ' + field}</span>}
            </div>
          )
      );
    }
    return (
      <React.Fragment>
        <h2>{heading}
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