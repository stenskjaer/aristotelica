import React from "react";
import { Query } from "react-apollo";
import { Link } from "react-router-dom";
import { Table, Input, Button, Icon } from "antd";
import { ALL_MANUSCRIPTS } from "../GQL/Queries";
import { formatDates } from '../utils'


class ManuscriptList extends React.Component {
  state = {
    searchText: '',
  };

  handleSearch = (selectedKeys, confirm) => () => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  }

  handleReset = clearFilters => () => {
    clearFilters();
    this.setState({ searchText: '' });
  }


  render() {
    return (
      <Query query={ALL_MANUSCRIPTS}>
        {({ loading, error, data }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>Error</p>;

          const formatDatings = (datings) => (
            datings.map(dating => {
              return formatDates(dating.dates)
            })
          ).sort()

          const manuscripts = data.Manuscript.map(manuscript => ({ ...manuscript }))
          const identifier = record => `${record.shelfmark} ${record.number}`

          const columns = [
            {
              title: 'Shelfmark',
              dataIndex: 'shelfmark',
              render: (text, record) => <Link to={`manuscript/${record.id}`}>{text}</Link>,
              sorter: (a, b) => a.shelfmark.localeCompare(b.shelfmark),
            },
            {
              title: 'Identifier',
              dataIndex: 'number',
              render: (text, record) => <Link to={`manuscript/${record.id}`}>{text}</Link>,
              sorter: (a, b) => a.number.localeCompare(b.number),
            },
            {
              title: 'Library',
              dataIndex: 'library.name',
              sorter: (a, b) => a.library.name.localeCompare(b.library.name),
            },
            {
              title: 'City',
              dataIndex: 'library.city.name',
              sorter: (a, b) => a.library.city.name.localeCompare(b.library.city.name),
            }
          ]

          return (
            <Table
              pagination={{ pageSize: 10, showSizeChanger: true, }}
              dataSource={manuscripts} columns={columns} rowKey="id" />
          );
        }}
      </Query>
    );
  }
}

export default ManuscriptList;