import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { withRouter } from "react-router";

const ITEM_QUERY = gql`
  query Text($id: String!) {
    textById(id: $id) {
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
    const urlParams = this.props.match.params

    return (
      <Query query={ITEM_QUERY} variables={{ id: urlParams.id }}>
        {({ loading, error, data }) => {
          if (loading) return <div>Fetching</div>
          if (error) return <div>Error</div>

          const item = data.textById
          if (!item) {
            return <div>Error: There is not text with the id {urlParams.id}</div>
          }
          const names = item.authors.map(authors => [authors.name])
          const types = item.type.map(type => [type.name])

          return (
            <dl>
              <dt>Author</dt>
              <dd>{names.join(', ')}</dd>
              <dt>Title</dt>
              <dd>{item.title} {item.title_addon ? '(' + item.title_addon + ')' : ''}</dd>
              <dt>Type</dt>
              <dd>{types.join(', ')}</dd>
              <dt>Created</dt>
              <dd>{Date(item.created)}</dd>
              <dt>Modified</dt>
              <dd>{Date(item.modified)}</dd>
              <dt>Date</dt>
              <dd>{item.date}</dd>
              <dt>Note</dt>
              <dd>{item.note}</dd>
            </dl>
          )
        }}
      </Query>

    );
  }
}

export default withRouter(TextItem)
