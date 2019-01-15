import React, { Component } from "react";
import gql from "graphql-tag";
import { defaultName } from "../utils";
import AuthorshipAttributions from "./AuthorshipAttributions";
import AuthorTexts from "./AuthorTexts";
import AuthorEvents from "./AuthorEvents";
import EditableTextArea from "../EditableTextArea";
import { Button } from "antd";

const UPDATE_PERSON = gql`
  mutation UpdatePerson(
      $id: ID!, 
      $description: String,
      $biography: String,
      $note: String,
    ) {
    UpdatePerson(
        id: $id, 
        description: $description,
        biography: $biography,
        note: $note,
      ) {
      id
    }
  }
`

class AuthorEditor extends Component {
  state = {
    author: this.props.data,
    updaters: {
      propertyUpdater: {},
      relationUpdaters: []
    }
  }

  handleUpdatePerson = async (variables) => {
    console.log("Running person update")
    const { error, data } = await this.props.client.mutate({
      mutation: UPDATE_PERSON,
      variables: variables,
    })
    if (error) {
      console.warn(error.message)
    }
    return data.UpdatePerson.id
  }

  handlePropertyState = ({ field, content }) => {
    const newAuthor = this.state.author
    newAuthor[field] = content
    this.setState({
      author: newAuthor,
    })
    this.propertyUpdater()
  }

  propertyUpdater = () => {
    const newUpdaters = this.state.updaters
    newUpdaters.propertyUpdater = {
      func: this.handleUpdatePerson,
      variables: {
        id: this.state.author.id,
        description: this.state.author.description,
        note: this.state.author.note,
        biography: this.state.author.biography,
        modified: new Date()
      }
    }
    this.setState({
      updaters: newUpdaters
    })
  }

  handleSave = () => {
    const updater = this.state.updaters.propertyUpdater
    updater.func(updater.variables)
  }


  render() {

    const { auth, client } = this.props
    const { author } = this.state
    const { isAuthenticated } = auth
    const editable = isAuthenticated()

    console.log(author)

    return (
      <React.Fragment key={author.id}>
        <h1>{defaultName(author)}</h1>
        <section>
          <h2>Names</h2>
          <AuthorshipAttributions editable={editable} client={client} author={author} />
        </section>
        <section>
          <h2>Events</h2>
          <AuthorEvents editable={editable} client={client} author={author} />
        </section>
        <section>
          <EditableTextArea
            editable={editable}
            heading={'Description'}
            data={author}
            field={'description'}
            handleUpdate={this.handlePropertyState}
          />
        </section>
        <section>
          <EditableTextArea
            editable={editable}
            heading={'Note'}
            data={author}
            field={'note'}
            handleUpdate={this.handlePropertyState}
          />
        </section>
        <section>
          <EditableTextArea
            editable={editable}
            heading={'Biography'}
            data={author}
            field={'biography'}
            handleUpdate={this.handlePropertyState}
          />
        </section>
        <section>
          <h2>Attributed texts</h2>
          {editable &&
            <p>
              Editing or deleting an attribution will not change the text, only the connection between the author and the text. To edit the text, click the text title and edit it from the detailed view.
                  </p>
          }
          <AuthorTexts editable={editable} client={client} author={author} />
        </section>
        <h3>TODOS</h3>
        <section>
          <h2>Resources</h2>
        </section>
        <section>
          <h2>Literature</h2>
        </section>
        <Button onClick={this.handleSave}>Save</Button>
      </React.Fragment>
    );
  }
}

export default AuthorEditor;