import React, { Component } from "react";
import { Mutation, Query } from "react-apollo";
import gql from "graphql-tag";
import { Link } from "react-router-dom";
import { Formik } from 'formik';
import { Form, Input, Button } from 'antd';
import FormItem from "antd/lib/form/FormItem";
import TypeSelector from './TypeSelector';
import EditItemAuthors from './EditItemAuthors';
import TextEvents from './TextEvents';

const { TextArea } = Input

const UPDATE_ITEM_QUERY = gql`
  mutation UpdateText(
      $id: ID!, 
      $title: String!,
      $title_addon: String,
      $note: String,
      $date: String,
      $incipit: String,
      $explicit: String,
      $modified: DateTime,
    ){
    UpdateText(
        id: $id, 
        title: $title,
        title_addon: $title_addon,
        note: $note,
        date: $date,
        incipit: $incipit,
        explicit: $explicit,
        modified: $modified
      ) {
      title
      title_addon
      id
      note
      date
      incipit
      explicit
      modified
    }
  }
`

const GET_ITEM_QUERY = gql`
  query textInfo($id: ID!) {
    Text(id: $id) {
      id
      title
      title_addon
      created
      modified
      date
      note
      incipit
      explicit
      events {
        id
        type
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
  }
`

class TextDetails extends Component {

  render() {

    return (
      <Query query={GET_ITEM_QUERY} variables={{ id: this.props.match.params.id }} >
        {({ loading, error, data, client }) => {

          if (loading) return <div>Fetching</div>
          if (error) return <div>{error.message}</div>

          const item = data.Text ? data.Text[0] : null
          if (!item) {
            return <div>Error: The item does not exist.</div>
          }

          return (
            <Mutation mutation={UPDATE_ITEM_QUERY}>
              {(updateText) => (
                <Formik
                  initialValues={item}
                  onSubmit={(values) => {
                    values.modified = new Date()
                    updateText({ variables: values })
                    this.props.history.push("/text/" + item.id)
                  }
                  }
                >
                  {({ values, handleSubmit, handleChange, isSubmitting }) => (
                    <React.Fragment>
                      <h1>Edit text</h1>
                      <Link to={"/text/" + item.id}>View text</Link>
                      <Form onSubmit={handleSubmit} className="edit-form">
                        <div className="form-group">
                          <h2>Authorship</h2>
                          <EditItemAuthors client={client} textId={values.id} />
                        </div>
                        <div className="form-group">
                          <h2>Base data</h2>
                          <FormItem label="Title">
                            <Input placeholder="Title" name="title" onChange={handleChange} value={values.title} />
                          </FormItem>
                          <FormItem label="Title suffix">
                            <Input placeholder="Title suffix" name="title_addon" onChange={handleChange} value={values.title_addon} />
                          </FormItem>
                          <FormItem label="Text types">
                            <TypeSelector client={client} textId={item.id} />
                          </FormItem>
                        </div>
                        <div className="form-group">
                          <h2>Dating</h2>
                          <TextEvents client={client} text={item} />
                        </div>
                        <div className="form-group">
                          <FormItem label="Incipit">
                            <TextArea row="3" name="incipit" onChange={handleChange} value={values.incipit} />
                          </FormItem>
                          <FormItem label="Explicit">
                            <TextArea row="3" name="explicit" onChange={handleChange} value={values.explicit} />
                          </FormItem>
                          <FormItem label="Note">
                            <TextArea row={4}
                              placeholder="Note" name="note"
                              onChange={handleChange} value={values.note}
                            />
                          </FormItem>
                        </div>
                        <div>
                          <h2>TODOS</h2>
                          <FormItem label="Literature">
                            <Input
                              placeholder="Literature" name="literature"
                              onChange={handleChange} value={values.literature}
                            />
                          </FormItem>
                          <FormItem label="Editions">
                            <Input
                              placeholder="Editions" name="editions"
                              onChange={handleChange} value={values.editions}
                            />
                          </FormItem>
                          <FormItem label="Manuscripts">
                            <Input
                              placeholder="Manuscripts" name="manuscripts"
                              onChange={handleChange} value={values.manuscripts}
                            />
                          </FormItem>
                          <FormItem label="Content">
                            <Input
                              placeholder="Content" name="content"
                              onChange={handleChange} value={values.content}
                            />
                          </FormItem>
                        </div>
                        <Button type="primary" htmlType="submit" className="edit-form-button">
                          Submit
                      </Button>
                      </Form>
                    </React.Fragment>
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

export default TextDetails;