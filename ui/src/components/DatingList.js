import React, { Component } from "react";
import gql from "graphql-tag";
import { createGUID, formatDates } from './utils';
import { List, Button, message } from 'antd';
import { CreateUpdateDating } from './CreateUpdateDating';

const getEventId = (item, type) => {
  if (item.events && item.events.length > 0) {
    const event = item.events.find(d => d.type === type)
    const id = (event && event.id) || undefined
    if (id === undefined) {
      console.warn(`The item events did non contain a ${type} event.`)
    }
    return id
  } else {
    return undefined
  }
}

const getEvent = (item, type) => item.events.find(d => d.type === type) || undefined

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

const createDate = async (datingid, dateInfo, client, refetchQueries) => {

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
    refetchQueries: refetchQueries,
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
        },
        refetchQueries: refetchQueries,
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
      refetchQueries: refetchQueries,
    })
    if (monthDate.error) {
      console.warn("monthDate error: ", monthDate.error.messagev)
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
          },
          refetchQueries: refetchQueries,
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
        refetchQueries: refetchQueries,
      })
      if (dayDate.error) {
        console.warn("dayDate error: ", dayDate.error.messagev)
      }
    }
  }

  // Close the big map by returning the date object
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

class DatingList extends Component {
  state = {
    visibleForm: false,
    tabsPositions: {
      startTabs: '1',
      endTabs: '1',
      datingRange: 'SINGLE'
    },
    visibleDetails: [],
  };

  createItemEvent = this.props.createItemEvent
  removeItemEvent = this.props.removeItemEvent

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

    // Get event ID
    values.eventid = getEventId(this.props.item, this.props.type)
    if (values.eventid === undefined) {
      values.eventid = await this.createItemEvent(this.props.type)
    }

    // First, find dating and remove existing dates if it has any (meaning this is an update)
    let datingid = values.datingid || undefined
    if (datingid) {
      const { error } = await this.props.client.mutate({
        mutation: DELETE_DATES_FROM_DATING,
        variables: { datingid: datingid }
      });
      if (error) {
        console.warn("Error in deleting dates: ")
        console.warn(error.message)
      }
      updateDating(values, this.props.client)
    } else {
      // Create a new dating
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
      dateDetails.push({
        datetype: 'SINGLE',
        year: values.singleYear,
        month: values.singleMonthDate ? values.singleMonthDate[0] : undefined,
        day: values.singleMonthDate ? values.singleMonthDate[1] : undefined,
        ...typeDependent('single'),
      })
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
      createDate(datingid, date, this.props.client, this.props.refetchQueries)
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
        console.warn("Error in deleting Date: " + d.id)
        console.warn(error.message)
      }
    })
    const { error } = await this.props.client.mutate({
      mutation: DELETE_DATING,
      variables: { datingid: datingId },
      refetchQueries: this.props.refetchQueries,
    });
    if (error) {
      message.error(error.message)
    }
    const event = getEvent(this.props.item, this.props.type)
    if (event && event.datings.length === 1) {
      // This is the last dating on the event, so we remove it.
      this.removeItemEvent(event.id)
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

  displayDetails = (id, e) => {
    const contentList = this.state.visibleDetails
    const idx = contentList.indexOf(id)
    if (idx === -1) {
      contentList.push(id)
    } else {
      contentList.splice(idx)
    }
    this.setState(contentList)
  }

  displayingDetails = (id) => this.state.visibleDetails.includes(id)

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

    const { datings } = this.props;

    return (


      <div>
        <List
          itemLayout="vertical"
          dataSource={datings}
          renderItem={dating => (
            <List.Item
              key={dating.id}
              actions={[
                <a onClick={(e) => this.displayDetails(dating.id, e)}>
                  {this.displayingDetails(dating.id) ? 'Less' : 'More'}
                </a>,
                <a onClick={() => this.updateModal(dating)}>Edit</a>,
                <a onClick={() => this.handleDelete(dating)}>Delete</a>
              ]}
            >
              <List.Item.Meta
                title={formatDates(dating.dates)}
              />
              <div
                style={{ display: this.displayingDetails(dating.id) ? 'block' : 'none' }}
              >
                {dating.note && <p>Note: {dating.note}</p>}
                {dating.source && <p>Source: {dating.source}</p>}
              </div>
            </List.Item>
          )}
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

    )
  }
}

export default DatingList;
