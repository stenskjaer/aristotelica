import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Table, Divider, Input, Button, Icon } from 'antd'
import { Link } from 'react-router-dom';
import { normCertainty, formatDates, itemEventDatings, defaultName } from '../utils'

const TEXTS_QUERY = gql`
  query allTexts {
    Text {
      id
      title
      attributions {
        id
        certainty
        person {
          id
          names {
            id
            value
            language
            language_default
          }
        }
      }
      events {
        type
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
  }
`

class TextList extends React.Component {
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
      <Query query={TEXTS_QUERY}>
        {({ loading, error, data }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>Error</p>;

          const formatAttributions = (attributions) => (
            attributions.map(attribution => {
              const person = attribution.person
              const certainty = ' (' + normCertainty(attribution.certainty) + ')'
              return defaultName(person) + certainty
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
            attributions: text.attributions,
            datings: formatDatings(itemEventDatings(text, 'WRITTEN')).join(' / ') || 'No datings'
          }))

          const defaultNames = (attributions) => (
            attributions
              .map(attribution => (defaultName(attribution.person)))
              .join(';')
          )

          const columns = [
            {
              title: 'Attributions',
              dataIndex: 'attributions',
              defaultSortOrder: 'ascend',
              sorter: (a, b) => defaultName(a.attributions[0].person).localeCompare(defaultName(b.attributions[0].person)),
              filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div className="custom-filter-dropdown">
                  <Input
                    ref={el => this.searchInput = el}
                    placeholder="Search attributions"
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={this.handleSearch(selectedKeys, confirm)}
                  />
                  <Button type="primary" onClick={this.handleSearch(selectedKeys, confirm)}>Search</Button>
                  <Button onClick={this.handleReset(clearFilters)}>Reset</Button>
                </div>
              ),
              filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#108ee9' : '#aaa' }} />,
              onFilter: (value, record) => defaultNames(record.attributions).toLowerCase().includes(value.toLowerCase()),
              onFilterDropdownVisibleChange: (visible) => {
                if (visible) {
                  setTimeout(() => {
                    this.searchInput.focus();
                  });
                }
              },
              render: (text, record) => (
                record.attributions
                  .map(attribution => (
                    <React.Fragment key={attribution.id}>
                      <Link to={`/author/${attribution.person.id}`}>{defaultName(attribution.person)}</Link>
                      {' '}
                      ({normCertainty(attribution.certainty)})
                    </React.Fragment>
                  ))
                  .reduce((accu, elem) => [accu, ', ', elem])
              )
            },
            {
              title: 'Title',
              dataIndex: 'title',
              sorter: (a, b) => a.title.localeCompare(b.title),
              render: (text, record) => <Link to={`text/${record.id}`}>{text}</Link>
            },
            {
              title: 'Datings',
              dataIndex: 'datings',
            },
            {
              title: 'Action',
              key: 'action',
              render: (text, record) => (
                <React.Fragment>
                  <Link to={"text/" + record.id}>More</Link>
                  <Divider type="vertical" />
                  <Link to={"text/edit/" + record.id}>Edit</Link>
                </React.Fragment>
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
