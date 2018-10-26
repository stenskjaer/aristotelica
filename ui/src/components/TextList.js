import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Table } from 'antd'

class TextList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      order: "asc",
      orderBy: "authorName",
      page: 0,
      rowsPerPage: 10
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

  render() {
    const columns = [
      {
        title: 'Name',
        dataIndex: 'authorName',
      },
      {
        title: 'Title',
        dataIndex: 'title',
        render: (text, record) => <a href={`detail/${record.text_id}`}>{text}</a>
      },
      {
        title: 'ID',
        dataIndex: 'text_id',
      }
    ]

    return (
      <Query
        query={gql`
          query usersPaginateQuery(
            $first: Int
            $offset: Int
            $orderBy: _TextOrdering
          ) {
            Text(first: $first, offset: $offset, orderBy: $orderBy) {
              authorName
              title
              text_id
            }
          }
        `}
        variables={{
          first: this.state.rowsPerPage,
          offset: this.state.rowsPerPage * this.state.page,
          orderBy: this.state.orderBy + "_" + this.state.order
        }}
      >
        {({ loading, error, data }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>Error</p>;

          return (
            <Table dataSource={data.Text} columns={columns} rowKey="text_id" />
          );
        }}
      </Query>
    );
  }
}

export default TextList;
