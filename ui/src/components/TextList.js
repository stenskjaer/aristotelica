import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Table, Divider } from 'antd'
import { Link } from 'react-router-dom';

const TEXTS_QUERY = gql`
  query allTexts {
    Text {
      id
      title
      attributions {
        id
        person {
          name
          id
        }
      }
    }
  }
`

class TextList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      order: "asc",
      orderBy: "title",
      page: 0,
    };
  }

  handleSortRequest = property => {
    const orderBy = property;
    let order = "desc";

    if (this.state.orderBy === property && this.state.order === "desc") {
      order = "asc";
    }

    this.setState({ order, orderBy });
  };

  onShowSizeChange = (current, pageSize) => {
    console.log(current, pageSize);
  }

  render() {
    return (
      <Query query={TEXTS_QUERY}>
        {({ loading, error, data }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>Error</p>;

          const authorNames = (attributions) => (
            attributions.map(attribution => {
              const person = attribution.person
              const certainty = person.certainty !== undefined ? ' (' + person.certainty + ')' : ''
              return person.name + certainty
            })
          ).sort()

          const texts = data.Text.map(text => ({
            id: text.id,
            title: text.title,
            authors: authorNames(text.attributions).join(' / ')
          }))
          const columns = [
            {
              title: 'Authors',
              dataIndex: 'authors',
              defaultSortOrder: 'ascend',
              sorter: (a, b) => a.authors.localeCompare(b.authors),
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
