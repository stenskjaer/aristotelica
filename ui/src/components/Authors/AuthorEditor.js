import React, { Component } from "react";
import gql from "graphql-tag";
import { defaultName } from "../utils";
import AuthorshipAttributions from "./AuthorshipAttributions";
import AuthorTexts from "./AuthorTexts";
import AuthorEvents from "./AuthorEvents";
import EditableTextArea from "../EditableTextArea";
import { Alert, Button, message } from "antd";

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
    previous: [],
    updaters: [],
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

  // removeUpdater = (id) => {
  //   let curUpdaters = this.state.updaters || []
  //   const updaterIndex = curUpdaters.findIndex(x => x.id === id)
  //   try {
  //     curUpdaters.splice(updaterIndex, 1)
  //   } catch (e) {
  //     console.log("Updater not found in updater registry during deletion: ", id, e)
  //   }
  //   this.setState((prev) => ({
  //     updaters: curUpdaters
  //   }))
  //   this.removeDraft(id)
  // }

  // addUpdater = (updater) => {
  //   console.log("Adding upater:", updater)
  //   this.setState((prev) => {
  //     let curUpdaters = prev.updaters
  //     const updaterIndex = curUpdaters.findIndex(x => x.id === updater.id)
  //     if (updaterIndex > -1) {
  //       const curFuncs = curUpdaters[updaterIndex].funcs
  //       curUpdaters.splice(updaterIndex, 1, {
  //         id: updater.id,
  //         funcs: [...curFuncs, {
  //           func: updater.func,
  //           variables: updater.variables
  //         }]
  //       })
  //     } else {
  //       curUpdaters.push({
  //         id: updater.id,
  //         funcs: [{
  //           func: updater.func,
  //           variables: updater.variables
  //         }]
  //       })
  //     }
  //     return ({
  //       draftUpdaters: curUpdaters
  //     })
  //   })
  //   this.addDraft(updater.id)
  // }

  // addFlatUpdater = (updater) => {
  //   this.setState((prev) => {
  //     let curUpdaters = prev.updaters || []
  //     const updaterIndex = curUpdaters.findIndex(x => x.id === updater.id)
  //     if (updaterIndex > -1) {
  //       curUpdaters.splice(updaterIndex, 1, {
  //         id: updater.id,
  //         funcs: [{
  //           func: updater.func,
  //           variables: updater.variables
  //         }]
  //       })
  //     } else {
  //       curUpdaters.push({
  //         id: updater.id,
  //         funcs: [{
  //           func: updater.func,
  //           variables: updater.variables
  //         }]
  //       })
  //     }
  //     return ({
  //       draftUpdaters: curUpdaters
  //     })
  //   })
  //   this.addDraft(updater.id)
  // }

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
              ...curVars,
              ...updater.variables
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
    }, [...previous])
    console.log("Created updated updaters:", updated)
    return updated
  }

  update = ({ relation, data, updaters, operation }) => {
    console.log("Received data: ", data)
    console.log("Received operation:", operation)
    let newUpdaters
    if (operation === 'update' || operation === 'add') {
      console.log("Updating or adding")
      newUpdaters = this.mergeUpdaters({ updaters, previous: this.state.updaters })
    } else if (operation === 'remove') {
      console.log("Remove old updaters for ID and add new ones.")
      newUpdaters = this.mergeUpdaters({ updaters, previous: this.state.updaters.filter(x => x.id !== data.id) })
    }

    this.setState(state => ({
      author: {
        ...state.author,
        [relation]: data
      },
      updaters: newUpdaters,
      previous: [...state.previous, state]
    }), () => console.log("After state update:", this.state))
  }

  // updateFlatProperties = ({ field, content }) => {
  //   this.update({ relation: field, data: content })
  //   this.addFlatUpdater({
  //     id: this.state.author.id,
  //     func: this.updatePerson,
  //     variables: {
  //       id: this.state.author.id,
  //       description: this.state.author.description,
  //       note: this.state.author.note,
  //       biography: this.state.author.biography,
  //       modified: new Date()
  //     }
  //   })
  // }

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
      if (updaters) {
        updaters.forEach(updater => {
          console.log("Saving:", updater)
          updater.funcs.forEach(({ func, variables }) => {
            console.log("Saving:", func, variables)
            func(variables)
          })
        })
      }
      message.success("Saved!")
    })
    this.setState({
      updaters: [],
      drafts: [],
      previous: []
    })
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
            addDraft={this.addDraft}
            handleUpdate={this.update}
            addUpdater={this.addUpdater}
            removeUpdater={this.removeUpdater}
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
            addUpdater={this.addUpdater}
            removeUpdater={this.removeUpdater}
          />
        </section>
        <section>
          <EditableTextArea
            editable={editable}
            heading={'Description'}
            data={this.state.author}
            field={'description'}
            updater={this.updatePerson}
            handleUpdate={this.update}
          />
        </section>
        <section>
          <EditableTextArea
            editable={editable}
            heading={'Note'}
            data={this.state.author}
            field={'note'}
            updater={this.updatePerson}
            handleUpdate={this.update}
          />
        </section>
        <section>
          <EditableTextArea
            editable={editable}
            heading={'Biography'}
            data={this.state.author}
            field={'biography'}
            updater={this.updatePerson}
            handleUpdate={this.update}
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
        <Button
          onClick={this.handleUndo}
        >
          Undo
        </Button>
        <Button
          onClick={this.handleCancel}
        >
          Cancel all
        </Button>
      </React.Fragment>
    );
  }
}

export default AuthorEditor;