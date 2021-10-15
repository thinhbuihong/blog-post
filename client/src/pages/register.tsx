import { useMutation } from "@apollo/client";
import { Button } from "@chakra-ui/button";
import { Form, Formik } from "formik";
import InputField from "../components/inputField";
import Wrapper from "../components/Wrapper";
import { registerMutation } from "../graphql-client/mutations";

interface UserMutationResponse {
  code: number;
  success: boolean;
  message: string;
  user: string;
  errors: string;
}

interface NewUserInput {
  username: string;
  email: string;
  password: string;
}

const Register = () => {
  const inittialValues: NewUserInput = {
    username: "",
    password: "",
    email: "",
  };

  const [registerUser, { data, error }] = useMutation<
    { register: UserMutationResponse },
    { registerInput: NewUserInput }
  >(registerMutation);

  const onRegisterSubmit = (values: NewUserInput) => {
    return registerUser({
      variables: { registerInput: values },
    });
  };

  return (
    <Wrapper>
      {error && <p>failed to register</p>}
      {data && data.register.success && (
        <p>Register successfully {JSON.stringify(data)}</p>
      )}

      <Formik initialValues={inittialValues} onSubmit={onRegisterSubmit}>
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              label="Username"
              placeholder="Username"
            ></InputField>

            <InputField
              name="email"
              label="Email"
              placeholder="Email"
              type="email"
            ></InputField>

            <InputField
              name="password"
              label="Password"
              placeholder="Password"
              type="password"
            ></InputField>

            <Button
              type="submit"
              colorScheme="teal"
              mt={4}
              isLoading={isSubmitting}
            >
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
