import React, { Component } from "react";
import { Query } from "react-apollo";
import { AutoComplete, Input, Icon } from 'antd';
import { ALL_LIBRARIES } from '../GQL/Queries';

const libraryString = item => [item.name, item.city, item.country].join(', ')

const formatLibrary = library => ({
  id: library.id,
  name: library.name,
  city: library.city.name,
  country: library.city.country.name
})

const renderOption = item => (
  <AutoComplete.Option
    key={item.id}
    value={item.id}
    text={libraryString(item)}
  >
    <em>{item.name}</em>
    <br />
    {item.city}, {item.country}
  </AutoComplete.Option>
)

class SelectLibrary extends Component {
  state = {
    selected: ''
  }

  searchFilter = (inputValue, option) => (
    option.props.text.toLowerCase().includes(inputValue.toLowerCase())
  )

  getDefault = (id, libraries) => (
    libraryString(libraries.find(lib => lib.id === id))
  )

  onSelect = (value) => {
    console.log('onSelect', value);
  }

  render() {
    const { editable, heading } = this.props
    const { library } = this.props.data
    return (
      <Query query={ALL_LIBRARIES}>
        {({ loading, error, data }) => {
          if (loading) return <div>Fetching</div>
          if (error) return <div>{error.message}</div>

          const libraries = data.Library
            .map(formatLibrary)
            .sort((a, b) => a.name.localeCompare(b.name))

          return (
            <React.Fragment>
              <h3>{heading}</h3>
              {editable
                ? <AutoComplete
                  optionLabelProp="text"
                  placeholder="Find library"
                  style={{ width: '400px' }}
                  dataSource={libraries.map(renderOption)}
                  onSelect={this.onSelect}
                  filterOption={this.searchFilter}
                  defaultValue={this.getDefault(library.id, libraries)}
                >
                  <Input suffix={<Icon type="search" />} />
                </AutoComplete>
                : libraryString(formatLibrary(library))
              }
            </React.Fragment>
          )
        }
        }
      </Query >
    );
  }
}

export default SelectLibrary;