import React from "react";
import { Query } from "react-apollo";
import { Link } from "react-router-dom";
import { Table } from "antd";
import { ALL_MANUSCRIPTS } from "../GQL/Queries";
import { formatDates } from '../utils'
import Defaults from '../defaults';


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

          const formatDatings = (datings) => datings.map(dating => formatDates(dating.dates)).sort()

          const manuscripts = data.Manuscript.map(manuscript => ({ ...manuscript }))

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
            },
            {
              title: 'Dating',
              render: (text, record) => (
                record.events.map(event => formatDatings(event.datings)).join(', ')
              ),
              sorter: (a, b) => {
                // This sorter needs to be revised!
                const aDatings = a.events[0] && a.events[0].datings
                const bDatings = b.events[0] && b.events[0].datings
                if (aDatings && bDatings) {
                  const aDates = a.events[0].datings.map(dating => formatDates(dating.dates)).join(', ')
                  const bDates = b.events[0].datings.map(dating => formatDates(dating.dates)).join(', ')
                  return aDates.localeCompare(bDates)
                } else if (aDatings) {
                  return 1
                } else {
                  return -1
                }
              }
            },
            {
              title: 'Texts (expand row for more details)',
              render: (text, record) => {
                if (record.manifestations.length > 0) {
                  if (record.manifestations.length > 1) {
                    return `
                      ${record.manifestations[0].text.title} 
                      and ${record.manifestations.length - 1} more.
                    `
                  }
                  return `${record.manifestations[0].text.title}`
                }
              }
            }
          ]

          return (
            <Table
              pagination={{ pageSize: 10, showSizeChanger: true, }}
              dataSource={manuscripts} columns={columns} rowKey="id"
              expandedRowRender={record => (
                record.manifestations.length > 0
                  ? <Table
                    pagination={false}
                    dataSource={record.manifestations}
                    rowKey="id"
                    columns={[
                      {
                        title: 'Title',
                        dataIndex: 'text.title',
                        render: (text, record) => <Link to={`/text/${record.text.id}`}>{text}</Link>,
                        width: '60%',
                      },
                      {
                        title: 'Authorships',
                        render: (text, record) => (
                          record.text.attributions
                            .map(att => {
                              const name = att.person.names.find(n => n.language === Defaults.language) || att.person.names[0]
                              return <Link key={att.id} to={`/author/${att.person.id}`}>{name.value}</Link>
                            })
                            .reduce((accu, elem) => accu.length > 0 ? [accu, ', ', elem] : [elem], [])
                        ),
                        width: '40%',
                      }
                    ]}
                  />
                  : 'No texts are associated with this manuscript.'
              )}
              expandRowByClick
            />
          );
        }}
      </Query>
    );
  }
}

export default ManuscriptList;