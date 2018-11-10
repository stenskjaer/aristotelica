import React, { Component } from "react";
import { Form, Input, Modal, InputNumber, Checkbox, Radio, Icon, Tooltip } from 'antd';
const moment = require('moment');

export const CreateUpdateDating = Form.create()(
  class extends Component {
    state = {
      singleDate: {
        year: 0,
        month: 0,
        day: 1,
        sum: undefined
      },
      startDate: {
        year: 0,
        month: 0,
        day: 1,
        sum: undefined
      },
      endDate: {
        year: 0,
        month: 0,
        day: 31,
        sum: undefined
      },
      datingRange: 'SINGLE',
    }

    updateDate = (type, unit, value) => {
      const copy = this.state
      copy[type][unit] = value
      copy[type].sum = moment().year(copy[type].year).month(copy[type].month).date(copy[type].day)
      this.setState(copy)
      this.setState(this.validateDateRange())
    }

    validateDateRange = () => {
      if (this.state.startDate.sum > this.state.endDate.sum) {
        return {
          validateStatus: 'error',
          errorMsg: 'The end date must be later than or equal to the start date.',
        };
      }
      return {
          validateStatus: 'success',
          errorMsg: null,
      };
    }

    handleChange = (value) => {
      this.setState({ value });
      console.log(this.state)
    }

    toggleDatingRange = (value) => {
      this.props.form.resetFields();
      this.setState({ datingRange: value });
    }

    onChange = (checkedValues) => {
      console.log('checked = ', checkedValues);
    }

    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldValue, getFieldDecorator } = form
      const yearTips = "Dates must lie within the period from 1100 to 1600."

      return (
        <Modal
          visible={visible}
          title="Create new dating"
          okText="Save"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form>
            {getFieldDecorator('datingid')(<Input disabled style={{ display: 'none' }} />)}

            <div className="form-group">
              <h3>Dating type</h3>
              <Form.Item
                help="Does the dating cover a start–end range or a single date point? 
                  A date point may cover a range within a segment."
              >
                {getFieldDecorator('datingType', { initialValue: "SINGLE" })(
                  <Radio.Group onChange={e => this.toggleDatingRange(e.target.value)}>
                    <Radio.Button value="SINGLE">Point</Radio.Button>
                    <Radio.Button value="RANGE">Range</Radio.Button>
                  </Radio.Group>
                )}
              </Form.Item>
            </div>

            <div className="form-group" style={{ display: this.state.datingRange === 'SINGLE' ? 'block' : 'none' }}>
              <h3>Date details</h3>
              <Form.Item label="Year" help="Between 1100 and 1600.">
                {getFieldDecorator('singleYear')(
                  <InputNumber min={1100} max={1600} onChange={e => this.updateDate('singleDate', 'year', e)}/>
                )}
              </Form.Item>
              <Form.Item label="Month">
                {getFieldDecorator('singleMonth')(
                  <InputNumber min={0} max={11} onChange={e => this.updateDate('singleDate', 'month', e)}/>
                )}
              </Form.Item>
              <Form.Item label="Day">
                {getFieldDecorator('singleDay')(
                  <InputNumber min={1} max={31} onChange={e => this.updateDate('singleDate', 'day', e)}/>
                )}
              </Form.Item>
              <Form.Item label="Certainty">
                {getFieldDecorator('singleCertainty')(
                  <Checkbox.Group
                    options={[
                      { label: 'Approximate', value: 'singleApproximate' },
                      { label: 'Uncertain', value: 'singleUncertain' },
                    ]}
                  />
                )}
              </Form.Item>
            </div>

            <div className="form-group" style={{ display: this.state.datingRange === 'RANGE' ? 'block' : 'none' }}>
              <h3>
                Date range details<span style={{margin: '5px'}}/>
                <Tooltip title="Tooltip text!">
                  <Icon type="question-circle" />
                </Tooltip>
              </h3>
              
              <Form.Item label="Start year" validateStatus={this.state.validateStatus}>
                {getFieldDecorator('startYear')(
                  <InputNumber min={1100} max={1600} onChange={e => this.updateDate('startDate', 'year', e)}/>
                )}
              </Form.Item>
              <Form.Item label="Start month" validateStatus={this.state.validateStatus}>
                {getFieldDecorator('startMonth')(
                  <InputNumber min={0} max={11} onChange={e => this.updateDate('startDate', 'month', e)}/>
                )}
              </Form.Item>
              <Form.Item label="Start day" validateStatus={this.state.validateStatus}>
                {getFieldDecorator('startDay')(
                  <InputNumber min={1} max={31} onChange={e => this.updateDate('startDate', 'day', e)}/>
                )}
              </Form.Item>
              
              <Form.Item label="Certainty">
                {getFieldDecorator('startCertainty')(
                  <Checkbox.Group onChange={this.onChange}
                    options={[
                      { label: 'Approximate', value: 'startApproximate' },
                      { label: 'Uncertain', value: 'startUncertain' },
                    ]}
                  />
                )}
              </Form.Item>
              
              <h4>End date</h4>
              <Form.Item label="End date" validateStatus={this.state.validateStatus} help={this.state.errorMsg}>
                {getFieldDecorator('endYear')(
                  <InputNumber min={1100} max={1600} onChange={e => this.updateDate('endDate', 'year', e)}/>
                )}
              </Form.Item>
              <Form.Item label="End month" validateStatus={this.state.validateStatus} help={this.state.errorMsg}>
                {getFieldDecorator('endMonth')(
                  <InputNumber min={0} max={11} onChange={e => this.updateDate('endDate', 'month', e)}/>
                )}
              </Form.Item>
              <Form.Item label="End day" validateStatus={this.state.validateStatus} help={this.state.errorMsg}>
                {getFieldDecorator('endDay')(
                  <InputNumber min={1} max={31} onChange={e => this.updateDate('endDate', 'day', e)}/>
                )}
              </Form.Item>
              <Form.Item label="Certainty" validateStatus={this.state.validateStatus}>
                {getFieldDecorator('endCertainty')(
                  <Checkbox.Group onChange={this.onChange}
                    options={[
                      { label: 'Approximate', value: 'endApproximate' },
                      { label: 'Uncertain', value: 'endUncertain' },
                    ]}
                  />
                )}
              </Form.Item>
            </div>
            <div className="form-group">
              <h3>Dating metadata</h3>
              <Form.Item label="Note">
                {getFieldDecorator('note')(<Input.TextArea rows={3} />)}
              </Form.Item>
              <Form.Item label="Source">
                {getFieldDecorator('source')(<Input.TextArea rows={3} />)}
              </Form.Item>
            </div>
          </Form>

        </Modal>
      );
    }
  }
);