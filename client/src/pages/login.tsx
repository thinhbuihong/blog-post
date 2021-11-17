import { ApolloError } from "@apollo/client";
import { Button } from "@chakra-ui/button";
import { Flex, Link } from "@chakra-ui/layout";
import { Spinner, useToast } from "@chakra-ui/react";
import { Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/dist/client/router";
import NextLink from "next/link";
import InputField from "../components/inputField";
import Wrapper from "../components/Wrapper";
import {
  CurrentUserDocument,
  CurrentUserQuery,
  LoginInput,
  useLoginMutation,
} from "../generated/graphql";
import { mapFieldErrorsApollo } from "../helpers/mapFieldErrors";
import { initializeApollo } from "../lib/apolloClient";
import { useCheckAuth } from "../utils/useCheckAuth";
// import { registerMutation } from "../graphql-client/mutations/mutations";

const Login = () => {
  const { data: authData, loading: authLoading } = useCheckAuth();
  const toast = useToast();

  const inittialValues: LoginInput = {
    password: "",
    usernameOrEmail: "",
  };
  const router = useRouter();

  const [loginUser, { loading: _loginUserLoading }] = useLoginMutation();
  // const [registerUser, { data, error }] = useMutation<
  //   { register: UserMutationResponse },
  //   { registerInput: NewUserInput }
  // >(registerMutation);

  const onLoginSubmit = async (
    values: LoginInput,
    { setErrors, resetForm }: FormikHelpers<LoginInput>
  ) => {
    try {
      await loginUser({
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

      resetForm();

      toast({
        title: "welcome",
        description: "logged in successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      const apolloClient = initializeApollo({});
      apolloClient.resetStore();

      router.push("/");
    } catch (error) {
      if (error instanceof ApolloError) {
        setErrors(mapFieldErrorsApollo(error));
      }
    }
  };

  return (
    <>
      {authLoading || (!authLoading && authData?.currentUser) ? (
        <Flex justifyContent="center" alignItems="center" minH="100vh">
          <Spinner></Spinner>
        </Flex>
      ) : (
        <Wrapper size="small">
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

                <Flex mt={2}>
                  <NextLink href="/forgot-password">
                    <Link ml="auto">Forgot password</Link>
                  </NextLink>
                </Flex>

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
      )}
    </>
  );
};

export default Login;
