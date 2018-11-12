import React, { Component } from "react";
import { Form, Input, Modal, InputNumber, Checkbox, Radio, Icon, Tooltip, Cascader, Tabs, message } from 'antd';
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
        day: 1,
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

    resetDate = () => {
      this.setState({
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
          day: 1,
          sum: undefined
        },
      })
    }

    updateMonthDay = (type, e) => {
      this.updateDate(type, 'month', e[0])
      if (e.length === 2) {
        this.updateDate(type, 'day', e[1])
      }
    }

    updateSegmentDate = (type, unit, value) => {
      const copy = this.state
      if (type === 'startDate' || type === 'singleDate') {
        copy['startDate'].year = value
        copy['startDate'].sum = moment([copy['startDate'].year]).startOf('year')
      }
      if (type === 'endDate' || type === 'singleDate') {
        copy['endDate'].year = unit === 'decade'? value + 9 : value + 24
        copy['endDate'].month = 11
        copy['endDate'].day = 31
        copy['endDate'].sum = moment([copy['endDate'].year]).endOf('year')
      } 
      this.setState(copy)
      this.setState(this.validateDateRange())
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

    centuries = () => {
      const cents = []
      const buildDecades = (century) => {
        const decades =  []
        for ( let i = century ; i < century + 100 ; i = i + 10 ) {
          decades.push({
            value: i,
            label: `${i}–${i+9}`
          })
        }
        return decades
      }
      for ( let i = 1100 ; i < 1600 ; i = i+100 ) {
        const century = {
          value: i,
          label: i,
          children: buildDecades(i)
        }
        cents.push(century)
      }
      return cents
    }

    quarters = () => {
      const cents = []
      const qNames = {
        0: '1st quarter',
        25: '2nd quarter',
        50: '3rd quarter',
        75: '4th quarter'
      }
      const buildQuarters = () => {
        const quarters = []
        for ( let i = 0 ; i < 100 ; i = i + 25 ) {
          quarters.push({
            value: i,
            label: qNames[i]
          })
        }
        return quarters
      }
      for ( let i = 11 ; i < 16 ; i++ ) {
        cents.push({
          value: i,
          label: `${i+1}th century`,
          children: buildQuarters()
        })
      }
      return cents
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

    toggleDatingRange = (value) => {
      this.props.form.resetFields();
      this.setState({ datingRange: value });
    }

    handleChange = (value) => {
      this.setState({ value });
    }

    handleSubmit = () => {
      if (this.state.validateStatus === 'error') {
        message.error("You cannot submit the form with validation errors.")
      } else {
        this.props.onCreate()
      }
    }

    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form
      const monthCascader = {
        displayRender: (label => label.join(' ')),
        changeOnSelect: true,
        placeholder: 'Month and date'
      }
      const endRangeItemOptions = {
        validateStatus: this.state.validateStatus,
        help: this.state.errorMsg
      }
      const dateTooltip = 'The date must be between 1100 and 1600.'     

      return (
        <Modal
          visible={visible}
          title="Create new dating"
          okText="Save"
          onCancel={onCancel}
          onOk={this.handleSubmit}
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
              <Tabs defaultActiveKey="1" 
                onChange={() => {
                  this.props.form.resetFields(
                    ['singleYear', 'singleMonthDate', 'singleDecade', 'singleQuarter']
                  );
                  this.resetDate()
                }}
              >

                <Tabs.TabPane tab="Date" key="1">
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
                      <Cascader options={this.buildYear(this.state.singleDate.year)} {...monthCascader} 
                        onChange={e => this.updateMonthDay('singleDate', e)}
                      />
                    )}
                  </Form.Item>
                </Tabs.TabPane>

                <Tabs.TabPane tab="Decade" key="2">
                  <Form.Item>
                  {getFieldDecorator('singleDecade')(
                      <Cascader options={this.centuries()} displayRender={labels => labels[1]} 
                        onChange={e => this.updateSegmentDate('singleDate', 'decade', e[1])}
                      />
                    )}
                  </Form.Item>
                </Tabs.TabPane>

                <Tabs.TabPane tab="Quarter" key="3">
                  <Form.Item>
                    {getFieldDecorator('singleQuarter')(
                      <Cascader options={this.quarters()} displayRender={labels => labels.join(', ')}
                        onChange={e => this.updateSegmentDate('singleDate', 'quarter', e[0] * 100 + e[1])}
                      />
                    )}
                  </Form.Item>
                </Tabs.TabPane>
              </Tabs>
              
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
              <Tabs defaultActiveKey="1" 
                onChange={() => {
                  this.props.form.resetFields(
                    ['startYear', 'startMonthDate', 'startDecade', 'startQuarter']
                  )
                  this.resetDate()
                  }}
                >

                <Tabs.TabPane tab="Date" key="1">
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
                      <Cascader options={this.buildYear(this.state.startDate.year)} {...monthCascader} 
                        onChange={e => this.updateMonthDay('startDate', e)}
                      />
                    )}
                  </Form.Item>
                </Tabs.TabPane>

                <Tabs.TabPane tab="Decade" key="2">
                  <Form.Item>
                  {getFieldDecorator('startDecade')(
                      <Cascader options={this.centuries()} displayRender={labels => labels[1]} 
                        onChange={e => this.updateSegmentDate('startDate', 'decade', e[1])}
                      />
                    )}
                  </Form.Item>
                  
                </Tabs.TabPane>

                <Tabs.TabPane tab="Quarter" key="3">
                  <Form.Item>
                    {getFieldDecorator('startQuarter')(
                      <Cascader options={this.quarters()} displayRender={labels => labels.join(', ')}
                        onChange={e => this.updateSegmentDate('startDate', 'quarter', e[0] * 100 + e[1])}
                      />
                    )}
                  </Form.Item>
                </Tabs.TabPane>
              </Tabs>
              
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
              <Tabs defaultActiveKey="1"
                onChange={() => {
                  this.props.form.resetFields(
                  ['endYear', 'endMonthDate', 'endDecade', 'endQuarter']
                )
                this.resetDate()
                }}
              >

                <Tabs.TabPane tab="Date" key="1">      
                  <Form.Item {...endRangeItemOptions}>
                    {getFieldDecorator('endYear')(
                      <InputNumber 
                        placeholder={'Year'}
                        min={1100} max={1600} 
                        onChange={e => this.updateDate('endDate', 'year', e)}
                      />
                    )}
                  </Form.Item>
                  <Form.Item {...endRangeItemOptions}>
                    {getFieldDecorator('endMonthDate')(
                      <Cascader options={this.buildYear(this.state.endDate.year)} {...monthCascader}
                        onChange={e => this.updateMonthDay('endDate', e)}
                      />
                    )}
                  </Form.Item>
                </Tabs.TabPane>

                <Tabs.TabPane tab="Decade" key="2">
                  <Form.Item {...endRangeItemOptions}>
                  {getFieldDecorator('endDecade')(
                      <Cascader options={this.centuries()} displayRender={labels => labels[1]} 
                        onChange={e => this.updateSegmentDate('endDate', 'decade', e[1])}
                      />
                    )}
                  </Form.Item>
                  
                </Tabs.TabPane>

                <Tabs.TabPane tab="Quarter" key="3">
                <Form.Item {...endRangeItemOptions}>
                  {getFieldDecorator('endQuarter')(
                      <Cascader options={this.quarters()} displayRender={labels => labels.join(', ')} 
                        onChange={e => this.updateSegmentDate('endDate', 'quarter', e[0] * 100 + e[1])}  
                      />
                    )}
                  </Form.Item>
                </Tabs.TabPane>
              </Tabs>
              
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