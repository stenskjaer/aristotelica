import React, { Component } from "react";
import gql from "graphql-tag";
import { createGUID, itemEventDatings } from '../utils';
import DatingList from "../DatingList";

const CREATE_PERSON_EVENT = gql`
  mutation createPersonEvent(
    $eventid: ID!
    $personid: ID!
    $type: String!
  ) {
    CreateEvent(
      id: $eventid
      type: $type
    ) {
      id
    }
    AddPersonEvents(
      personid: $personid
      eventid: $eventid
    ) {
      id
    }
  }
`

const REMOVE_PERSON_EVENT = gql`
  mutation removePersonEvents(
    $personid: ID!
    $eventid: ID!
  ) {
    RemovePersonEvents(
      personid: $personid
      eventid: $eventid
    ) {
      id
    }
    DeleteEvent(
      id: $eventid
    ) {
      id
    }
  }
`

class AuthorEvents extends Component {

  createItemEvent = async (type) => {
    const { error, data } = await this.props.client.mutate({
      mutation: CREATE_PERSON_EVENT,
      variables: {
        eventid: createGUID(),
        personid: this.props.author.id,
        type: type
      },
    });
    if (error) {
      console.warn(error.message)
    }
    return data.CreateEvent.id
  }

  removeItemEvent = async (eventid) => {
    const { error, data } = await this.props.client.mutate({
      mutation: REMOVE_PERSON_EVENT,
      variables: {
        eventid: eventid,
        personid: this.props.author.id,
      },
    });
    if (error) {
      console.warn(error.message)
    }
    return data.RemovePersonEvents.id
  }

  render() {
    const { author, client } = this.props
    const birth = itemEventDatings(author, 'BIRTH')
    const death = itemEventDatings(author, 'DEATH')
    const other = itemEventDatings(author, 'OTHER')

    return (
      <div>
        <h3>Birth</h3>
        {<DatingList
          datings={birth}
          item={author}
          client={client}
          type={'BIRTH'}
          editable={this.props.editable}
          createItemEvent={this.createItemEvent}
          removeItemEvent={this.removeItemEvent}
          refetchQueries={['authorInfo']}
        />}

        <h3>Death</h3>
        {<DatingList
          datings={death}
          item={author}
          client={client}
          type={'DEATH'}
          createItemEvent={this.createItemEvent}
          removeItemEvent={this.removeItemEvent}
          refetchQueries={['authorInfo']}
        />}

        <h3>Other</h3>
        {<DatingList
          datings={other}
          item={author}
          client={client}
          type={'OTHER'}
          createItemEvent={this.createItemEvent}
          removeItemEvent={this.removeItemEvent}
          refetchQueries={['authorInfo']}
        />}

      </div>
    );

  }
}

export default AuthorEvents