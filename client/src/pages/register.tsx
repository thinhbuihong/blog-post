import { useMutation } from "@apollo/client";
import { Button } from "@chakra-ui/button";
import { Flex } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/spinner";
import { Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/dist/client/router";
import InputField from "../components/inputField";
import Wrapper from "../components/Wrapper";
import {
  CurrentUserDocument,
  CurrentUserQuery,
  RegisterInput,
  useRegisrerMutation,
} from "../generated/graphql";
import { mapFieldErrors } from "../helpers/mapFieldErrors";
import { useCheckAuth } from "../utils/useCheckAuth";
// import { registerMutation } from "../graphql-client/mutations/mutations";

const Register = () => {
  const { data: authData, loading: authLoading } = useCheckAuth();
  const toast = useToast();
  const inittialValues: RegisterInput = {
    username: "",
    password: "",
    email: "",
  };
  const router = useRouter();

  const [registerUser, { loading: _registerUserLoading, data, error }] =
    useRegisrerMutation();
  // const [registerUser, { data, error }] = useMutation<
  //   { register: UserMutationResponse },
  //   { registerInput: NewUserInput }
  // >(registerMutation);

  const onRegisterSubmit = async (
    values: RegisterInput,
    { setErrors, resetForm }: FormikHelpers<RegisterInput>
  ) => {
    const response = await registerUser({
      variables: {
        registerInput: values,
      },
      update(cache, { data }) {
        if (data?.register.success) {
          cache.writeQuery<CurrentUserQuery>({
            query: CurrentUserDocument,
            data: { currentUser: data.register.user },
          });
        }
      },
    });

    if (response.data?.register.errors) {
      setErrors(mapFieldErrors(response.data.register.errors));
    } else {
      resetForm();
      toast({
        title: "welcome",
        description: "logged in successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      router.push("/");
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
          {data && data.register.success && (
            <p>Register successfully {JSON.stringify(data)}</p>
          )}

          <Formik initialValues={inittialValues} onSubmit={onRegisterSubmit}>
            {({}) => (
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
                  isLoading={_registerUserLoading}
                >
                  Register
                </Button>
              </Form>
            )}
          </Formik>
        </Wrapper>
      )}
    </>
  );
};

export default Register;
