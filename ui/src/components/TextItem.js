import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { withRouter } from "react-router";
import { List } from "antd";
import DescriptionList from "./DescriptionList";
import { normCertainty } from './utils';

const ITEM_QUERY = gql`
  query textInfo($id: ID!) {
    Text(id: $id) {
      title
      title_addon
      created
      modified
      date
      note
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
    attributionContent: []
  }

  attributionDetails = (id, e) => {
    const contentList = this.state.attributionContent
    const idx = contentList.indexOf(id)
    if (idx === -1) {
      contentList.push(id)
    } else {
      contentList.splice(idx)
    }
    this.setState(contentList)
  }

  showContent = (id) => this.state.attributionContent.includes(id)

  showField = (item, fieldname) => {
    if (item) {
      return <p>{fieldname}: {item}</p>
    }
  }

  attributionName = (attribution) => {
    const certainty = attribution.certainty ? ' (' + normCertainty(attribution.certainty) + ')' : ''
    return (attribution.person.name + certainty)
  }

  render() {
    const urlParams = this.props.match.params

    return (
      <Query query={ITEM_QUERY} variables={{ id: urlParams.id }}>
        {({ loading, error, data }) => {
          if (loading) return <div>Fetching</div>
          if (error) return <div>{error.message}</div>

          const item = data.Text ? data.Text[0] : undefined
          if (!item) {
            return <div>Error: There is not text with the id {urlParams.id}</div>
          }

          return (
            <section>
              <h2>Authorship</h2>
              <List
                itemLayout="vertical"
                dataSource={item.attributions}
                renderItem={attribution => (
                  <List.Item
                    key={attribution.id}
                    actions={[
                      <a onClick={(e) => this.attributionDetails(attribution.id, e)}>
                        {this.showContent(attribution.id) ? 'Less' : 'More'}
                      </a>
                    ]}
                  >
                    <List.Item.Meta
                      title={this.attributionName(attribution)}
                    />
                    <div style={{
                      display: this.showContent(attribution.id) ? 'block' : 'none'
                    }}>
                      {attribution.note ? <p>Note: {attribution.note}</p> : null}
                      {attribution.source ? <p>Source: {attribution.source}</p> : null}
                    </div>
                  </List.Item>
                )}
              />
              <h2>Base data</h2>
              <DescriptionList items={[
                {
                  title: 'Title',
                  description: item.title
                },
                {
                  title: 'Title note',
                  description: item.title_addon ? item.title_addon : undefined
                }
              ]}
              />

              <h2>Dating</h2>

              <h2>Additional information</h2>
            </section>
          )
        }}
      </Query>

    );
  }
}

export default withRouter(TextItem)
