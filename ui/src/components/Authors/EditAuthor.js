import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import EditableTable from './AddAuthorText';
import EditableTextArea from "../EditableTextArea";

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
    ) {
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

            <React.Fragment>
              <h1>Author</h1>
              <section>
                <h2>Names</h2>
                <EditableTable client={client} author={author} />
              </section>
              <section>
                <EditableTextArea heading={'Description'} client={client} author={author} field={'note'} />
              </section>
            </React.Fragment>
          )
        }}
      </Query>
    );
  }
}

export default EditAuthor;