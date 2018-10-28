import React, { Component } from "react";
import { Mutation, Query } from "react-apollo";
import gql from "graphql-tag";
import { withRouter } from "react-router";
import { Formik } from 'formik';

const UPDATE_ITEM_QUERY = gql`
  mutation UpdateText($text_id: ID!, $title: String!){
    UpdateText(text_id: $text_id, title: $title) {
      title
      text_id
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

  state = {
    title: '',
    id: this.props.match.params.id
  }

  render() {
    const { title, id } = this.state

    return (
      <Query query={GET_ITEM_QUERY} variables={{ id: this.props.match.params.id }}>
        {({ loading, error, data }) => {

          if (loading) return <div>Fetching</div>
          if (error) return <div>Error: {this.props.data.error.message}</div>

          const item = data.textById

          return (
            <Mutation mutation={UPDATE_ITEM_QUERY}>
              {(updateText) => (
                <Formik
                  initialValues={item}
                  onSubmit={values => updateText({ variables: values })}
                >
                  {({ values, handleSubmit, handleChange, isSubmitting }) => (
                    <form onSubmit={handleSubmit}>
                      <input
                        type="text"
                        name="title"
                        onChange={handleChange}
                        value={values.title}
                      />
                      <button type="submit" disabled={isSubmitting}>
                        Submit
                      </button>
                    </form>
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
