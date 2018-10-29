import React, { Component } from "react";
import { Mutation, Query } from "react-apollo";
import gql from "graphql-tag";
import { withRouter } from "react-router";
import { Formik } from 'formik';
import { Form, Input, Button } from 'antd';
import FormItem from "antd/lib/form/FormItem";

const { TextArea } = Input

const UPDATE_ITEM_QUERY = gql`
  mutation UpdateText(
      $text_id: ID!, 
      $title: String!,
      $title_addon: String,
      $note: String,
      $date: String,
      $modified: String,
    ){
    UpdateText(
        text_id: $text_id, 
        title: $title,
        title_addon: $title_addon,
        note: $note,
        date: $date,
        modified: $modified
      ) {
      title
      title_addon
      text_id
      note
      date
      modified
    }
  }
`

const GET_ITEM_QUERY = gql`
  query Text($id: String!) {
    textById(id: $id) {
      text_id
      title
      title_addon
      created
      modified
      date
      note
      authors {
        name
      }
      type {
        name
      }
    }
  }
`

class TextItem extends Component {

  render() {
    return (
      <Query query={GET_ITEM_QUERY} variables={{ id: this.props.match.params.id }}>
        {({ loading, error, data }) => {

          if (loading) return <div>Fetching</div>
          if (error) return <div>Error: {this.props.data.error.message}</div>

          const item = data.textById

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
                      <FormItem label="Title">
                        <Input placeholder="Title" name="title" onChange={handleChange} value={values.title} />
                      </FormItem>
                      <FormItem label="Title suffix">
                        <Input placeholder="Title suffix" name="title_addon" onChange={handleChange} value={values.title_addon} />
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
      </Query >
    );
  }
}

export default withRouter(TextItem)
