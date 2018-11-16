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

const UPDATE_DATE = gql`
  mutation updateDate(
    $dateid: ID!
    $approximate: Boolean!
    $uncertain: Boolean!
    $century: Int
    $quarter: Int
    $decade: Int
    $type: DateType!
  ) {
    UpdateDate(
      id: $dateid
      type: $type
      approximate: $approximate
      uncertain: $uncertain
      century: $century
      decade: $decade
      quarter: $quarter
    ) {id}
  }
`

const UPDATE_DATE_YEAR = gql`
  mutation updateDateYear(
    $dateid: ID!
    $newyearid: ID!
    $oldyearid: ID!
  ) {
    AddDateYear(
      dateid: $dateid
      yearid: $newyearid
    ) {id}
    RemoveDateYear(
      dateid: $dateid
      yearid: $oldyearid
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

const REMOVE_DATE_MONTH = gql`
  mutation RemoveDateMonth(
    $dateid: ID!
    $monthid: ID!
  ) {
    RemoveDateMonth(
      dateid: $dateid
      monthid: $monthid
    ) {id}
  }
`

const REMOVE_DATE_DAY = gql`
  mutation RemoveDateDay(
    $dateid: ID!
    $dayid: ID!
  ) {
    RemoveDateDay(
      dateid: $dateid
      dayid: $dayid
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

const GET_YEAR_MONTH_DATE = gql`
  query getYearMonthDate($dateid: ID!) {
    Date(id: $dateid) {
      id
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
`

const createDate = async (datingid, dateInfo, client) => {

  dateInfo.dateid = createGUID()

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

const updateDate = async (datingid, dateValues, client) => {

  const { data } = await client.query({
    query: GET_YEAR_MONTH_DATE,
    variables: { dateid: dateValues.dateid }
  })
  const oldYearMonthDay = data.Date[0]
  console.log("Old Year month day: ", oldYearMonthDay)
  console.log("Date data: ", dateValues)

  const yearQuery = await client.query({
    query: GET_YEAR,
    variables: { value: dateValues.year }
  })
  const newYear = yearQuery.data.Year[0]

  // Update date
  const date = await client.mutate({
    mutation: UPDATE_DATE,
    variables: {
      ...dateValues,
      datingid: datingid,
      type: dateValues.datetype,
      decade: dateValues.decade,
      quarter: dateValues.quarter,
    },
    refetchQueries: ['textDating']
  })

  // Should we change the year reference?
  if (dateValues.year !== oldYearMonthDay.year.value) {
    const updateYear = await client.mutate({
      mutation: UPDATE_DATE_YEAR,
      variables: {
        dateid: dateValues.dateid,
        newyearid: newYear.id,
        oldyearid: oldYearMonthDay.year.id
      },
      refetchQueries: ['textDating']
    })
  }

  let month
  // Month: is the value set in the update?
  if (dateValues.month !== undefined) {
    // Does the old record have a month? If so and it's different, we remove the old
    if (oldYearMonthDay.month && dateValues.month !== oldYearMonthDay.month.value) {
      console.log("remove old month relation")
      client.mutate({
        mutation: REMOVE_DATE_MONTH,
        variables: {
          dateid: dateValues.dateid,
          monthid: oldYearMonthDay.month.id
        }
      })
    }
    // Then we create or attach the new

    const months = newYear.months
    if (months === undefined || !months.find(x => x.value === dateValues.month)) {
      // TODO: Generalize this duplicate mutation to a function outside this scope.
      console.log("creating new month")
      month = await client.mutate({
        mutation: CREATE_MONTH,
        variables: {
          id: createGUID(),
          yearid: newYear.id,
          value: dateValues.month
        }
      })
      month = month.data.CreateMonth
    } else {
      // find month
      console.log("finding month")
      month = months.find(x => x.value === dateValues.month)
      console.log("month found: ", month)
    }

    console.log("create date month relation")
    const monthDate = await client.mutate({
      mutation: CREATE_DATE_MONTH,
      variables: {
        dateid: dateValues.dateid,
        monthid: month.id,
      },
      refetchQueries: ['textDating']
    })
    if (monthDate.error) {
      console.log("monthDate error: ", monthDate.error.messagev)
    }
  }

  // Month, is it removed in the update?
  if (!dateValues.month && oldYearMonthDay.month) {
    console.log("remove old month relation")
    client.mutate({
      mutation: REMOVE_DATE_MONTH,
      variables: {
        dateid: dateValues.dateid,
        monthid: oldYearMonthDay.month.id
      },
      refetchQueries: ['textDating']
    })
  }

  // Expand the logic for day updating
  // Day: is the value set in the update?
  console.log("Create day logic")
  if (dateValues.day !== undefined) {
    console.log("Day values given")
    // Does the old record have a month? If so and it's different, we remove the old
    if (oldYearMonthDay.day && dateValues.day !== oldYearMonthDay.day.value) {
      console.log("remove old day relation")
      client.mutate({
        mutation: REMOVE_DATE_DAY,
        variables: {
          dateid: dateValues.dateid,
          monthid: oldYearMonthDay.day.id
        }
      })
    }
    // Then we create or attach the new
    let day
    const days = month && month.days ? month.days : undefined
    if (days === undefined || !days.find(x => x.value === dateValues.day)) {
      day = await client.mutate({
        mutation: CREATE_DAY,
        variables: {
          id: createGUID(),
          monthid: month.id,
          value: dateValues.day
        }
      })
      day = day.data.CreateDay
    } else {
      // find day
      day = days.find(x => x.value === dateValues.day)
    }
    const dayDate = await client.mutate({
      mutation: ADD_DATE_DAY,
      variables: {
        dateid: dateValues.dateid,
        dayid: day.id
      },
      refetchQueries: ['textDating']
    })
    if (dayDate.error) {
      console.log("dayDate error: ", dayDate.error.messagev)
    }
  }

  // Day, is it removed in the update?
  if (!dateValues.day && oldYearMonthDay.day) {
    console.log("remove old day relation")
    client.mutate({
      mutation: REMOVE_DATE_DAY,
      variables: {
        dateid: dateValues.dateid,
        dayid: oldYearMonthDay.month.id
      },
      refetchQueries: ['textDating']
    })
  }

  return date
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
  };

  handleCancel = () => {
    this.setState({ visibleForm: false });
    this.formRef.props.form.resetFields();
  }

  handleCreateUpdate = () => {
    const form = this.formRef.props.form;
    const values = form.getFieldsValue()
    console.log("createEdit values: ", values)

    // Get text ID
    values.textid = this.props.textId

    // First, create a dating
    let datingid = values.datingid ? values.datingid : undefined
    if (!datingid) {
      datingid = createGUID()
      createDating(datingid, values, this.props.client)
    } else {
      updateDating(values, this.props.client)
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
        dateid: values[type + 'dateid'] ? values[type + 'dateid'] : undefined,
        approximate: certainty ? certainty.includes('approximate') : false,
        uncertain: certainty ? certainty.includes('uncertain') : false,
        century: century() ? century() : undefined,
        decade: decade ? decade[1] : undefined,
        quarter: quarter ? quarter[1] : undefined,
      }
    }
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
          dateid: createGUID(),
          year: values.singleDecade[1],
          ...typeDependent('single'),
        },
        {
          datetype: 'END',
          dateid: createGUID(),
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
          dateid: createGUID(),
          year: values.singleQuarter[1],
          ...typeDependent('single'),
        },
        {
          datetype: 'END',
          dateid: createGUID(),
          year: values.singleQuarter[1] + 24,
          ...typeDependent('single'),
        }
      )
    }

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
          dateid: createGUID(),
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
        dateid: createGUID(),
        ...typeDependent('end'),
      })
    }

    // Handle each date details item
    const dates = dateDetails.forEach(date => {
      if (date.dateid) {
        console.log("Updating date: ", date)
        updateDate(datingid, date, this.props.client)
      } else {
        console.log("Creating date: ", date)
        createDate(datingid, date, this.props.client)
      }
    })

    this.props.client.query({
      query: DATING_QUERY,
      variables: { id: values.textid }
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

  updateModal = (values, tabsState) => {
    const form = this.formRef.props.form;
    form.setFieldsValue(values)
    this.formRef.setState(tabsState)

    // Update state of tabsPositions: 
    // date: '1', decade: '2', quarter: '3'
    // single: singleTabs
    // start: startTabs
    // end: endTabs
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
                            dateInfo[typename + 'dateid'] = date.id
                            dateInfo[typename + 'Year'] = date.year.value
                            dateInfo[typename + 'MonthDate'] = monthDate(date)
                            dateInfo[typename + 'Certainty'] = certainty
                            dateInfo[typename + 'Decade'] = date.century && date.decade ? [date.century, date.decade] : undefined
                            dateInfo[typename + 'Quarter'] = date.century && date.quarter ? [date.century, date.quarter] : undefined
                            return (dateInfo)
                          }
                          let datingInfo = {}
                          if (item.type === 'SINGLE') {
                            datingInfo = {
                              ...shared,
                              ...buildDateInfo(item.dates[0], 'single'),
                            }
                          } else {
                            const start = item.dates.find(x => x.type === 'START')
                            const end = item.dates.find(x => x.type === 'END')
                            datingInfo = {
                              ...shared,
                              ...start ? buildDateInfo(start, 'start') : undefined,
                              ...end ? buildDateInfo(end, 'end') : undefined
                            }
                          }
                          const positions = {
                            datingRange: datingInfo.datingType
                          }
                          const names = ['single', 'start', 'end']
                          names.forEach(typename => {
                            if (datingInfo[typename + 'Year']) {
                              positions[typename + 'Tabs'] = '1'
                            } else if (datingInfo[typename + 'Decade']) {
                              positions[typename + 'Tabs'] = '2'
                            } else if (datingInfo[typename + 'Decade']) {
                              positions[typename + 'Tabs'] = '3'
                            }
                          })
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