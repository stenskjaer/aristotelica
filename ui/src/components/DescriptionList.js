import React, { Component, Fragment } from "react";

class DescriptionList extends Component {

  render() {
    const items = this.props.items.map(item => {
      if (item.description) {
        return (
          <Fragment key={item.id}>
            <dt>{item.title}</dt><dd>{item.description}</dd>
          </Fragment>
        )
      } else {
        return (null)
      }
    })

    return (
      <dl>
        {items}
      </dl>
    )
  }
}

export default DescriptionList