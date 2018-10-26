import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import { withRouter } from "react-router";

const UPDATE_ITEM_QUERY = gql`
  mutation UpdateText($id: ID!, $title: String!){
    UpdateText(text_id: $id, title: $title) {
      title
      text_id
    }
  }
`

class TextItem extends Component {

  state = {
    title: '',
    id: this.props.match.params.id
  }

  render() {
    const { title, id } = this.state

    return (
      <Mutation mutation={UPDATE_ITEM_QUERY}>
        {(updateText, { data }) => (
          <div>
            <form
              onSubmit={e => {
                e.preventDefault();
                updateText({ variables: { title, id } });
              }}
            >
              <input
                value={title}
                onChange={e => this.setState({ title: e.target.value })}
                type="text"
                placeholder="Input title"
              />
              <button type="submit">Add Todo</button>
            </form>
          </div>
        )}

      </Mutation>
    );
  }
}

export default withRouter(TextItem)
