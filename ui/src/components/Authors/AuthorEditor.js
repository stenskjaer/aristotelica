import React, { Component } from "react";
import gql from "graphql-tag";
import { defaultName } from "../utils";
import AuthorshipAttributions from "./AuthorshipAttributions";
import AuthorTexts from "./AuthorTexts";
import AuthorEvents from "./AuthorEvents";
import EditableTextArea from "../EditableTextArea";
import { Button, message } from "antd";

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
    updaters: undefined,
    drafts: [],
    saving: false,
  }

  addDraft = (id) => {
    if (!this.isDrafted(id)) {
      this.setState(prev => ({
        drafts: [...prev.drafts, id]
      }))
    }
  }

  removeDraft = (id) => {
    if (this.isDrafted(id)) {
      this.setState(prev => ({
        drafts: prev.drafts.filter(x => x !== id)
      }))
    }
  }

  isDrafted = (id) => {
    return this.state.drafts.includes(id)
  }

  removeUpdater = (id) => {
    let curUpdaters = this.state.updaters || []
    const updaterIndex = curUpdaters.findIndex(x => x.id === id)
    try {
      curUpdaters.splice(updaterIndex, 1)
    } catch (e) {
      console.log("Updater not found in updater registry during deletion: ", id, e)
    }
    this.setState((prev) => ({
      updaters: curUpdaters
    }))
    this.removeDraft(id)
  }

  addUpdater = (updater) => {
    this.setState((prev) => {
      let curUpdaters = prev.updaters || []
      const updaterIndex = curUpdaters.findIndex(x => x.id === updater.id)
      if (updaterIndex > -1) {
        const curFuncs = curUpdaters[updaterIndex].funcs
        curUpdaters.splice(updaterIndex, 1, {
          id: updater.id,
          funcs: [...curFuncs, {
            func: updater.func,
            variables: updater.variables
          }]
        })
      } else {
        curUpdaters.push({
          id: updater.id,
          funcs: [{
            func: updater.func,
            variables: updater.variables
          }]
        })
      }
      return ({
        updaters: curUpdaters
      })
    })
    this.addDraft(updater.id)
  }

  addFlatUpdater = (updater) => {
    this.setState((prev) => {
      let curUpdaters = prev.updaters || []
      const updaterIndex = curUpdaters.findIndex(x => x.id === updater.id)
      if (updaterIndex > -1) {
        curUpdaters.splice(updaterIndex, 1, {
          id: updater.id,
          funcs: [{
            func: updater.func,
            variables: updater.variables
          }]
        })
      } else {
        curUpdaters.push({
          id: updater.id,
          funcs: [{
            func: updater.func,
            variables: updater.variables
          }]
        })
      }
      return ({
        updaters: curUpdaters
      })
    })
    this.addDraft(updater.id)
  }

  updateNestedProperties = ({ relation, data }) => {
    const newAuthor = this.state.author
    newAuthor[relation] = data
    this.setState({
      author: newAuthor,
    })
  }

  updateFlatProperties = ({ field, content }) => {
    const newAuthor = this.state.author
    newAuthor[field] = content
    this.setState({
      author: newAuthor,
    })
    this.addFlatUpdater({
      id: this.props.data.id,
      func: this.updatePerson,
      variables: {
        id: this.state.author.id,
        description: this.state.author.description,
        note: this.state.author.note,
        biography: this.state.author.biography,
        modified: new Date()
      }
    })
  }

  updatePerson = async (variables) => {
    const { error, data } = await this.props.client.mutate({
      mutation: UPDATE_PERSON,
      variables: variables,
    })
    if (error) {
      console.warn(error.message)
    }
    return data.UpdatePerson.id
  }

  saving = (func) => {
    this.setState({ saving: true }, func)
    setTimeout(() => { this.setState({ saving: false }) }, 200)
  }

  handleSave = () => {
    const { updaters } = this.state
    this.saving(() => {
      try {
        if (updaters) {
          updaters.forEach(updater => {
            updater.funcs.forEach(({ func, variables }) => {
              func(variables)
            })
          })
        }
      } catch (error) {
        message.error(
          `An error occurred during saving. 
          If the problem persists, please file a bug report.`
        )
        console.warn("Error during saving:", error)
      }
      message.success("Saved!")
    })
  }


  render() {

    const { auth, client } = this.props
    const { author } = this.state
    const { isAuthenticated } = auth
    const editable = isAuthenticated()

    return (
      <React.Fragment key={author.id}>
        <h1>{defaultName(author)}</h1>
        <section>
          <AuthorshipAttributions
            editable={editable}
            id={author.id}
            client={client}
            data={author.names}
            heading={'Names'}
            isDrafted={this.isDrafted}
            handleUpdate={this.updateNestedProperties}
            addUpdater={this.addUpdater}
            removeUpdater={this.removeUpdater}
          />
        </section>
        <section>
          <AuthorEvents
            editable={editable}
            id={author.id}
            client={client}
            data={author.events}
            heading={'Events'}
            isDrafted={this.isDrafted}
            handleUpdate={this.updateNestedProperties}
            addUpdater={this.addUpdater}
            removeUpdater={this.removeUpdater}
          />
        </section>
        <section>
          <EditableTextArea
            editable={editable}
            heading={'Description'}
            data={author}
            field={'description'}
            handleUpdate={this.updateFlatProperties}
          />
        </section>
        <section>
          <EditableTextArea
            editable={editable}
            heading={'Note'}
            data={author}
            field={'note'}
            handleUpdate={this.updateFlatProperties}
          />
        </section>
        <section>
          <EditableTextArea
            editable={editable}
            heading={'Biography'}
            data={author}
            field={'biography'}
            handleUpdate={this.updateFlatProperties}
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
        <Button
          type='primary'
          onClick={this.handleSave}
          loading={this.state.saving}
        >
          Save
        </Button>
      </React.Fragment>
    );
  }
}

export default AuthorEditor;