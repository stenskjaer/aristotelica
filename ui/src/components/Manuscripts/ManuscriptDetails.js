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
import SelectLibrary from "./SelectLibrary";

const updateManuscript = async ({ variables, client }) => {
  const { error, data } = await client.mutate({
    mutation: UPDATE_MANUSCRIPT,
    variables: variables,
    refetchQueries: ['manuscriptDetails', 'allManuscripts']
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
      refetchQueries: ['manuscriptDetails', 'allManuscripts']
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
      refetchQueries: ['manuscriptDetails', 'allManuscripts']
    });
  },
  deleteItemEvent: async ({ variables, client }) => {
    await client.mutate({
      mutation: REMOVE_MANUSCRIPT_EVENT,
      variables: {
        eventid: variables.eventid,
        manuscriptid: variables.itemid,
      },
      refetchQueries: ['manuscriptDetails', 'allManuscripts']
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
                <section key="events-section">
                  <EventsEditor
                    editableField={true}
                    key={createKey('events')}
                    heading={'Events'}
                    {...eventMutations}
                  />
                </section>
                <section key="location-section">
                  <h2 key="location">Location</h2>
                  <SelectLibrary
                    editableField={true}
                    key={createKey('library')}
                    heading={'Library'}
                  />
                  <EditableTextArea
                    editableField={true}
                    key={createKey('shelfmark')}
                    heading={'Shelfmark'}
                    field={'shelfmark'}
                    updater={updateManuscript}
                  />
                  <EditableTextArea
                    editableField={true}
                    key={createKey('signature')}
                    heading={'Signature'}
                    field={'number'}
                    updater={updateManuscript}
                  />
                  <EditableTextArea
                    editableField={true}
                    key={createKey('olim')}
                    heading={'Olim'}
                    field={'olim'}
                    updater={updateManuscript}
                  />
                </section>
                <section key="physique-section">
                  <h2 key="physique">Physique</h2>
                  <EditableTextArea
                    editableField={true}
                    key={createKey('width')}
                    heading={'Width'}
                    field={'width'}
                    updater={updateManuscript}
                  />
                  <EditableTextArea
                    editableField={true}
                    key={createKey('height')}
                    heading={'Height'}
                    field={'height'}
                    updater={updateManuscript}
                  />
                  <EditableTextArea
                    editableField={true}
                    key={createKey('material')}
                    heading={'Material'}
                    field={'material'}
                    updater={updateManuscript}
                  />
                </section>
                <section key="surface-section">
                  <h2 key="appearance">Surface appearance</h2>
                  <EditableTextArea
                    editableField={true}
                    key={createKey('layout')}
                    heading={'Layout'}
                    field={'layout'}
                    updater={updateManuscript}
                  />
                  <EditableTextArea
                    editableField={true}
                    key={createKey('annotation')}
                    heading={'Annotation'}
                    field={'annotation'}
                    updater={updateManuscript}
                  />
                  <EditableTextArea
                    editableField={true}
                    key={createKey('script')}
                    heading={'Script'}
                    field={'script'}
                    updater={updateManuscript}
                  />
                </section>
                <section key="notes-section">
                  <h2 key='notes-header'>Notes and resources</h2>
                  <EditableTextArea
                    editableField={true}
                    key={createKey('note')}
                    heading={'Note'}
                    field={'note'}
                    updater={updateManuscript}
                  />
                  <EditableTextArea
                    editableField={true}
                    key={createKey('literature')}
                    heading={'Literature'}
                    field={'literature'}
                    updater={updateManuscript}
                  />
                </section>
              </ItemEditor>
            </React.Fragment>
          )
        }}
      </Query>
    );
  }
}

export default ManuscriptDetails;