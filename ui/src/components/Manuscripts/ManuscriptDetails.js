import React, { Component } from "react";
import { Query } from "react-apollo";
import { MANUSCRIPT_DETAILS } from "../GQL/Queries";
import { UPDATE_MANUSCRIPT } from "../GQL/Mutations";
import {
  CREATE_MANUSCRIPT_EVENT,
  UPDATE_MANUSCRIPT_EVENT,
  REMOVE_MANUSCRIPT_EVENT,
} from '../GQL/Mutations';
import ItemEditor from "../Editors/ItemEditor";
import EditableTextArea from "../EditableTextArea";
import EventsEditor from "../Editors/EventsEditor";

const updateManuscript = async ({ variables, client }) => {
  const { error, data } = await client.mutate({
    mutation: UPDATE_MANUSCRIPT,
    variables: variables,
  })
  if (error) {
    console.warn(error.message)
  }
  return data.UpdateManuscript.id
}

const eventMutations = {
  createItemEvent: async ({ variables, client }) => {
    await client.mutate({
      mutation: CREATE_MANUSCRIPT_EVENT,
      variables: {
        eventid: variables.eventid,
        manuscriptid: variables.itemid,
        type: variables.type,
        description: variables.description
      },
    })
  },
  updateItemEvent: async ({ variables, client }) => {
    await client.mutate({
      mutation: UPDATE_MANUSCRIPT_EVENT,
      variables: {
        eventid: variables.eventid,
        manuscriptid: variables.itemid,
        type: variables.type,
        description: variables.description
      },
    });
  },
  deleteItemEvent: async ({ variables, client }) => {
    await client.mutate({
      mutation: REMOVE_MANUSCRIPT_EVENT,
      variables: {
        eventid: variables.eventid,
        manuscriptid: variables.itemid,
      },
    });
  }
}

class ManuscriptDetails extends Component {

  render() {
    return (
      <Query query={MANUSCRIPT_DETAILS} variables={{ id: this.props.match.params.id }} >
        {({ loading, error, data, client }) => {

          if (loading) return <div>Fetching</div>
          if (error) return <div>{error.message}</div>

          const manuscript = data.Manuscript[0] || undefined
          if (!manuscript) {
            return <div>Error: The manuscript does not exist.</div>
          }
          const createKey = (suffix) => `${manuscript.id}_${suffix}`
          const createMsTitle = () => `${manuscript.library.name}: ${manuscript.shelfmark} ${manuscript.number}`

          return (
            <React.Fragment>
              <h1>{createMsTitle()}</h1>
              <ItemEditor data={manuscript} client={client} {...this.props}>
                <EventsEditor
                  key={createKey('events')}
                  heading={'Events'}
                  {...eventMutations}
                />
                <EditableTextArea
                  key={createKey('shelfmark')}
                  heading={'Shelfmark'}
                  field={'shelfmark'}
                  updater={updateManuscript}
                />
                <EditableTextArea
                  key={createKey('identifier')}
                  heading={'Identifier'}
                  field={'number'}
                  updater={updateManuscript}
                />
                <EditableTextArea
                  key={createKey('olim')}
                  heading={'Olim'}
                  field={'olim'}
                  updater={updateManuscript}
                />
                <EditableTextArea
                  key={createKey('date')}
                  heading={'Date'}
                  field={'date'}
                  updater={updateManuscript}
                />
                <EditableTextArea
                  key={createKey('date_earliest')}
                  heading={'Date_earliest'}
                  field={'date_earliest'}
                  updater={updateManuscript}
                />
                <EditableTextArea
                  key={createKey('date_latest')}
                  heading={'Date_latest'}
                  field={'date_latest'}
                  updater={updateManuscript}
                />
                <EditableTextArea
                  key={createKey('saeculo')}
                  heading={'Saeculo'}
                  field={'saeculo'}
                  updater={updateManuscript}
                />
              </ItemEditor>
            </React.Fragment>
          )
        }}
      </Query>
    );
  }
}

export default ManuscriptDetails;