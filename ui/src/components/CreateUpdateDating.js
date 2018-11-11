import React, { Component } from "react";
import { Form, Input, Modal, InputNumber, Checkbox, Radio, Icon, Tooltip, Cascader } from 'antd';
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

    updateMonthDay = (type, e) => {
      this.updateDate(type, 'month', e[0])
      if (e.length === 2) {
        this.updateDate(type, 'day', e[1])
      }
    }

    buildYear = (year) => {
      const fullYear = []
      const buildMonths = (year, i) => {
        const date = new Date(year, i, 1);
        const result = [];
        while (date.getMonth() === i) {
          result.push({
            value: date.getDate(),
            label: moment(date).format('Do'),
          });
          date.setDate(date.getDate() + 1);
        }
        return result;
      }
      for ( let i = 0 ; i < 12 ; i++ ) {
        const month = {
          value: i,
          label: moment([year, i]).format('MMMM'),
          children: buildMonths(year, i)         
        }
        fullYear.push(month)
      }
      return fullYear
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
      const { getFieldDecorator } = form
      const cascaderOptions = {
        displayRender: (label => label.join(' ')),
        changeOnSelect: true,
        placeholder: 'Month and date'
      }
      const dateTooltip = 'The date must be between 1100 and 1600.'

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
              <h3>
                Date details 
                <span style={{margin: '5px'}}/>
                <Tooltip title={dateTooltip}>
                  <Icon type="question-circle" />
                </Tooltip>
              </h3>
              <Form.Item>
                {getFieldDecorator('singleYear')(
                  <InputNumber 
                    placeholder={'Year'} 
                    min={1100} max={1600} 
                    onChange={e => this.updateDate('singleDate', 'year', e)}
                  />
                )}
              </Form.Item>
              <Form.Item>
                {getFieldDecorator('singleMonthDate')(
                  <Cascader options={this.buildYear(this.state.singleDate.year)} {...cascaderOptions} 
                    onChange={e => this.updateMonthDay('singleDate', e)}
                  />
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
                Date range details 
                <span style={{margin: '5px'}}/>
                <Tooltip title={dateTooltip}>
                  <Icon type="question-circle" />
                </Tooltip>
              </h3>
              
              <h4>Start</h4>
              <Form.Item>
              {getFieldDecorator('datingType', { initialValue: "SINGLE" })(
                  <Radio.Group onChange={e => this.toggleDatingRange(e.target.value)}>
                    <Radio.Button value="DATE">Date</Radio.Button>
                    <Radio.Button value="DECADE">Decade</Radio.Button>
                    <Radio.Button value="QUARTER">Quarter</Radio.Button>
                  </Radio.Group>
                )}
                </Form.Item>
              <Form.Item validateStatus={this.state.validateStatus}>
                {getFieldDecorator('startYear')(
                  <InputNumber 
                    placeholder={'Year'} 
                    min={1100} max={1600} 
                    onChange={e => this.updateDate('startDate', 'year', e)}
                  />
                )}
              </Form.Item>
              <Form.Item validateStatus={this.state.validateStatus}>
                {getFieldDecorator('startMonthDate')(
                  <Cascader options={this.buildYear(this.state.startDate.year)} {...cascaderOptions} 
                    onChange={e => this.updateMonthDay('startDate', e)}
                  />
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
              
              <h4>End</h4>
              <Form.Item validateStatus={this.state.validateStatus} help={this.state.errorMsg}>
                {getFieldDecorator('endYear')(
                  <InputNumber 
                    placeholder={'Year'}
                    min={1100} max={1600} 
                    onChange={e => this.updateDate('endDate', 'year', e)}
                  />
                )}
              </Form.Item>
              <Form.Item validateStatus={this.state.validateStatus} help={this.state.errorMsg}>
                {getFieldDecorator('endMonthDate')(
                  <Cascader options={this.buildYear(this.state.endDate.year)} {...cascaderOptions}
                    onChange={e => this.updateMonthDay('endDate', e)}
                  />
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