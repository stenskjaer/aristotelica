import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Table, Divider } from 'antd'
import { Link } from 'react-router-dom';
import { normCertainty, formatDates } from './utils'

const TEXTS_QUERY = gql`
  query allTexts {
    Text {
      id
      title
      attributions {
        id
        certainty
        person {
          name
          id
        }
      }
      datings {
        id
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
`

class TextList extends React.Component {

  render() {
    return (
      <Query query={TEXTS_QUERY}>
        {({ loading, error, data }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>Error</p>;

          const formatAttributions = (attributions) => (
            attributions.map(attribution => {
              const person = attribution.person
              const certainty = ' (' + normCertainty(attribution.certainty) + ')'
              return person.name + certainty
            })
          ).sort()

          const formatDatings = (datings) => (
            datings.map(dating => {
              return formatDates(dating.dates)
            })
          ).sort()

          const texts = data.Text.map(text => ({
            id: text.id,
            title: text.title,
            attributions: formatAttributions(text.attributions).join(' / '),
            datings: formatDatings(text.datings).join(' / ')
          }))
          const columns = [
            {
              title: 'Attributions',
              dataIndex: 'attributions',
              defaultSortOrder: 'ascend',
              sorter: (a, b) => a.attributions.localeCompare(b.attributions),
            },
            {
              title: 'Title',
              dataIndex: 'title',
              sorter: (a, b) => a.title.localeCompare(b.title),
              render: (text, record) => <a href={`text/${record.id}`}>{text}</a>
            },
            {
              title: 'Datings',
              dataIndex: 'datings',
            },
            {
              title: 'Action',
              key: 'action',
              render: (text, record) => (
                <span>
                  <Link to={"text/" + record.id}>More</Link>
                  <Divider type="vertical" />
                  <Link to={"text/edit/" + record.id}>Edit</Link>
                </span>
              ),
            }
          ]

          return (
            <Table
              pagination={{ pageSize: 10, showSizeChanger: true, }}
              dataSource={texts} columns={columns} rowKey="id" />
          );
        }}
      </Query>
    );
  }
}

export default TextList;
