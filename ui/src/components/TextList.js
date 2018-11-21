import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Table } from 'antd'

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

          const texts = data.Text.map(text => ({
            id: text.id,
            title: text.title,
            authors: text.attributions ? text.attributions.map(a => a.person.name).join(' / ') : 'No name'
          }))
          const columns = [
            {
              title: 'Authors',
              dataIndex: 'authors',
            },
            {
              title: 'Title',
              dataIndex: 'title',
              render: (text, record) => <a href={`detail/${record.id}`}>{text}</a>
            },
            {
              title: 'ID',
              dataIndex: 'id',
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
