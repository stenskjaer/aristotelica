import React, { Component } from "react";
import { Mutation, Query } from "react-apollo";
import gql from "graphql-tag";
import { Link } from "react-router-dom";
import { Formik } from 'formik';
import { Form, Input, Button } from 'antd';
import EditableTable from './AddAuthorText';

const AUTHOR_QUERY = gql`
  query authorInfo($id: ID!) {
    Person(id: $id) {
      id
      description
      note
      biography
      names {
        id
        value
        language
      }
      attributions {
        id
        note
        source
        certainty
        text {
          id
          title
        }
      }
    }
  }
`

const UPDATE_AUTHOR = gql`
  mutation UpdateAuthor(
      $id: ID!, 
      $modified: DateTime!,
      $description: String,
      $biography: String,
      $note: String,
    ){
    UpdatePerson(
        id: $id, 
        modified: $modified
        name: $name,
        description: $description,
        biography: $biography,
        note: $note,
      ) {
      id
    }
  }
`

class EditAuthor extends Component {

  render() {

    return (
      <Query query={AUTHOR_QUERY} variables={{ id: this.props.match.params.id }} >
        {({ loading, error, data, client }) => {

          if (loading) return <div>Fetching</div>
          if (error) return <div>{error.message}</div>

          const author = data.Person[0] || undefined
          if (!author) {
            return <div>Error: The author does not exist.</div>
          }

          return (
            <Mutation mutation={UPDATE_AUTHOR}>
              {(updateAuthor) => (
                <Formik
                  initialValues={author}
                  onSubmit={(values) => {
                    values.modified = new Date()
                    updateAuthor({ variables: values })
                    this.props.history.push("/author/" + author.id)
                  }}
                >
                  {({ values, handleSubmit, handleChange, isSubmitting }) => (
                    <React.Fragment>
                      <h1>Edit author</h1>
                      <Link to={"/author/" + author.id}>View author</Link>
                      <Form onSubmit={handleSubmit} className="edit-form">
                        <div className="form-group">
                          <h2>Name</h2>
                          <EditableTable client={client} author={author} />
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

export default EditAuthor;