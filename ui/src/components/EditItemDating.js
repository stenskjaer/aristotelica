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
        dates {
          id
          type
          approximate
          uncertain
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
    $note: String
    $source: String
  ) {
    CreateDating(
      id:$datingid
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
    },
  });
  if (error) {
    message.error(error.message)
  }
  return data.CreateDating.id
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

const ADD_DATE_MONTH = gql`
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

const createDates = (datingid, dateDetails, client) => {

  // Handle each date details item
  const dates = dateDetails.map(async (dateInfo) => {

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
        mutation: ADD_DATE_MONTH,
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
  })

  return dates
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

    // Create and get some IDs
    if (values.datingid === undefined) {
      values.datingid = createGUID()
    }
    values.textid = this.props.textId

    // First, create a dating
    const datingid = createGUID()
    createDating(datingid, values, this.props.client)

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
    if (values.singleYear) {
      dateDetails.push({
        datetype: 'SINGLE',
        dateid: createGUID(),
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

    createDates(datingid, dateDetails, this.props.client)

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

  updateModal = (values) => {
    const form = this.formRef.props.form;
    form.setFieldsValue({})
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
                      return [start.formatted, end.formatted].join(' to ')
                    }
                  }
                  return (
                    <List.Item
                      key={item.id}
                      actions={[
                        <a onClick={() => { }}>Edit</a>,
                        <a onClick={() => this.handleDelete(item)}>Delete</a>
                      ]}
                    >
                      <List.Item.Meta
                        title={joinDates(formatYears())}
                      />
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