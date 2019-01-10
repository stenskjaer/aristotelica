import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import AuthorshipAttributions from "./AuthorshipAttributions";
import AuthorTexts from "./AuthorTexts";
import AuthorEvents from "./AuthorEvents";
import EditableTextArea from "../EditableTextArea";
import { defaultName } from "../utils";

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
        language_default
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
      events {
        id
        type
        description
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

const UPDATE_PERSON = gql`
  mutation UpdatePerson(
      $id: ID!, 
      $description: String,
      $biography: String,
      $note: String,
    ) {
    UpdatePerson(
        id: $id, 
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

          const handleUpdatePerson = async (variables) => {
            const { error, data } = await client.mutate({
              mutation: UPDATE_PERSON,
              variables: {
                id: author.id,
                modified: new Date(),
                ...variables
              },
              refetchQueries: ['authorInfo']
            })
            if (error) {
              console.warn(error.message)
            }
            return data.UpdatePerson.id
          }

          return (
            <React.Fragment>
              <h1>{defaultName(author)}</h1>
              <section>
                <h2>Names</h2>
                {/* TODO: SHOULD THIS USE THE EditableTable COMPONENT??*/}
                <AuthorshipAttributions client={client} author={author} />
              </section>
              <section>
                <h2>Events</h2>
                <AuthorEvents client={client} author={author} />
              </section>
              <section>
                <EditableTextArea
                  handleCreateUpdateDB={handleUpdatePerson}
                  heading={'Description'}
                  author={author}
                  field={'description'} />
              </section>
              <section>
                <EditableTextArea
                  handleCreateUpdateDB={handleUpdatePerson}
                  heading={'Note'}
                  author={author}
                  field={'note'} />
              </section>
              <section>
                <h2>Attributed texts</h2>
                <p>
                  Editing or deleting an attribution will not change the text, only the connection between the author and the text. To edit the text, click the text title and edit it from the detailed view.
                </p>
                <AuthorTexts client={client} author={author} />
              </section>
            </React.Fragment>
          )
        }}
      </Query>
    );
  }
}

export default EditAuthor;