import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Link, withRouter } from "react-router-dom";
import { List, Button, Table } from "antd";
import DescriptionList from "../DescriptionList";
import { normCertainty, formatDates } from '../utils';


const AUTHOR_QUERY = gql`
  query authorInfo($id: ID!) {
    Person(id: $id) {
      id
      name
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

          const titleColumns = [
            { title: 'Title', dataIndex: 'title' },
            { title: 'Certainty', dataIndex: 'certainty' }
          ]
          const titleData = author.attributions.map(attribution => ({
            id: attribution.id,
            title: attribution.text.title,
            note: attribution.note,
            source: attribution.source,
            certainty: normCertainty(attribution.certainty),
          }))

          return (
            <React.Fragment>
              <h1>Author details</h1>
              <Button>
                <Link to={"/author/edit/" + author.id}>Edit author</Link>
              </Button>
              <section>
                <h2>Name</h2>
              </section>
              <section>
                <h2>Texts</h2>
                <Table
                  columns={titleColumns}
                  dataSource={titleData}
                  rowKey="id"
                  expandedRowRender={record => (
                    <DescriptionList
                      items={[
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
            </React.Fragment>
          )
        }}
      </Query>

    );
  }
}

export default withRouter(AuthorDetails)