import { Button } from "@chakra-ui/button";
import { Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/dist/client/router";
import InputField from "../components/inputField";
import Wrapper from "../components/Wrapper";
import {
  CurrentUserDocument,
  CurrentUserQuery,
  LoginInput,
  useLoginMutation,
} from "../generated/graphql";
import { mapFieldErrors } from "../helpers/mapFieldErrors";
// import { registerMutation } from "../graphql-client/mutations/mutations";

const Login = () => {
  const inittialValues: LoginInput = {
    password: "",
    usernameOrEmail: "",
  };
  const router = useRouter();

  const [loginUser, { loading: _loginUserLoading, data }] = useLoginMutation();
  // const [registerUser, { data, error }] = useMutation<
  //   { register: UserMutationResponse },
  //   { registerInput: NewUserInput }
  // >(registerMutation);

  const onLoginSubmit = async (
    values: LoginInput,
    { setErrors, resetForm }: FormikHelpers<LoginInput>
  ) => {
    const response = await loginUser({
      variables: {
        loginInput: values,
      },
      update(cache, { data }) {
        // const currentUser = cache.readQuery({query: CurrentUserDocument});
        if (data?.login.success) {
          cache.writeQuery<CurrentUserQuery>({
            query: CurrentUserDocument,
            data: { currentUser: data.login.user },
          });
        }
      },
    });

    if (response.data?.login.errors) {
      setErrors(mapFieldErrors(response.data.login.errors));
    } else {
      resetForm();
      router.push("/");
    }
  };

  return (
    <Wrapper>
      {data && data.login.success && (
        <p>logged in successfully {JSON.stringify(data)}</p>
      )}

      <Formik initialValues={inittialValues} onSubmit={onLoginSubmit}>
        {({}) => (
          <Form>
            <InputField
              name="usernameOrEmail"
              label="Username or Email"
              placeholder="Username or Email"
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
              isLoading={_loginUserLoading}
            >
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Login;
