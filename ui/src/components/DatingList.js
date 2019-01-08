import React, { Component } from "react";
import { List } from "antd";
import { formatDates } from './utils'

class DatingList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visibleDetails: []
    }
  }

  displayDetails = (id, e) => {
    const contentList = this.state.visibleDetails
    const idx = contentList.indexOf(id)
    if (idx === -1) {
      contentList.push(id)
    } else {
      contentList.splice(idx)
    }
    this.setState(contentList)
  }

  displayingDetails = (id) => this.state.visibleDetails.includes(id)

  render() {
    const { datings, title } = this.props;

    return (
      <React.Fragment>
        <h3>{title}</h3>
        <List
          itemLayout="vertical"
          dataSource={datings}
          renderItem={dating => (
            <List.Item
              key={dating.id}
              actions={[
                <a onClick={(e) => this.displayDetails(dating.id, e)}>
                  {this.displayingDetails(dating.id) ? 'Less' : 'More'}
                </a>
              ]}
            >
              <p>{formatDates(dating.dates)}</p>
              <div style={{
                display: this.displayingDetails(dating.id) ? 'block' : 'none'
              }}>
                {dating.note && <p>Note: {dating.note}</p>}
                {dating.source && <p>Source: {dating.source}</p>}
              </div>
            </List.Item>
          )}
        />
      </React.Fragment>
    )
  }
}

export default DatingList;
