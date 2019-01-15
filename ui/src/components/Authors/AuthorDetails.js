import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import AuthorEditor from "./AuthorEditor";

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


class AuthorDetails extends Component {

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
            <AuthorEditor data={author} client={client} {...this.props} />
          )
        }}
      </Query>
    );
  }
}

export default AuthorDetails;