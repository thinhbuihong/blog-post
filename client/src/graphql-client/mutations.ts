import gql from "graphql-tag";

export const registerMutation = gql`
  mutation Regisrer($registerInput: RegisterInput!) {
    register(registerInput: $registerInput) {
      code
      success
      message
      user {
        id
        username
        email
      }
      errors {
        field
        message
      }
    }
  }
`;
