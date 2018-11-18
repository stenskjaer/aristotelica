import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { createGUID } from './utils'
import { List, Button, message } from 'antd';
import { CreateUpdateDating } from './CreateUpdateDating';
const moment = require("moment");

const DATING_QUERY = gql`
  query textDating($id: ID!) {
    Text(id: $id) {
      id
      title
      datings {
        id
        source
        note
        type
        dates {
          id
          type
          approximate
          uncertain
          decade
          quarter
          century
          year {
            id
            value
          }
          month {
            id
            value
          }
          day {
            id 
            value
          }
        }
      }
    }
  }
`

const CREATE_DATING = gql`
  mutation createDating(
    $textid: ID!
    $datingid: ID!
    $datingtype: String!
    $note: String
    $source: String
  ) {
    CreateDating(
      id: $datingid
      type: $datingtype
      note: $note
      source: $source
    ) {id}
    AddDatingText(
      datingid:$datingid
      textid:$textid
    ) {id}
  }
`

const createDating = async (datingid, values, client) => {
  const { error, data } = await client.mutate({
    mutation: CREATE_DATING,
    variables: {
      ...values,
      datingid: datingid,
      datingtype: values.datingType
    },
  });
  if (error) {
    message.error(error.message)
  }
  return data.CreateDating.id
}

const UPDATE_DATING = gql`
  mutation updateDating(
    $datingid: ID!
    $datingtype: String!
    $note: String
    $source: String
  ) {
    UpdateDating(
      id: $datingid
      type: $datingtype
      note: $note
      source: $source
    ) {id}
  }
`

const updateDating = async (values, client) => {
  const { error, data } = await client.mutate({
    mutation: UPDATE_DATING,
    variables: {
      ...values,
      datingid: values.datingid,
      datingtype: values.datingType
    },
  });
  if (error) {
    message.error(error.message)
  }
  return data.UpdateDating.id
}

const CREATE_DATE = gql`
  mutation createDate(
    $dateid: ID!
    $datingid: ID!
    $approximate: Boolean!
    $uncertain: Boolean!
    $century: Int
    $quarter: Int
    $decade: Int
    $yearid: ID!
    $type: DateType!
  ) {
    CreateDate(
      id: $dateid
      type: $type
      approximate: $approximate
      uncertain: $uncertain
      century: $century
      decade: $decade
      quarter: $quarter
    ) {id}
    AddDatingDates(
      datingid: $datingid
      dateid: $dateid
    ) {id}
    AddDateYear(
      dateid: $dateid
      yearid: $yearid
    ) {id}
  }
`

const CREATE_DATE_MONTH = gql`
  mutation addDateMonth(
    $dateid: ID!
    $monthid: ID!
  ) {
    AddDateMonth(
      dateid: $dateid
      monthid: $monthid
    ) {id}
  }
`

const ADD_DATE_DAY = gql`
  mutation addDateDay(
    $dateid: ID!
    $dayid: ID!
  ) {
    AddDateDay(
      dateid: $dateid
      dayid: $dayid
    ) {id}
  }
`

const CREATE_MONTH = gql`
  mutation createMonth(
    $id: ID!
    $value: Int!
    $yearid: ID!
  ) {
    CreateMonth(
      id: $id
      value: $value
    ) {id}
    AddYearMonths(
      yearid: $yearid
      monthid: $id
    ) {id}
  }
`

const CREATE_DAY = gql`
  mutation createDay(
    $id: ID!
    $value: Int!
    $monthid: ID!
  ) {
    CreateDay(
      id: $id
      value: $value
    ) {id}
    AddMonthDays(
      monthid: $monthid
      dayid: $id
    ) {id}
  }
`

const GET_YEAR = gql`
  query getYear($value: Int!) {
    Year(value: $value) {
      id
      months {
        id
        value
        days {
          id
          value
        }
      }
    }
  }
`

const createDate = async (datingid, dateInfo, client) => {

  if (dateInfo.dateid === undefined) {
    dateInfo.dateid = createGUID()
  }

  const yearQuery = await client.query({
    query: GET_YEAR,
    variables: { value: dateInfo.year }
  })
  const year = yearQuery.data.Year[0]

  // Create date and add year
  const date = await client.mutate({
    mutation: CREATE_DATE,
    variables: {
      ...dateInfo,
      datingid: datingid,
      yearid: year.id,
      type: dateInfo.datetype,
      decade: dateInfo.decade,
      quarter: dateInfo.quarter,
    },
    refetchQueries: ['textDating']
  })

  // Month and day creation and registration if applicable.
  if (dateInfo.month !== undefined) {
    let month
    let day
    const months = year.months
    if (months === undefined || !months.find(x => x.value === dateInfo.month)) {
      month = await client.mutate({
        mutation: CREATE_MONTH,
        variables: {
          id: createGUID(),
          yearid: year.id,
          value: dateInfo.month
        }
      })
      month = month.data.CreateMonth
    } else {
      // find month
      month = months.find(x => x.value === dateInfo.month)
    }
    const monthDate = await client.mutate({
      mutation: CREATE_DATE_MONTH,
      variables: {
        dateid: dateInfo.dateid,
        monthid: month.id
      },
      refetchQueries: ['textDating']
    })
    if (monthDate.error) {
      console.log("monthDate error: ", monthDate.error.messagev)
    }

    if (dateInfo.day !== undefined) {
      const days = month && month.days ? month.days : undefined
      if (days === undefined || !days.find(x => x.value === dateInfo.day)) {
        day = await client.mutate({
          mutation: CREATE_DAY,
          variables: {
            id: createGUID(),
            monthid: month.id,
            value: dateInfo.day
          }
        })
        day = day.data.CreateDay
      } else {
        // find day
        day = days.find(x => x.value === dateInfo.day)
      }
      const dayDate = await client.mutate({
        mutation: ADD_DATE_DAY,
        variables: {
          dateid: dateInfo.dateid,
          dayid: day.id
        },
        refetchQueries: ['textDating']
      })
      if (dayDate.error) {
        console.log("dayDate error: ", dayDate.error.messagev)
      }
    }
  }

  // Close the big map by returning the date object
  return date
}

const deleteDate = async (datingid, dateValues, client) => {

  const { data, error } = await client.mutate({
    mutation: DELETE_DATE,
    variables: {
      dateid: dateValues.dateid,
    },
  })
  if (error) {
    console.log("Error in deletion of date: ", dateValues)
    console.log(error.message)
  }
  return (data.DeleteDate.id)
}

const DELETE_DATING = gql`
  mutation deleteDating(
    $datingid: ID!
  ) {
    DeleteDating(
      id:$datingid
    ) {id}
  }
`

const DELETE_DATES_FROM_DATING = gql`
  mutation deleteDatingFromDating($datingid: ID!) {
    DeleteRelatedDates(datingid: $datingid) {
      id
    }
  }
`

const DELETE_DATE = gql`
 mutation deleteDate(
   $dateid: ID!
 ) {
  DeleteDate(
    id:$dateid
  ) {id}
 }
`

class EditItemDating extends Component {
  state = {
    visibleForm: false,
    tabsPositions: {
      singleTabs: '1',
      startTabs: '1',
      endTabs: '1',
      datingRange: 'SINGLE'
    }
  };

  handleCancel = () => {
    this.setState({ visibleForm: false });
    this.formRef.props.form.resetFields();
  }

  cleanupValues = (values) => {
    ['single', 'start', 'end'].forEach(type => {
      console.log("cleaning ", type)
      const decade = values[type + 'Decade']
      const quarter = values[type + 'Quarter']
      if (decade && decade.length === 0) {
        console.log("cleaning ", decade)
        values.decade = undefined
      }
      if (quarter && quarter.length === 0) {
        values.quarter = undefined
      }
    })
    return values
  }

  handleCreateUpdate = async () => {
    const form = this.formRef.props.form;
    let values = form.getFieldsValue()
    console.log("createEdit values: ", values)
    let prop
    for (prop in values) {
      if (prop.includes('Decade') || prop.includes('Quarter')) {
        if (values[prop] !== undefined && values[prop].length === 0) {
          values[prop] = undefined
        }
      }
    }

    // Get text ID
    values.textid = this.props.textId

    // First, find dating and remove existing dates if it has any (meaning this is an update)
    let datingid = values.datingid ? values.datingid : undefined
    if (datingid) {
      console.log("Deleting dates on: ", datingid)
      const { error } = await this.props.client.mutate({
        mutation: DELETE_DATES_FROM_DATING,
        variables: { datingid: datingid }
      });
      if (error) {
        console.log("Error in deleting dates: ")
        console.log(error.message)
      }
      updateDating(values, this.props.client)
    }
    if (datingid === undefined) {
      datingid = createGUID()
      createDating(datingid, values, this.props.client)
    }

    // Create date details list of objects to create details from
    let dateDetails = []

    // DATA SORTING IN DIFFERENT BRANCHES ACCORDING TO INPUT DATA
    // Single year registration (including months and days)
    const typeDependent = (type) => {
      const certainty = values[type + 'Certainty']
      const decade = values[type + 'Decade']
      const quarter = values[type + 'Quarter']
      const century = () => {
        if (quarter || decade) {
          return quarter ? quarter[0] : decade[0]
        }
        if (values[type + 'Year']) {
          // E.g.: 1583 / 100 => 15.83; Math.trunc(15.83) => 15; 15 * 100 => 1500
          return Math.trunc(values[type + 'Year'] / 100) * 100
        }
      }
      return {
        approximate: certainty ? certainty.includes('approximate') : false,
        uncertain: certainty ? certainty.includes('uncertain') : false,
        century: century() ? century() : undefined,
        decade: decade ? decade[1] : undefined,
        quarter: quarter ? quarter[1] : undefined,
      }
    }

    if (values.datingType === 'SINGLE') {
      if (values.singleYear) {
        dateDetails.push({
          datetype: 'SINGLE',
          year: values.singleYear,
          month: values.singleMonthDate ? values.singleMonthDate[0] : undefined,
          day: values.singleMonthDate ? values.singleMonthDate[1] : undefined,
          ...typeDependent('single'),
        })
      }

      // Single decade
      if (values.singleDecade) {
        dateDetails.push(
          {
            datetype: 'START',
            year: values.singleDecade[1],
            ...typeDependent('single'),
          },
          {
            datetype: 'END',
            year: values.singleDecade[1] + 9,
            ...typeDependent('single'),
          }
        )
      }

      // Single quarter
      if (values.singleQuarter) {
        dateDetails.push(
          {
            datetype: 'START',
            year: values.singleQuarter[1],
            ...typeDependent('single'),
          },
          {
            datetype: 'END',
            year: values.singleQuarter[1] + 24,
            ...typeDependent('single'),
          }
        )
      }
    } else {
      if (values.startYear || values.startDecade || values.startQuarter) {
        let datingData = {}
        if (values.startYear !== undefined) {
          datingData = {
            year: values.startYear,
            month: values.startMonthDate ? values.startMonthDate[0] : undefined,
            day: values.startMonthDate ? values.startMonthDate[1] : undefined
          }
        } else if (values.startDecade !== undefined) {
          datingData = { year: values.startDecade[1] }
        } else {
          datingData = { year: values.startQuarter[1] }
        }
        dateDetails.push(
          {
            ...datingData,
            datetype: 'START',
            ...typeDependent('start'),
          }
        )
      }

      if (values.endYear || values.endDecade || values.endQuarter) {
        let datingData = {}
        if (values.endYear !== undefined) {
          datingData = {
            year: values.endYear,
            month: values.endMonthDate ? values.endMonthDate[0] : undefined,
            day: values.endMonthDate ? values.endMonthDate[1] : undefined
          }
        } else if (values.endDecade !== undefined) {
          datingData = { year: values.endDecade[1] }
        } else {
          datingData = { year: values.endQuarter[1] }
        }
        dateDetails.push({
          ...datingData,
          datetype: 'END',
          ...typeDependent('end'),
        })
      }
    }

    // Handle each date details item
    dateDetails.forEach(date => {
      createDate(datingid, date, this.props.client)
    })

    form.resetFields();
    this.setState()
    this.setState({ visibleForm: false });

  }

  handleDelete = async (datingsObj) => {
    const datingId = datingsObj.id
    const dates = datingsObj.dates
    dates.map(async d => {
      const { error } = await this.props.client.mutate({
        mutation: DELETE_DATE,
        variables: { dateid: d.id }
      });
      if (error) {
        console.log("Error in deleting Date: " + d.id)
        console.log(error.message)
      }
    })
    const { error } = await this.props.client.mutate({
      mutation: DELETE_DATING,
      variables: { datingid: datingId },
      refetchQueries: ['textDating'],
      // optimisticResponse: {}
    });
    if (error) {
      message.error(error.message)
    }
  }

  normDateType = (type) => {
    const normalization = {
      START: 'Start',
      END: 'End',
      SINGLE: 'Single',
    }
    return normalization[type]
  }

  saveFormRef = (formRef) => {
    this.formRef = formRef;
  }

  showModal = () => {
    this.setState({
      visibleForm: true,
    });
  }

  updateModal = (values, tabsPositions) => {
    const form = this.formRef.props.form;
    form.setFieldsValue(values)
    this.formRef.setState({ tabsPositions })
    this.showModal()
  }

  render() {
    return (
      <Query query={DATING_QUERY} variables={{ id: this.props.textId }}>
        {({ loading, error, data, client }) => {

          if (loading) return <div>Fetching...</div>
          if (error) return <div>{error.message}</div>

          return (
            <div>
              <List
                itemLayout="vertical"
                dataSource={data.Text[0].datings}
                renderItem={item => {
                  const monthName = (month) => (moment().month(month).format('MMMM'))
                  const dayName = (day) => (moment().date(day).format('Do'))
                  const formatYears = () => (
                    item.dates.map(date => {
                      const month = date.month ? date.month.value : undefined
                      const day = date.day ? date.day.value : undefined
                      let datePrefix = []
                      datePrefix += item.dates.length === 1 && date.type === 'END' ? 'before ' : ''
                      datePrefix += item.dates.length === 1 && date.type === 'START' ? 'after ' : ''
                      datePrefix += date.approximate ? 'around ' : ''
                      const dateSuffix = date.uncertain ? '?' : ''

                      let dateFormatter = []
                      if (month !== undefined) {
                        dateFormatter.push(monthName(month))
                      }
                      if (day !== undefined) {
                        dateFormatter.push(dayName(day))
                      }
                      dateFormatter.push(date.year.value)

                      return {
                        formatted: datePrefix + dateFormatter.join(' ') + dateSuffix,
                        type: date.type
                      }
                    })
                  )
                  const joinDates = (dates) => {
                    if (dates.length === 1) {
                      return dates[0].formatted
                    } else {
                      const start = dates.find(x => x.type === 'START')
                      const end = dates.find(x => x.type === 'END')
                      if (start && end) {
                        return [start.formatted, end.formatted].join(' to ')
                      } else {
                        console.log("Problem: ", start, end)
                        return 'Problem rendering the dating.'
                      }
                    }
                  }
                  return (
                    <List.Item
                      key={item.id}
                      actions={[
                        <a onClick={() => {
                          const shared = {
                            datingid: item.id,
                            source: item.source,
                            note: item.note,
                            datingType: item.type,
                          }

                          const buildDateInfo = (date, typename) => {
                            const certainty = []
                            if (date.approximate) {
                              certainty.push('approximate')
                            }
                            if (date.uncertain) {
                              certainty.push('uncertain')
                            }
                            const monthDate = (date) => {
                              const monthDate = []
                              if (date.month) {
                                monthDate.push(date.month.value)
                              }
                              if (date.day) {
                                monthDate.push(date.day.value)
                              }
                              return monthDate.length > 0 ? monthDate : undefined
                            }
                            const dateInfo = {}
                            if (date.decade || date.quarter) {
                              dateInfo[typename + 'Decade'] = date.century && date.decade ? [date.century, date.decade] : undefined
                              dateInfo[typename + 'Quarter'] = date.century && date.quarter ? [date.century, date.quarter] : undefined
                            } else {
                              dateInfo[typename + 'Year'] = date.year.value
                              dateInfo[typename + 'MonthDate'] = monthDate(date)
                            }
                            dateInfo[typename + 'dateid'] = date.id
                            dateInfo[typename + 'Certainty'] = certainty
                            console.log("dateinfo: ", dateInfo)
                            return (dateInfo)
                          }
                          let datingInfo = {}
                          const start = item.dates.find(x => x.type === 'START')
                          const end = item.dates.find(x => x.type === 'END')
                          const single = item.dates.find(x => x.type === 'SINGLE')
                          datingInfo = {
                            ...shared,
                            ...start ? buildDateInfo(start, 'start') : undefined,
                            ...end ? buildDateInfo(end, 'end') : undefined,
                            ...single ? buildDateInfo(single, 'single') : undefined,

                          }
                          console.log("dateinfe: ", datingInfo)
                          const positions = {
                            datingRange: datingInfo.datingType
                          }
                          const names = ['single', 'start', 'end']
                          names.forEach(typename => {
                            const placeholder = typename === 'single' ? 'start' : typename
                            if (datingInfo[placeholder + 'Quarter']) {
                              positions[typename + 'Tabs'] = '3'
                            } else if (datingInfo[placeholder + 'Decade']) {
                              positions[typename + 'Tabs'] = '2'
                            } else {
                              positions[typename + 'Tabs'] = '1'
                            }
                          })

                          console.log("positions: ", positions)
                          datingInfo = {
                            ...datingInfo,
                          }
                          console.log("datingInfo: ", datingInfo)
                          this.updateModal(
                            datingInfo, positions
                          )
                        }
                        }>Edit</a>,
                        <a onClick={() => this.handleDelete(item)}>Delete</a>
                      ]}
                    >
                      <List.Item.Meta
                        title={joinDates(formatYears())}
                      />
                      {console.log(item)}
                    </List.Item>
                  )
                }}
              />
              <div style={{ margin: '10px 0 0 0' }}>
                <CreateUpdateDating
                  client={this.props.client}
                  wrappedComponentRef={this.saveFormRef}
                  visible={this.state.visibleForm}
                  onCancel={this.handleCancel}
                  onCreate={this.handleCreateUpdate}
                  tabsPositions={this.state.tabsPositions}
                />
                <Button type="primary" onClick={this.showModal}>New dating</Button>
              </div>
            </div>
          );
        }}
      </Query>
    )
  }
}

export default EditItemDating