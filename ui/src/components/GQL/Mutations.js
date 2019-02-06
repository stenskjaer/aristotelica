import gql from "graphql-tag";

export const CREATE_ATTRIBUTION = gql`
  mutation CreateTextAttribution(
    $id: ID!,
    $textid: ID!,
    $personid: ID!,
    $note: String,
    $source: String,
    $certainty: AttributionCertainty
  ) {
    CreateTextAttribution(
      id: $id,
      textid: $textid,
      personid: $personid,
    ) {
      __typename
      id
      person {
        id
      }
      text {
        id
        title
      }
    }
    UpdateAttribution(
      id: $id
      note: $note,
      source: $source,
      certainty: $certainty
    ) {
      __typename
      id
      note
      source
      certainty
    }
  }
`

export const DELETE_ATTRIBUTION = gql`
  mutation deleteAttribution(
    $id: ID!
  ) {
    DeleteAttribution(
      id: $id
    ) {
      id
    }
  }
`

export const DELETE_DATING = gql`
  mutation deleteDating($datingid: ID!) {
    DeleteDating(id: $datingid) {
      id
    }
  }
`

export const DELETE_DATE = gql`
 mutation deleteDate(
   $dateid: ID!
 ) {
  DeleteDate(
    id: $dateid
  ) {id}
 }
`

export const REMOVE_DATING_DATE = gql`
  mutation removeDatingDate(
    $datingid: ID!
    $dateid: ID!
  ) {
    RemoveDatingDates(
      datingid: $datingid
      dateid: $dateid 
    ) {
      id
    } 
    DeleteDate(
      id: $dateid
    ) {
      id
    }
  }
`

export const DELETE_DATES_FROM_DATING = gql`
  mutation deleteDatingFromDating($datingid: ID!) {
    DeleteRelatedDates(datingid: $datingid) {
      id
    }
  }
`

export const REMOVE_DATING_EVENT = gql`
  mutation removeDatingEvent(
    $datingid: ID!
    $eventid: ID!
  ) {
    RemoveDatingEvent(
      datingid: $datingid
      eventid: $eventid 
    ) {
      id
    } 
    DeleteDating(
      id: $datingid
    ) {
      id
    }
  }
`

export const CREATE_PERSON_EVENT = gql`
  mutation createPersonEvent(
    $eventid: ID!
    $personid: ID!
    $type: String!
    $description: String
  ) {
    CreateEvent(
      id: $eventid
      type: $type
      description: $description
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

export const UPDATE_PERSON = gql`
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

export const UPDATE_PERSON_EVENT = gql`
  mutation updatePersonEvent(
    $eventid: ID!
    $type: String!
    $description: String
  ) {
    UpdateEvent(
      id: $eventid
      type: $type
      description: $description
    ) {
      id
    }
  }
`

export const REMOVE_PERSON_EVENT = gql`
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

export const UPDATE_MANUSCRIPT = gql`
  mutation UpdateManuscript(
    $id: ID!
    $shelfmark: String
    $number: String
    $olim: String
    $width: String
    $height: String
    $material: String
    $layout: String
    $annotation: String
    $script: String
    $note: String
    $literature: String
  ) {
    UpdateManuscript(
      id: $id
      shelfmark: $shelfmark
      number: $number
      olim: $olim
      width: $width
      height: $height
      material: $material
      layout: $layout
      annotation: $annotation
      script: $script
      note: $note
      literature: $literature
    ) {
      id
    }
  }
`

export const CREATE_MANUSCRIPT_EVENT = gql`
  mutation createManuscriptEvent(
    $eventid: ID!
    $manuscriptid: ID!
    $type: String!
    $description: String
  ) {
    CreateEvent(
      id: $eventid
      type: $type
      description: $description
    ) {
      id
    }
    AddManuscriptEvents(
      manuscriptid: $manuscriptid
      eventid: $eventid
    ) {
      id
    }
  }
`

export const UPDATE_MANUSCRIPT_EVENT = gql`
  mutation updateManuscriptEvent(
    $eventid: ID!
    $type: String!
    $description: String
  ) {
    UpdateEvent(
      id: $eventid
      type: $type
      description: $description
    ) {
      id
    }
  }
`

export const REMOVE_MANUSCRIPT_EVENT = gql`
  mutation removeManuscriptEvents(
    $manuscriptid: ID!
    $eventid: ID!
  ) {
    RemoveManuscriptEvents(
      manuscriptid: $manuscriptid
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