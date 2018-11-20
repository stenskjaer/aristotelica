import React, { Component, Fragment } from "react";

class DescriptionList extends Component {

  render() {
    const items = this.props.items ?
      this.props.items.map(item => {
        if (item.description) {
          return (
            <Fragment key={item.key}>
              <dt>{item.title}</dt><dd>{item.description}</dd>
            </Fragment>
          )
        } else {
          return (null)
        }
      }).filter(x => x !== null)
      : []

    return (
      <dl {...this.props}>
        {items.length > 0 ? items : 'No data available'}
      </dl>
    )

  }
}

export default DescriptionList