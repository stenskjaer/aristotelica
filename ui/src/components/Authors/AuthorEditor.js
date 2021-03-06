import React, { Component } from "react";
import { defaultName } from "../../utils/functions";
import AuthorshipAttributions from "./AuthorshipAttributions";
import AuthorTexts from "./AuthorTexts";
import AuthorEvents from "./AuthorEvents";
import EditableTextArea from "../EditableTextArea";
import { Alert, Button, message } from "antd";
import { UPDATE_PERSON } from "../GQL/Mutations";

const updatePerson = async ({ variables, client }) => {
  const { error, data } = await client.mutate({
    mutation: UPDATE_PERSON,
    variables: variables,
  })
  if (error) {
    console.warn(error.message)
  }
  return data.UpdatePerson.id
}

class AuthorEditor extends Component {
  state = {
    author: this.props.data,
    previous: [],
    updaters: [],
    drafts: [],
    saving: false,
  }

  isDrafted = (id) => {
    return this.state.drafts.includes(id)
  }

  mergeUpdaters = ({ updaters, previous }) => {
    console.log("Merging updaters", updaters, previous)
    const updated = updaters.reduce((previous, updater) => {
      console.log("Reducing, previous:", previous)
      console.log("Reducing, updater:", updater)
      const updaterIndex = previous.findIndex(x => x.id === updater.id)
      if (updaterIndex > -1) {
        const curFuncs = updater.strategy === 'accumulate'
          ? previous[updaterIndex].funcs
          : []
        const curVars = updater.strategy === 'merge'
          ? previous[updaterIndex].funcs[0].variables
          : {}
        previous.splice(updaterIndex, 1, {
          id: updater.id,
          funcs: [...curFuncs, {
            func: updater.func,
            variables: {
              client: updater.variables.client,
              variables: {
                ...curVars.variables,
                ...updater.variables.variables
              }
            }
          }]
        })
      } else {
        previous.push({
          id: updater.id,
          funcs: [{
            func: updater.func,
            variables: updater.variables
          }]
        })
      }
      console.log("Created accumlator:", previous)
      return previous
    }, previous)
    console.log("Created updated updaters:", updated)
    return updated
  }

  update = ({ relation, data, updaters, operation, id }) => {
    console.log("Received data: ", data)
    console.log("Received id:", id)
    console.log("Received operation:", operation)
    let newUpdaters
    let newDrafts
    if (operation === 'update' || operation === 'add') {
      console.log("Updating or adding")
      newDrafts = this.isDrafted(id) ? this.state.drafts : [...this.state.drafts, id]
      newUpdaters = this.mergeUpdaters({ updaters, previous: this.state.updaters })
    } else if (operation === 'remove') {
      console.log("Remove old updaters for ID and add new ones.")
      newDrafts = this.state.drafts.filter(x => x !== id)
      newUpdaters = this.mergeUpdaters({ updaters, previous: this.state.updaters.filter(x => x.id !== id) })
    }

    this.setState(state => ({
      author: {
        ...state.author,
        [relation]: data
      },
      updaters: newUpdaters,
      drafts: newDrafts,
      previous: [...state.previous, state]
    }), () => console.log("After state update:", this.state))
  }

  saving = (func) => {
    this.setState({ saving: true }, func)
    setTimeout(() => { this.setState({ saving: false }) }, 200)
  }

  handleSave = () => {
    const { updaters } = this.state

    const flattenUpdaters = updaters => updaters.reduce((acc, item) => (
      acc.concat(...item.funcs.map(x => x.func(x.variables)))),
      []
    )

    this.setState({ saving: true })
    if (updaters) {
      Promise.all(flattenUpdaters(updaters))
        .then((res) => {
          message.success("Saved!")
          this.setState({
            saving: false,
            updaters: [],
            drafts: [],
            previous: []
          })
        })
        .catch((error) => {
          message.error("An error occurred. If it persists, please contact the administrator.")
          console.warn("There was an error during saving. ", error)
          this.setState({
            saving: false,
          })
        })
    }
  }

  handleUndo = () => {
    this.setState(this.state.previous[this.state.previous.length - 1])
  }

  handleCancel = () => {
    this.setState(this.state.previous[0])
  }

  render() {
    console.log("state: ", this.state)

    const { auth, client } = this.props
    const { author } = this.state
    const { isAuthenticated } = auth
    const editable = isAuthenticated()

    return (
      <React.Fragment key={this.props.id}>
        {this.state.updaters.length > 0 &&
          <Alert message="There are unsaved changes for this item." type="info" showIcon />
        }
        <h1>{defaultName(author)}</h1>
        <section>
          <AuthorshipAttributions
            editable={editable}
            id={author.id}
            client={client}
            data={this.state.author.names}
            heading={'Names'}
            isDrafted={this.isDrafted}
            handleUpdate={this.update}
          />
        </section>
        <section>
          <AuthorEvents
            editable={editable}
            id={author.id}
            client={client}
            data={this.state.author.events}
            heading={'Events'}
            isDrafted={this.isDrafted}
            handleUpdate={this.update}
          />
        </section>
        <section>
          <EditableTextArea
            editable={editable}
            heading={'Description'}
            data={this.state.author}
            client={client}
            field={'description'}
            updater={updatePerson}
            handleUpdate={this.update}
          />
        </section>
        <section>
          <EditableTextArea
            editable={editable}
            heading={'Note'}
            data={this.state.author}
            client={client}
            field={'note'}
            updater={updatePerson}
            handleUpdate={this.update}
          />
        </section>
        <section>
          <EditableTextArea
            editable={editable}
            heading={'Biography'}
            data={this.state.author}
            client={client}
            field={'biography'}
            updater={updatePerson}
            handleUpdate={this.update}
          />
        </section>
        <section>
          <AuthorTexts
            editable={editable}
            id={author.id}
            client={client}
            heading={'Attributed texts'}
            data={this.state.author.attributions}
            isDrafted={this.isDrafted}
            handleUpdate={this.update}
            author={author}
          />
        </section>
        <h3>TODOS</h3>
        <section>
          <h2>Resources</h2>
        </section>
        <section>
          <h2>Literature</h2>
        </section>
        {editable &&
          <section>
            <Button type='primary'
              onClick={this.handleSave}
              loading={this.state.saving}>
              Save
            </Button>
            <Button onClick={this.handleUndo}>
              Undo
            </Button>
            <Button onClick={this.handleCancel}>
              Cancel all
            </Button>
          </section>
        }

      </React.Fragment>
    );
  }
}

export default AuthorEditor;