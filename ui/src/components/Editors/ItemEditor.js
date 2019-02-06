import React, { Component } from "react";
import { Alert, Button, message } from "antd";

class ItemEditor extends Component {
  state = {
    data: this.props.data,
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

  update = ({ relation, data: newData, updaters, operation, id }) => {
    console.log("Received data: ", newData)
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
      data: {
        ...state.data,
        [relation]: newData
      },
      updaters: newUpdaters,
      drafts: newDrafts,
      previous: [...state.previous, state]
    }), () => console.log("After state update:", this.state))
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

    const { auth, client } = this.props
    const { data } = this.state
    const { isAuthenticated } = auth
    const editable = isAuthenticated()
    const editorProps = {
      editable,
      data,
      client,
      handleUpdate: this.update,
      isDrafted: this.isDrafted
    }

    const makeChildrenWithProps = (children) => {
      /*
      Deep copy of children. 
      If they have the pop "editableField" they will get the editor props
      */
      if (Array.isArray(children)) {
        return children.map(child => {
          if (child.props.children) {
            return React.cloneElement(child, child.props, makeChildrenWithProps(child.props.children))
          }
          return React.cloneElement(child, child.props.editableField && editorProps)
        })
      } else if (typeof children === 'string') {
        return children
      }
      return React.cloneElement(children, { ...editorProps })
    }

    return (
      <React.Fragment key={this.props.id}>
        {this.state.updaters.length > 0 &&
          <Alert message="There are unsaved changes for this item." type="info" showIcon />
        }
        {makeChildrenWithProps(this.props.children)}
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

export default ItemEditor;