import React, { Component } from "react";
import gql from "graphql-tag";
import { createGUID, itemEventDatings } from '../utils';
import DatingList from "../DatingList";

const CREATE_TEXT_EVENT = gql`
  mutation createTextEvent(
    $eventid: ID!
    $textid: ID!
    $type: String!
  ) {
    CreateEvent(
      id: $eventid
      type: $type
    ) {
      id
    }
    AddTextEvents(
      textid: $textid
      eventid: $eventid
    ) {
      id
    }
  }
`

const REMOVE_TEXT_EVENT = gql`
  mutation removeTextEvents(
    $textid: ID!
    $eventid: ID!
  ) {
    RemoveTextEvents(
      textid: $textid
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

class TextEvents extends Component {

  createItemEvent = async (type) => {
    const { error, data } = await this.props.client.mutate({
      mutation: CREATE_TEXT_EVENT,
      variables: {
        eventid: createGUID(),
        textid: this.props.text.id,
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
      mutation: REMOVE_TEXT_EVENT,
      variables: {
        eventid: eventid,
        textid: this.props.text.id,
      },
      refetchQueries: ['textInfo'],
    });
    if (error) {
      console.warn(error.message)
    }
    return data.RemoveTextEvents.id
  }

  render() {
    const { text, client } = this.props
    const written = itemEventDatings(text, 'WRITTEN')

    return (
      <div>
        <h3>Written</h3>
        {<DatingList
          datings={written}
          item={text}
          client={client}
          type={'WRITTEN'}
          createItemEvent={this.createItemEvent}
          removeItemEvent={this.removeItemEvent}
          refetchQueries={['textInfo']}
        />}

      </div>
    );

  }
}

export default TextEvents