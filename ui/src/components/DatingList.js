import React, { Component } from "react";
import gql from "graphql-tag";
import { createGUID, formatDates } from './utils';
import { List, Button, Divider, message } from 'antd';
import { CreateUpdateDating } from './CreateUpdateDating';
import { DELETE_DATING, DELETE_DATE, DELETE_DATES_FROM_DATING } from './GQL/Mutations';
import { DATING } from './GQL/Queries';

const CREATE_DATING = gql`
  mutation createDating(
    $eventid: ID!
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
    AddDatingEvent(
      datingid:$datingid
      eventid:$eventid
    ) {id}
  }
`

const createDating = async ({ variables, client }) => {
  const { error, data } = await client.mutate({
    mutation: CREATE_DATING,
    variables: variables,
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

const updateDating = async ({ variables, client }) => {
  const { error, data } = await client.mutate({
    mutation: UPDATE_DATING,
    variables: variables,
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
      value
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

const deleteDate = async ({ variables, client }) => {
  await client.mutate({
    mutation: DELETE_DATE,
    variables: { ...variables }
  })
}

const deleteDating = async ({ variables, client }) => {
  await client.mutate({
    mutation: DELETE_DATING,
    variables: { ...variables },
  })
}

const saveDate = async ({ variables, client }) => {
  await client.mutate({
    mutation: CREATE_DATE,
    variables,
  })
}

const saveMonth = async ({ variables, client }) => {
  await client.mutate({
    mutation: CREATE_MONTH,
    variables,
  })
}

const saveMonthDate = async ({ variables, client }) => {
  const monthDate = await client.mutate({
    mutation: CREATE_DATE_MONTH,
    variables,
  })
  if (monthDate.error) {
    console.warn("monthDate error: ", monthDate.error.messagev)
  }
}

const saveDay = async ({ variables, client }) => {
  await client.mutate({
    mutation: CREATE_DAY,
    variables,
  })
}

const saveDayDate = async ({ variables, client }) => {
  const dayDate = await client.mutate({
    mutation: ADD_DATE_DAY,
    variables
  })
  if (dayDate.error) {
    console.warn("dayDate error: ", dayDate.error.messagev)
  }
}

const removeDatingDates = async ({ variables, client }) => {
  await client.mutate({
    mutation: DELETE_DATES_FROM_DATING,
    variables,
  })
}

class DatingList extends Component {
  state = {
    visibleForm: false,
    tabsPositions: {
      startTabs: '1',
      endTabs: '1',
      datingRange: 'SINGLE'
    },
  };


  handleCancel = () => {
    this.setState({ visibleForm: false });
    this.formRef.props.form.resetFields();
  }

  cleanupValues = (values) => {
    ['single', 'start', 'end'].forEach(type => {
      const decade = values[type + 'Decade']
      const quarter = values[type + 'Quarter']
      if (decade && decade.length === 0) {
        values.decade = undefined
      }
      if (quarter && quarter.length === 0) {
        values.quarter = undefined
      }
    })
    return values
  }

  registerDate = async (datingid, dateInfo, client) => {

    const yearQuery = await client.query({
      query: GET_YEAR,
      variables: { value: dateInfo.year }
    })
    const year = await yearQuery.data.Year[0]

    let updaters = []

    // Create date and add year
    const date = {
      id: dateInfo.dateid || createGUID(),
      datingid: datingid,
      type: dateInfo.datetype,
      approximate: dateInfo.approximate,
      uncertain: dateInfo.uncertain,
      century: dateInfo.century,
      quarter: dateInfo.quarter,
      decade: dateInfo.decade,
      year: {
        id: year.id,
        value: year.value
      }
    }
    // register saveDate
    updaters.push({
      id: datingid,
      func: saveDate,
      variables: {
        variables: {
          ...date,
          dateid: date.id,
          yearid: date.year.id
        },
        client: this.props.client
      },
      strategy: 'accumulate'
    })

    // Month and day creation and registration if applicable.
    if (dateInfo.month !== undefined) {
      let month
      let day
      const months = year.months
      if (months === undefined || !months.find(x => x.value === dateInfo.month)) {
        month = {
          id: createGUID(),
          yearid: year.id,
          value: dateInfo.month
        }
        // REGISTER saveMonth
        updaters.push({
          id: datingid,
          func: saveMonth,
          variables: {
            variables: month,
            client: this.props.client
          },
          strategy: 'accumulate'
        })
      } else {
        // find month
        month = months.find(x => x.value === dateInfo.month)
      }
      // REGISTER saveMonthDate
      updaters.push({
        id: datingid,
        func: saveMonthDate,
        variables: {
          variables: {
            dateid: date.id,
            monthid: month.id
          },
          client: this.props.client
        },
        strategy: 'accumulate'
      })
      // Add the month to the date
      date.month = month

      if (dateInfo.day !== undefined) {
        const days = month && month.days ? month.days : undefined
        if (days === undefined || !days.find(x => x.value === dateInfo.day)) {
          day = {
            id: createGUID(),
            monthid: month.id,
            value: dateInfo.day
          }
          // REGISTER saveDay
          updaters.push({
            id: datingid,
            func: saveDay,
            variables: {
              variables: day,
              client: this.props.client
            },
            strategy: 'accumulate'
          })
        } else {
          // find day
          day = days.find(x => x.value === dateInfo.day)
        }

        // REGISTER saveDayDate
        updaters.push({
          id: datingid,
          func: saveDayDate,
          variables: {
            variables: {
              dateid: date.id,
              dayid: day.id
            },
            client: this.props.client
          },
          strategy: 'accumulate'
        })
        // Add the day to the date
        date.day = day
      }
    }
    // Close the big map by returning the date object
    return { data: date, updaters }
  }

  createDateDetails = (values) => {
    // This handles data sorting in different groups according to input date

    let dateDetails = []
    // Data builder based on date type
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

    // Single date type
    if (values.datingType === 'SINGLE') {
      dateDetails.push({
        datetype: 'SINGLE',
        year: values.singleYear,
        month: values.singleMonthDate ? values.singleMonthDate[0] : undefined,
        day: values.singleMonthDate ? values.singleMonthDate[1] : undefined,
        ...typeDependent('single'),
      })
    } else {
      // Range date with start data
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
      // Range date with end data
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
    return dateDetails
  }

  datingExists = async (datingid) => {
    const { data } = await this.props.client.query({
      query: DATING,
      variables: { id: datingid }
    })
    return data.Dating.length > 0
  }

  handleCreateUpdate = async () => {
    const form = this.formRef.props.form;
    let values = form.getFieldsValue()
    let prop
    for (prop in values) {
      if (prop.includes('Decade') || prop.includes('Quarter')) {
        if (values[prop] !== undefined && values[prop].length === 0) {
          values[prop] = undefined
        }
      }
    }

    // Deep copy of the parent event for editing
    const event = JSON.parse(JSON.stringify(this.props.event))

    // Create or update dating data
    const newDating = {
      id: values.datingid || createGUID(),
      source: values.source,
      note: values.note,
      type: values.datingType,
    }

    // Create updater registry
    let updaters = []

    // Determine the operation type
    let operation = ''
    if (await this.datingExists(newDating.id)) {
      operation = 'update'
    } else {
      operation = 'add'
    }


    if (operation === 'update') {
      // This is commited to DB, so remove all Date records
      updaters.push({
        id: event.id,
        func: removeDatingDates,
        variables: {
          variables: { datingid: values.datingid },
          client: this.props.client
        },
      })
    }

    updaters.push({
      id: newDating.id,
      func: operation === 'update' ? updateDating : createDating,
      variables: {
        variables: {
          datingid: newDating.id,
          eventid: event.id,
          datingtype: newDating.type,
          note: newDating.note,
          source: newDating.source
        },
        client: this.props.client
      },
    })

    // Create date details and updaters
    let dateDetails = this.createDateDetails(values)
    const newDates = await Promise.all(dateDetails.map(async date => {
      const { data, updaters } = await this.registerDate(newDating.id, date, this.props.client)
      return ({ date: data, updaters })
    }))
    newDating.dates = newDates.map(date => date.date)
    updaters.push(...newDates.reduce((acc, item) => [...acc, ...item.updaters], []))

    // Update or add the complete dating data to the event
    event.datings = event.datings || []
    const datingIndex = event.datings.findIndex(x => x.id === newDating.id)
    if (datingIndex > -1) {
      event.datings.splice(datingIndex, 1, newDating)
    } else {
      event.datings.push(newDating)
    }

    // Push up the updates up into the event in parent state
    this.props.handleDatingUpdate({
      id: newDating.id,
      event,
      updaters,
      operation
    })

    form.resetFields();
    this.setState({ visibleForm: false });

  }

  handleDelete = async (dating) => {
    const event = JSON.parse(JSON.stringify(this.props.event))
    const dates = dating.dates
    let updaters = []
    if (await this.datingExists(dating.id)) {
      updaters.push(...dates.map(d => ({
        id: dating.id,
        func: deleteDate,
        variables: {
          variables: {
            dateid: d.id,
          },
          client: this.props.client
        },
        strategy: 'accumulate'
      })))
      updaters.push({
        id: dating.id,
        func: deleteDating,
        variables: {
          variables: {
            datingid: dating.id,
          },
          client: this.props.client
        },
        strategy: 'accumulate'
      })
    }

    this.props.handleDatingUpdate({
      id: dating.id,
      event: {
        ...event,
        datings: event.datings.filter(d => d.id !== dating.id)
      },
      operation: 'remove',
      updaters,
    })
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

  updateModal = (dating) => {
    const shared = {
      datingid: dating.id,
      source: dating.source,
      note: dating.note,
      datingType: dating.type,
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
      return (dateInfo)
    }
    let datingInfo = {}
    const start = dating.dates.find(x => x.type === 'START')
    const end = dating.dates.find(x => x.type === 'END')
    const single = dating.dates.find(x => x.type === 'SINGLE')
    datingInfo = {
      ...shared,
      ...start ? buildDateInfo(start, 'start') : undefined,
      ...end ? buildDateInfo(end, 'end') : undefined,
      ...single ? buildDateInfo(single, 'single') : undefined,

    }
    const tabsPositions = {
      datingRange: datingInfo.datingType
    }
    const names = ['start', 'end']
    names.forEach(typename => {
      if (datingInfo[typename + 'Quarter']) {
        tabsPositions[typename + 'Tabs'] = '3'
      } else if (datingInfo[typename + 'Decade']) {
        tabsPositions[typename + 'Tabs'] = '2'
      } else {
        tabsPositions[typename + 'Tabs'] = '1'
      }
    })

    // Now, we can set the field values, the form state and show the modal
    const form = this.formRef.props.form;
    form.setFieldsValue(datingInfo)
    this.formRef.setState({ tabsPositions })
    this.showModal()
  }

  render() {

    const { editable, datings } = this.props;

    return (
      <div>
        <h4>
          Datings
          {
            editable &&
            <Button onClick={this.showModal} shape="circle" size="small" icon="plus" style={{ marginLeft: '1ex' }} />
          }
        </h4>
        <List
          itemLayout="vertical"
          dataSource={datings}
          renderItem={dating => (
            <List.Item key={dating.id}>
              <List.Item.Meta
                title={formatDates(dating.dates)}
              />
              <div>
                {dating.note && <p>Note: {dating.note}</p>}
                {dating.source && <p>Source: {dating.source}</p>}
                {editable &&
                  <span>
                    <a onClick={() => this.updateModal(dating)}>Edit</a>
                    <Divider type="vertical" />
                    <a onClick={() => this.handleDelete(dating)}>Delete</a>
                  </span>
                }

              </div>
            </List.Item>
          )}
        />
        {editable &&
          <div style={{ margin: '10px 0 0 0' }}>
            <CreateUpdateDating
              client={this.props.client}
              wrappedComponentRef={this.saveFormRef}
              visible={this.state.visibleForm}
              onCancel={this.handleCancel}
              onCreate={this.handleCreateUpdate}
              tabsPositions={this.state.tabsPositions}
            />
          </div>
        }

      </div>

    )
  }
}

export default DatingList;
