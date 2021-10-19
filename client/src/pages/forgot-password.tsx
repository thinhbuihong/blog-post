import { Button } from "@chakra-ui/button";
import { Flex, Link } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { useToast } from "@chakra-ui/toast";
import { Form, Formik } from "formik";
import { useRouter } from "next/dist/client/router";
import InputField from "../components/inputField";
import NextLink from "next/link";
import Wrapper from "../components/Wrapper";
import {
  ForgotPasswordInput,
  useForgotPasswordMutation,
} from "../generated/graphql";
import { useCheckAuth } from "../utils/useCheckAuth";

function ForgotPassword() {
  const inittialValues = { email: "" };
  const [forgotPassword, { loading, data }] = useForgotPasswordMutation();
  const toast = useToast();
  const router = useRouter();
  const { data: authData, loading: authLoading } = useCheckAuth();

  const onForgotPasswordSubmit = async (values: ForgotPasswordInput) => {
    await forgotPassword({
      variables: {
        forgotPasswordInput: values,
      },
    });

    if (data?.forgotPassword) {
      toast({
        title: "reset password",
        description: "please check your email",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      router.push("/");
    }
  };

  if (authLoading || (!authLoading && authData?.currentUser)) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="100vh">
        <Spinner></Spinner>
      </Flex>
    );
  }

  return (
    <>
      <Wrapper size="small">
        <Formik
          initialValues={inittialValues}
          onSubmit={onForgotPasswordSubmit}
        >
          {({}) => (
            <Form>
              <InputField
                name="email"
                label="Email"
                placeholder="Email"
                type="email"
              ></InputField>

              <Flex mt={2}>
                <NextLink href="/login">
                  <Link ml="auto">back to login</Link>
                </NextLink>
              </Flex>

              <Button
                type="submit"
                colorScheme="teal"
                mt={4}
                isLoading={loading}
              >
                Reset password
              </Button>
            </Form>
          )}
        </Formik>
      </Wrapper>
    </>
  );
}

export default ForgotPassword;
