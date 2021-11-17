import { ApolloError } from "@apollo/client";
import { FieldError } from "../generated/graphql";

export const mapFieldErrors = (
  errors: FieldError[]
): { [key: string]: string } => {
  return errors.reduce((acc, error) => {
    return {
      ...acc,
      [error.field]: error.message,
    };
  }, {});
};

export const mapFieldErrorsApollo = (error: ApolloError) => {
  const errors = error.graphQLErrors[0].extensions?.exception.validationErrors;
  return errors.reduce((acc: any, err: any) => {
    return {
      ...acc,
      [err.property]: Object.values(err.constraints).join(" - "),
    };
  }, {});
};
