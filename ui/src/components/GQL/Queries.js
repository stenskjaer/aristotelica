import gql from "graphql-tag";

export const TEXTS = gql`
  query allTexts {
    Text(orderBy: title_asc) {
      id
      title
      authors {
        names {
          value
        }
      }
    }
}
`

export const ALL_MANUSCRIPTS = gql`
  query allManuscripts {
    Manuscript {
      id
      shelfmark
      number
      olim
      date
      date_earliest
      date_latest
      saeculo
      library {
        id
        name
        city {
          id
          name
          country {
            id
            name
          }
        }
      }
    }
  }
`