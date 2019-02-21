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

export const ALL_LIBRARIES = gql`
  query allLibraries {
    Library {
    id
    name
    short_name
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
`

export const DATING = gql`
  query dating($id: ID!) {
    Dating(id: $id) {
      id
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
      layout
      annotation
      script
      note
      literature
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
      events {
        id
        type
        datings {
          id
          source
          note
          type
          dates {
            id
            type
            approximate
            uncertain
            decade
            quarter
            century
            year {
              id
              value
            }
            month {
              id
              value
            }
            day {
              id
              value
            }
          }
        }
      }
      manifestations {
        id 
        incipit
        explicit
        folios
        text {
          id
          title
          attributions {
            id
            person {
              id
              names {
                id
                value
                language
              }
            }
          }
        }
      }
    }
  }
`

export const MANUSCRIPT_DETAILS = gql`
  query manuscriptDetails($id: ID!) {
    Manuscript(id: $id) {
      id
      shelfmark
      number
      olim
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
      events {
        id
        type
        description
        datings {
          id
          source
          note
          type
          dates {
            id
            type
            approximate
            uncertain
            decade
            quarter
            century
            year {
              id
              value
            }
            month {
              id
              value
            }
            day {
              id
              value
            }
          }
        }
      }
    }
  }
`
