import { ValidationError } from "class-validator";
import { FieldError } from "../types/FieldError";

export const mapFieldErrors = (errors: ValidationError[]): FieldError[] => {
  return errors.map<FieldError>((e) => ({
    field: e.property,
    message: Object.values<string>(e.constraints!).join(" -- "),
  }));
};
