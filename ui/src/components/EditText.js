import React, { Component } from "react";
import { Mutation, Query } from "react-apollo";
import gql from "graphql-tag";
import { withRouter } from "react-router";
import { Formik } from 'formik';
import { Form, Input, Button } from 'antd';
import FormItem from "antd/lib/form/FormItem";
import TypeSelector from './TypeSelector'
import EditItemAuthors from './EditItemAuthors'

const { TextArea } = Input

const UPDATE_ITEM_QUERY = gql`
  mutation UpdateText(
      $id: ID!, 
      $title: String!,
      $title_addon: String,
      $note: String,
      $date: String,
      $modified: DateTime,
    ){
    UpdateText(
        id: $id, 
        title: $title,
        title_addon: $title_addon,
        note: $note,
        date: $date,
        modified: $modified
      ) {
      title
      title_addon
      id
      note
      date
      modified
    }
  }
`

const GET_ITEM_QUERY = gql`
  query Text($id: String!) {
    textById(id: $id) {
      id
      title
      title_addon
      created
      modified
      date
      note
    }
  }
`

class EditText extends Component {

  render() {

    return (
      <Query query={GET_ITEM_QUERY} variables={{ id: this.props.match.params.id }} >
        {({ loading, error, data, client }) => {

          if (loading) return <div>Fetching</div>
          if (error) return <div>{error.message}</div>

          const item = data.textById ? data.textById : null
          if (!item) {
            return <div>Error: The item does not exist.</div>
          }

          return (
            <Mutation mutation={UPDATE_ITEM_QUERY}>
              {(updateText) => (
                <Formik
                  initialValues={item}
                  onSubmit={values => {
                    values.modified = new Date()
                    updateText({ variables: values })
                  }}
                >
                  {({ values, handleSubmit, handleChange, isSubmitting }) => (
                    <Form onSubmit={handleSubmit} className="edit-form">
                      <h1>Update text</h1>
                      <h2>Authorship</h2>
                      <EditItemAuthors client={client} textId={values.id} />
                      <h2>Text data</h2>
                      <FormItem label="Title">
                        <Input placeholder="Title" name="title" onChange={handleChange} value={values.title} />
                      </FormItem>
                      <FormItem label="Title suffix">
                        <Input placeholder="Title suffix" name="title_addon" onChange={handleChange} value={values.title_addon} />
                      </FormItem>
                      <FormItem label="Text types">
                        <TypeSelector client={client} textId={item.id} />
                      </FormItem>
                      <FormItem label="Dating">
                        <Input placeholder="Dating" name="date" onChange={handleChange} value={values.date} />
                      </FormItem>
                      <FormItem label="Note">
                        <TextArea row={4}
                          placeholder="Note" name="note"
                          onChange={handleChange} value={values.note}
                        />
                      </FormItem>
                      <Button type="primary" htmlType="submit" className="edit-form-button">
                        Submit
                      </Button>
                    </Form>
                  )}
                </Formik>
              )}
            </Mutation>
          )
        }}
      </Query>
    );
  }
}

export default withRouter(EditText);