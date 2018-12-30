import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import AddAuthorText from "./AddAuthorText";
import EditableTable from '../EditableTable';
import EditableTextArea from "../EditableTextArea";
import DescriptionList from "../DescriptionList";
import { normCertainty } from '../utils';

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
                <AddAuthorText client={client} author={author} />
              </section>
              <section>
                <EditableTextArea heading={'Description'} client={client} author={author} field={'note'} />
              </section>
              <section>
                <h2>Attributed texts</h2>
                <p>
                  Editing or deleting an attribution will not change the text, only the connection between the author and the text. To edit the text, click the text title and edit it from the detailed view.
                </p>
                <EditableTable
                  contentColumns={[
                    { title: 'Title', dataIndex: 'title', editable: true },
                  ]}
                  dataSource={author.attributions.map(attribution => ({
                    key: attribution.id,
                    title: attribution.text.title,
                    note: attribution.note,
                    source: attribution.source,
                    certainty: normCertainty(attribution.certainty),
                  }))}
                  size={'small'}
                  expandedRowRender={record => (
                    <DescriptionList
                      items={[
                        {
                          title: 'Certainty',
                          dataIndex: 'certainty',
                          description: record.certainty,
                          key: record.id + '_certainty'
                        },
                        {
                          title: 'Note',
                          dataIndex: 'note',
                          description: record.note || undefined,
                          key: record.id + '_note'
                        },
                        {
                          title: 'Source',
                          dataIndex: 'source',
                          description: record.source || undefined,
                          key: record.id + '_source'
                        }
                      ]}
                    />
                  )}
                />
              </section>
            </React.Fragment>
          )
        }}
      </Query>
    );
  }
}

export default EditAuthor;