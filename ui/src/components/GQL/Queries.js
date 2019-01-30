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