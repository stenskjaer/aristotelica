import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Link } from "react-router-dom";
import { List } from "antd";
import DescriptionList from "../DescriptionList";
import TypeTree from "./TypeTree";
import { normCertainty, formatDates, itemEventDatings } from '../utils'

const ITEM_QUERY = gql`
  query textInfo($id: ID!) {
    Text(id: $id) {
      id
      title
      title_addon
      created
      modified
      note
      incipit
      explicit
      events {
        type
        datings {
          id
          source
          note
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
      attributions {
        id
        person {
          name
          id
        }
        note
        source
        certainty
      }
      types {
        name
        id
        children {
          name
          id
        }
      }
    }
  }
`

class TextItem extends Component {
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

  attributionName = (attribution) => {
    const certainty = ' (' + normCertainty(attribution.certainty) + ')' || ''
    return (attribution.person.name + certainty)
  }

  render() {
    const urlParams = this.props.match.params

    return (
      <Query query={ITEM_QUERY} variables={{ id: urlParams.id }}>
        {({ loading, error, data }) => {
          if (loading) return <div>Fetching</div>
          if (error) return <div>{error.message}</div>

          const item = data.Text[0] || undefined
          if (!item) {
            return <div>Error: There is not text with the id {urlParams.id}</div>
          }

          return (
            <React.Fragment>
              <h1>Text details</h1>
              <Link to={"/text/edit/" + item.id}>Edit text</Link>
              <section>
                <h2>Authorship</h2>
                <List
                  itemLayout="vertical"
                  dataSource={item.attributions}
                  renderItem={attribution => (
                    <List.Item
                      key={attribution.id}
                      actions={[
                        <a onClick={(e) => this.displayDetails(attribution.id, e)}>
                          {this.displayingDetails(attribution.id) ? 'Less' : 'More'}
                        </a>
                      ]}
                    >
                      <List.Item.Meta title={this.attributionName(attribution)} />
                      <DescriptionList
                        style={{
                          display: this.displayingDetails(attribution.id) ? 'block' : 'none'
                        }}
                        items={[
                          {
                            title: 'Note',
                            description: attribution.note || undefined,
                            key: attribution.id + '_note'
                          },
                          {
                            title: 'Source',
                            description: attribution.source || undefined,
                            key: attribution.id + '_source'
                          }
                        ]}
                      />
                    </List.Item>
                  )}
                />

                <h2>Base data</h2>
                <DescriptionList items={[
                  {
                    title: 'Title',
                    description: item.title,
                    key: item.id + '_title',
                  },
                  {
                    title: 'Title note',
                    description: item.title_addon || undefined,
                    key: item.id + '_suffix',
                  },
                  {
                    title: 'Incipit',
                    description: item.incipit || undefined,
                    key: item.id + '_incipit',
                  },
                  {
                    title: 'Explicit',
                    description: item.explicit || undefined,
                    key: item.id + '_explicit',
                  },
                  {
                    title: 'Text type',
                    description: <TypeTree textId={item.id} />,
                    key: item.id + '_types'
                  }
                ]}
                />

                <h2>Dating</h2>
                <List
                  itemLayout="vertical"
                  dataSource={itemEventDatings(item, 'WRITTEN')}
                  renderItem={dating => (
                    <List.Item
                      key={dating.id}
                      actions={[
                        <a onClick={(e) => this.displayDetails(dating.id, e)}>
                          {this.displayingDetails(dating.id) ? 'Less' : 'More'}
                        </a>
                      ]}
                    >
                      <List.Item.Meta
                        title={formatDates(dating.dates)}
                      />
                      <div style={{
                        display: this.displayingDetails(dating.id) ? 'block' : 'none'
                      }}>
                        {dating.note ? <p>Note: {dating.note}</p> : null}
                        {dating.source ? <p>Source: {dating.source}</p> : null}
                      </div>
                    </List.Item>
                  )}
                />

                <h2>Additional information</h2>
                <DescriptionList items={[
                  {
                    title: 'Notes',
                    description: item.note || undefined,
                    key: item.note + '_note'
                  }
                ]}
                />

              </section>
            </React.Fragment>
          )
        }}
      </Query>

    );
  }
}

export default TextItem
