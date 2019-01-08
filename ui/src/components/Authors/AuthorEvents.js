import React, { Component } from "react";
import gql from "graphql-tag";
import DescriptionList from "../DescriptionList";
import DatingList from "../DatingList";
import { itemEventDatings } from "../Events";
import { Link } from 'react-router-dom';



class AuthorEvents extends Component {

  render() {
    const author = this.props.author
    const birth = itemEventDatings(author, 'BIRTH')
    const death = itemEventDatings(author, 'DEATH')
    const other = itemEventDatings(author, 'OTHER')

    return (
      <div>
        {(birth.length > 0) &&
          <DatingList datings={birth} title={'Birth'} />}

      </div>
    );
  }
}

export default AuthorEvents