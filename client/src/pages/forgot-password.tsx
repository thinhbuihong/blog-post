import { Button } from "@chakra-ui/button";
import { useToast } from "@chakra-ui/toast";
import { Form, Formik } from "formik";
import { useRouter } from "next/dist/client/router";
import InputField from "../components/inputField";
import Wrapper from "../components/Wrapper";
import {
  ForgotPasswordInput,
  useForgotPasswordMutation,
} from "../generated/graphql";

function ForgotPassword() {
  const inittialValues = { email: "" };
  const [forgotPassword, { loading, data }] = useForgotPasswordMutation();
  const toast = useToast();
  const router = useRouter();

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

  return (
    <>
      <Wrapper>
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
