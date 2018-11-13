import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { createGUID } from './utils'
import { List, Button, message } from 'antd';
import { CreateUpdateDating } from './CreateUpdateDating';

const DATING_QUERY = gql`
  query textDating($id: ID!) {
    Text(id: $id) {
      id
      datings {
        id
        dates {
          id
          type
          year {
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
    // optimisticResponse: {}
  });
  console.log("After mutation: ", data)
  if (error) {
    message.error(error.message)
  }
  return data.CreateDating.id
}

const CREATE_DATE = gql`
  mutation createDate(
    $id: ID!
    $datingid: ID!
    $yearid: ID!
    $type: DateType!
  ) {
    CreateDate(
      id: $id
      type: $type
    ) {id}
    AddDatingDates(
      datingid: $datingid
      dateid: $id
    ) {id}
    AddDateYear(
      dateid: $id
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
        id: dateInfo.dateid,
        datingid: datingid,
        yearid: year.id,
        type: dateInfo.datetype,
      }
    })

    // Month and day creation and registration if applicable.
    if (dateInfo.month !== undefined) {
      let month
      let day
      const months = year.months
      if (months === undefined || !months.find(x => x.value === dateInfo.month)) {
        console.log("Creating month.")
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
        console.log("Finding monthg")
        month = months.find(x => x.value === dateInfo.month)
      }
      console.log("Month: ", month)
      const monthDate = await client.mutate({
        mutation: ADD_DATE_MONTH,
        variables: {
          dateid: dateInfo.dateid,
          monthid: month.id
        }
      })
      if (monthDate.error) {
        console.log("monthDate error: ", monthDate.error.messagev)
      } else {
        console.log("monthDate: ", monthDate)
      }

      if (dateInfo.day !== undefined) {
        const days = month && month.days ? month.days : undefined
        if (days === undefined || !days.find(x => x.value === dateInfo.day)) {
          console.log("Creating day")
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
          console.log("Finding day")
          day = days.find(x => x.value === dateInfo.day)
        }
        console.log("Day: ", day)
        const dayDate = await client.mutate({
          mutation: ADD_DATE_DAY,
          variables: {
            dateid: dateInfo.dateid,
            dayid: day.id
          }
        })
        if (dayDate.error) {
          console.log("dayDate error: ", dayDate.error.messagev)
        } else {
          console.log("dayDate: ", dayDate)
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
    console.log(values)

    // First, create a dating
    const datingid = createGUID()
    createDating(datingid, values, this.props.client)

    // A range or a single item?
    if (values.singleYear || values.singleMonthDate) {
      const dateDetails = [{
        datetype: 'SINGLE',
        dateid: createGUID(),
        year: values.singleYear,
        month: values.singleMonthDate ? values.singleMonthDate[0] : undefined,
        day: values.singleMonthDate ? values.singleMonthDate[1] : undefined
      }]
      const dates = createDates(datingid, dateDetails, this.props.client)
      console.log(dates)
    } else {
      // Single segment or range?
      if (values.singleDecade || values.singleQuarter) {

      } else {

      }
    }


    form.resetFields();
    this.setState()
    this.setState({ visibleForm: false });

  }

  handleDelete = async (datingsObj) => {
    console.log(datingsObj)
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
                renderItem={item => (
                  <List.Item
                    key={item.id}
                    actions={[
                      <a onClick={() => { }}>Edit</a>,
                      <a onClick={() => this.handleDelete(item)}>Delete</a>
                    ]}
                  >
                    <List.Item.Meta
                      title={item.id}
                    />
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