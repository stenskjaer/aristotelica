import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";

const ITEM_QUERY = gql`
  query Text($id: String!) {
    textById(ID: $id) {
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
      <Query query={ITEM_QUERY} variables={{id: this.props.item}}>
        {({ loading, error, data }) => {
          if (loading) return <div>Fetching</div>
          if (error) return <div>Error</div>
          
          const item = data.textById
          const names = item.authors.map(authors => [authors.name])
          const types = item.type.map(type => [type.name])

          return (
              <dl>
                <dt>Author</dt>
                <dd>{names.join(', ')}</dd>
                <dt>Title</dt>
                <dd>{item.title} { item.title_addon ? '(' + item.title_addon + ')': ''}</dd>
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

export default TextItem
