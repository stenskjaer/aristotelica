import React, { Component } from "react";
import { Query } from "react-apollo";
import { MANUSCRIPT_DETAILS } from "../GQL/Queries";
import { UPDATE_MANUSCRIPT } from "../GQL/Mutations";
import ManuscriptEditor from "./ManuscriptEditor";
import EditableTextArea from "../EditableTextArea";

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
              <ManuscriptEditor data={manuscript} client={client} {...this.props}>
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
                />
                <EditableTextArea
                  key={createKey('olim')}
                  heading={'Olim'}
                  field={'olim'}
                />
                <EditableTextArea
                  key={createKey('date')}
                  heading={'Date'}
                  field={'date'}
                />
                <EditableTextArea
                  key={createKey('date_earliest')}
                  heading={'Date_earliest'}
                  field={'date_earliest'}
                />
                <EditableTextArea
                  key={createKey('date_latest')}
                  heading={'Date_latest'}
                  field={'date_latest'}
                />
                <EditableTextArea
                  key={createKey('saeculo')}
                  heading={'Saeculo'}
                  field={'saeculo'}
                />
              </ManuscriptEditor>
            </React.Fragment>
          )
        }}
      </Query>
    );
  }
}

export default ManuscriptDetails;