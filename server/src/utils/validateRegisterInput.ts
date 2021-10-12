import { RegisterInput } from "../types/RegisterInput";

export const validateRegisterInput = (registerInput: RegisterInput) => {
  if (!registerInput.email.includes("@")) {
    return {
      message: "invalid email",
      errors: [
        {
          field: "email",
          message: "email must include @ sysbol",
        },
      ],
    };
  }

  if (registerInput.username.length <= 4) {
    return {
      message: "invalid username",
      errors: [
        {
          field: "username",
          message: "length must be greater than 4",
        },
      ],
    };
  }
  if (registerInput.username.includes("@")) {
    return {
      message: "invalid username",
      errors: [
        {
          field: "username",
          message: "username cannot include @",
        },
      ],
    };
  }

  if (registerInput.password.length <= 4) {
    return {
      message: "invalid password",
      errors: [
        {
          field: "password",
          message: "password must be greater than 4",
        },
      ],
    };
  }
  return null;
};
