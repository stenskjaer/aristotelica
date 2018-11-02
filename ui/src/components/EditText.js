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
      $modified: DateTime,
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
        id
      }
    }
  }
`

const ADD_TYPE = gql`
  mutation AddTextType(
    $texttext_id: ID!,
    $texttypeid: ID!
  ){
    AddTextType(
      texttext_id: $texttext_id, 
      texttypeid: $texttypeid
    ) {
      title
      type {
        name
        id
      }
    }
  }
`

const REMOVE_TYPE = gql`
  mutation RemoveTextType(
    $texttext_id: ID!,
    $texttypeid: ID!
  ){
    RemoveTextType(
      texttext_id: $texttext_id, 
      texttypeid: $texttypeid
    ) {
      type {
        name
        id
      }
    }
  }
`



class EditText extends Component {

  render() {

    return (
      <Query query={GET_ITEM_QUERY} variables={{ id: this.props.match.params.id }} >
        {({ loading, error, data, client }) => {

          if (loading) return <div>Fetching</div>
          if (error) return <div>Error: {this.props.data.error.message}</div>

          const item = data.textById

          if (!item) {
            return <div>Error: The item does not exist.</div>
          }

          const handleTypeUpdate = async ({ hasRelation, variables }) => {
            // Determine which mutation to use, based on `hasRelation` value.
            const TYPE_MUTATION = hasRelation === true ? REMOVE_TYPE : ADD_TYPE
            // Run the mutation.
            const { data, errors } = await client.mutate({
              mutation: TYPE_MUTATION,
              variables: variables
            });
            if (errors) {
              console.log(errors)
            }
            // WE SHOULD UPDATE THE CACHE AND REFLECT THE CHANGE IN CURRENT MEMORY
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
                      <FormItem>
                        <Input type="checkbox" value="bb102fbe-0319-4259-a471-df509d05860c" onClick={(e) => {
                          return (handleTypeUpdate(
                            {
                              hasRelation: !e.target.checked,
                              variables: {
                                texttext_id: values.text_id,
                                texttypeid: e.target.value
                              }
                            }
                          ))
                        }} />
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

export default withRouter(EditText);