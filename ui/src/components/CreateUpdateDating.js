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
      tabsPositions: {
        datingRange: "SINGLE",
        endTabs: "1",
        startTabs: "1",
      }
    }

    componentDidMount() {
      this.setState(this.props.form.getFieldValue('options'))
    }

    updateDate = (type, unit, value) => {
      if (value === undefined) {
        // This update is a delete
        this.resetDate(type)
      } else {
        const copy = this.state
        copy[type][unit] = value
        copy[type].sum = moment().year(copy[type].year).month(copy[type].month).date(copy[type].day)
        this.setState(copy)
      }
      this.setState(this.validateDateRange())
    }

    resetDate = (type) => {
      const defaults = {
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
      }
      this.setState(defaults[type])
    }

    updateMonthDay = (type, e) => {
      this.updateDate(type, 'month', e[0])
      if (e.length === 2) {
        this.updateDate(type, 'day', e[1])
      }
    }

    updateSegmentDate = (type, unit, value) => {
      if (value === undefined) {
        // This is a delete update
        this.props.form.resetFields([type + 'Year', type + 'Quarter', type + 'Decade'])
        this.resetDate(type + 'Date')
      } else {
        const copy = this.state
        if (type === 'start' || type === 'single') {
          copy['startDate'].year = value
          copy['startDate'].sum = moment([copy['startDate'].year]).startOf('year')
        }
        if (type === 'end' || type === 'single') {
          copy['endDate'].year = unit === 'decade'? value + 9 : value
          copy['endDate'].month = 11
          copy['endDate'].day = 31
          copy['endDate'].sum = moment([copy['endDate'].year]).endOf('year')
        } 
        this.setState(copy)
      }
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

    centuries = (end) => {
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
    

    quarters = (end) => {
      const cents = []
      const quartNames = ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter']

      const buildQuarters = (cent) => {
        const quarters = []
        for ( let i = 0 ; i < 4 ; i++ ) {
          if (end) {
            quarters.push({
              value: cent + 24 + (i * 25),
              label: quartNames[i]
            })
          } else {
            quarters.push({
              value: cent + (i * 25), 
              label: quartNames[i]
            })
          }
          
        }
        return quarters
      }
      for ( let i = 1100 ; i < 1600 ; i = i + 100 ) {
        cents.push({
          value: i,
          label: `${(i / 100) +1}th century`,
          children: buildQuarters(i)
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

    updateDatingRange = (key, value) => {
      const positions = this.state.tabsPositions
      positions[key] = value
      this.setState(positions)
    }

    toggleDatingRange = (value) => {
      const positions = this.state.tabsPositions
      positions['datingRange'] = value
      this.setState(positions)
    }

    updateTabs = (value, type) => {
      this.props.form.resetFields(
        [type + 'Year', type + 'MonthDate', type + 'Decade', type + 'Quarter']
      )
      this.resetDate(type + 'Date')
      const positions = this.state.tabsPositions
      positions[type + 'Tabs'] = value
      this.setState(positions)
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
      const { visible, onCancel, form } = this.props;
      const { getFieldDecorator } = form
      const monthCascader = {
        displayRender: (label => label.join(' ')),
        changeOnSelect: true,
        placeholder: 'Month and date',
        allowClear: true,
      }
      const endRangeItemOptions = {
        validateStatus: this.state.validateStatus,
        help: this.state.errorMsg
      }
      const dateTooltip = 'The date must be between 1100 and 1600.'     
      const startCenturies = this.centuries()
      const endCenturies = this.centuries({end: true})
      const startQuarters = this.quarters()
      const endQuarters = this.quarters({end:true})

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
            {getFieldDecorator('singledateid')(<Input disabled style={{ display: 'none' }} />)}
            {getFieldDecorator('startdateid')(<Input disabled style={{ display: 'none' }} />)}
            {getFieldDecorator('enddateid')(<Input disabled style={{ display: 'none' }} />)}
            {getFieldDecorator('positions')(<Input disabled onChange={e => this.updateDatingRange('datingRange', e)} style={{ display: 'none' }} />)}

            <div className="form-group">
              <h3>Dating type</h3>
              <Form.Item
                help="Does the dating cover a start–end range or a single date point? 
                  Range datings also include decades and quarters."
              >
                {getFieldDecorator('datingType', { initialValue: this.state.tabsPositions.datingRange })(
                  <Radio.Group onChange={e => this.toggleDatingRange(e.target.value)}>
                    <Radio.Button value="SINGLE">Single date</Radio.Button>
                    <Radio.Button value="RANGE">Date range</Radio.Button>
                  </Radio.Group>
                )}
              </Form.Item>
            </div>

            <div className="form-group" style={{ display: this.state.tabsPositions.datingRange === 'SINGLE' ? 'block' : 'none' }}>
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
                  <Cascader options={this.buildYear(this.state.singleDate.year)} {...monthCascader} 
                    onChange={e => this.updateMonthDay('singleDate', e)}
                  />
                )}
              </Form.Item>
              
              <Form.Item label="Certainty">
                {getFieldDecorator('singleCertainty')(
                  <Checkbox.Group
                    options={[
                      { label: 'Approximate', value: 'approximate' },
                      { label: 'Uncertain', value: 'uncertain' },
                    ]}
                  />
                )}
              </Form.Item>
            </div>

            <div className="form-group" style={{ display: this.state.tabsPositions.datingRange === 'RANGE' ? 'block' : 'none' }}>
              <h3>
                Date range details 
                <span style={{margin: '5px'}}/>
                <Tooltip title={dateTooltip}>
                  <Icon type="question-circle" />
                </Tooltip>
              </h3>
              
              <h4>Start</h4>
              <Tabs activeKey={this.state.tabsPositions.startTabs} 
                onChange={(e) => this.updateTabs(e, 'start')}
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
                      <Cascader options={startCenturies} displayRender={labels => labels[1]} 
                        onChange={e => this.updateSegmentDate('start', 'decade', e[1])}
                        allowClear={true}
                      />
                    )}
                  </Form.Item>
                </Tabs.TabPane>

                <Tabs.TabPane tab="Quarter" key="3">
                  <Form.Item>
                    {getFieldDecorator('startQuarter')(
                      <Cascader options={startQuarters} displayRender={labels => labels.join(', ')}
                        onChange={e => this.updateSegmentDate('start', 'quarter', e[1])}
                        allowClear={true}
                      />
                    )}
                  </Form.Item>
                </Tabs.TabPane>
              </Tabs>
              
              <Form.Item label="Certainty">
                {getFieldDecorator('startCertainty')(
                  <Checkbox.Group onChange={this.onChange}
                    options={[
                      { label: 'Approximate', value: 'approximate' },
                      { label: 'Uncertain', value: 'uncertain' },
                    ]}
                  />
                )}
              </Form.Item>
              
              <h4>End</h4>
              <Tabs activeKey={this.state.tabsPositions.endTabs}
                onChange={(e) => this.updateTabs(e, 'end')}
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
                      <Cascader options={endCenturies} displayRender={labels => labels[1]} 
                        onChange={e => this.updateSegmentDate('end', 'decade', e[1])}
                        allowClear={true}
                      />
                    )}
                  </Form.Item>
                  
                </Tabs.TabPane>

                <Tabs.TabPane tab="Quarter" key="3">
                <Form.Item {...endRangeItemOptions}>
                  {getFieldDecorator('endQuarter')(
                      <Cascader options={endQuarters} displayRender={labels => labels.join(', ')} 
                        onChange={e => this.updateSegmentDate('end', 'quarter', e[1])}  
                        allowClear={true}
                      />
                    )}
                  </Form.Item>
                </Tabs.TabPane>
              </Tabs>
              
              <Form.Item label="Certainty" validateStatus={this.state.validateStatus}>
                {getFieldDecorator('endCertainty')(
                  <Checkbox.Group onChange={this.onChange}
                    options={[
                      { label: 'Approximate', value: 'approximate' },
                      { label: 'Uncertain', value: 'uncertain' },
                    ]}
                  />
                )}
              </Form.Item>
            </div>

            <div className="form-group">
              <h3>Notes and sources</h3>
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
