import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Link } from "react-router-dom";
import { Table, Input, Button, Icon } from "antd";
import { defaultName } from "../../utils/functions";

const PERSONS_QUERY = gql`
  query allPersons {
    Person {
      id
      names {
        id
        value
        language
      }
      attributions {
        id
        certainty
        text {
          title
          id
        }
      }
    }
  }
`

class AuthorList extends React.Component {
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
      <Query query={PERSONS_QUERY}>
        {({ loading, error, data }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>Error</p>;

          const firstAttribution = (attributions) => {
            if (attributions && attributions.length > 0) {
              const title = attributions[0].text.title
              const more = attributions.length > 1 ? ` (and ${attributions.length - 1} more)` : ''
              return title + more
            } else {
              return ''
            }
          }

          const authors = data.Person.map(author => ({
            id: author.id,
            name: defaultName(author),
            texts: firstAttribution(author.attributions),
            //datings: formatDatings(author.datings).join(' / ')
          }))

          const columns = [
            {
              title: 'Name',
              dataIndex: 'name',
              sorter: (a, b) => a.name.localeCompare(b.name),
              render: (name, record) => <Link to={`author/${record.id}`}>{name}</Link>
            },
            {
              title: 'Texts',
              dataIndex: 'texts',
              sorter: (a, b) => a.texts.localeCompare(b.texts),
              filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div className="custom-filter-dropdown">
                  <Input
                    ref={el => this.searchInput = el}
                    placeholder="Search titles"
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={this.handleSearch(selectedKeys, confirm)}
                  />
                  <Button type="primary" onClick={this.handleSearch(selectedKeys, confirm)}>Search</Button>
                  <Button onClick={this.handleReset(clearFilters)}>Reset</Button>
                </div>
              ),
              filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#108ee9' : '#aaa' }} />,
              onFilter: (value, record) => record.texts.toLowerCase().includes(value.toLowerCase()),
              onFilterDropdownVisibleChange: (visible) => {
                if (visible) {
                  setTimeout(() => {
                    this.searchInput.focus();
                  });
                }
              },
            },
            {
              title: 'Birth',
            },
            {
              title: 'Death',
            },
          ]

          return (
            <Table
              pagination={{ pageSize: 10, showSizeChanger: true, }}
              dataSource={authors} columns={columns} rowKey="id"
            />
          );
        }}
      </Query>
    );
  }
}

export default AuthorList;
