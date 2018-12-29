import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Button, Table } from "antd";
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

class AuthorDetails extends Component {
  state = {
    visibleDetails: []
  }

  displayDetails = (id, e) => {
    const contentList = this.state.visibleDetails
    const idx = contentList.indexOf(id)
    if (idx === -1) {
      contentList.push(id)
    } else {
      contentList.splice(idx)
    }
    this.setState(contentList)
  }

  displayingDetails = (id) => this.state.visibleDetails.includes(id)

  showPagination = (records) => records.length > 10

  render() {
    const urlParams = this.props.match.params

    return (
      <Query query={AUTHOR_QUERY} variables={{ id: urlParams.id }}>
        {({ loading, error, data }) => {
          if (loading) return <div>Fetching</div>
          if (error) return <div>{error.message}</div>

          const author = data.Person[0] || undefined
          if (!author) {
            return <div>Error: There is no author with the id {urlParams.id}</div>
          }

          return (
            <React.Fragment>
              <h1>Author details</h1>
              <Button>
                <Link to={"/author/edit/" + author.id}>Edit author</Link>
              </Button>
              <section>
                <h2>Names</h2>
                <Table
                  columns={[
                    { title: 'Name', dataIndex: 'value' },
                    { title: 'Language', dataIndex: 'language' }
                  ]}
                  dataSource={author.names.map(name => ({
                    key: name.id,
                    value: name.value,
                    language: name.language
                  }))}
                  size={'small'}
                  pagination={this.showPagination(author.names)}
                />
              </section>
              <section>
                <h2>Short description</h2>
                <div>
                  {author.description}
                </div>
              </section>
              <section>
                <h2>Texts</h2>
                <Table
                  columns={[
                    { title: 'Title', dataIndex: 'title' },
                  ]}
                  dataSource={author.attributions.map(attribution => ({
                    key: attribution.id,
                    title: attribution.text.title,
                    note: attribution.note,
                    source: attribution.source,
                    certainty: normCertainty(attribution.certainty),
                  }))}
                  size={'small'}
                  pagination={this.showPagination(author.attributions)}
                  expandedRowRender={record => (
                    <DescriptionList
                      items={[
                        {
                          title: 'Certainty',
                          description: record.certainty,
                          key: record.id + '_certainty'
                        },
                        {
                          title: 'Note',
                          description: record.note || undefined,
                          key: record.id + '_note'
                        },
                        {
                          title: 'Source',
                          description: record.source || undefined,
                          key: record.id + '_source'
                        }
                      ]}
                    />
                  )}
                />
              </section>
              <section>
                <h2>Biography</h2>
                <div>
                  {author.biography}
                </div>
              </section>
              <section>
                <h2>Note</h2>
                <div>
                  {author.note}
                </div>
              </section>
              <section>
                <h2>Resources</h2>
              </section>
              <section>
                <h2>Literature</h2>
              </section>
            </React.Fragment>
          )
        }}
      </Query>

    );
  }
}

export default AuthorDetails