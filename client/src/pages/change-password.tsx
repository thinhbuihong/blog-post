import { Alert, AlertIcon, AlertTitle } from "@chakra-ui/alert";
import { Button } from "@chakra-ui/button";
import { Box, Flex, Link } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/dist/client/router";
import NextLink from "next/link";
import { useState } from "react";
import InputField from "../components/inputField";
import Wrapper from "../components/Wrapper";
import {
  ChangePasswordInput,
  CurrentUserDocument,
  CurrentUserQuery,
  useChangePasswordMutation,
} from "../generated/graphql";
import { mapFieldErrors } from "../helpers/mapFieldErrors";
import { useCheckAuth } from "../utils/useCheckAuth";

function ChangePassword() {
  const router = useRouter();
  const { query } = router;
  const inittialValues = { newPassword: "" };
  const [changePassword, { loading }] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState("");
  const { data: authData, loading: authLoading } = useCheckAuth();

  const onChangePasswordSubmit = async (
    values: ChangePasswordInput,
    { setErrors }: FormikHelpers<ChangePasswordInput>
  ) => {
    if (query.userId && query.token) {
      const response = await changePassword({
        variables: {
          userId: query.userId as string,
          token: query.token as string,
          changePasswordInput: values,
        },
        update(cache, { data }) {
          // const currentUser = cache.readQuery({query: CurrentUserDocument});
          if (data?.changePassword.success) {
            cache.writeQuery<CurrentUserQuery>({
              query: CurrentUserDocument,
              data: { currentUser: data.changePassword.user },
            });
          }
        },
      });

      if (response.data?.changePassword.errors) {
        const fieldErrors = mapFieldErrors(response.data.changePassword.errors);

        if ("token" in fieldErrors) {
          setTokenError(fieldErrors.token);
        }
        setErrors(fieldErrors);
      }
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

  if (!query.token || !query.userId) {
    return (
      <Wrapper>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>invalid password change request</AlertTitle>
        </Alert>
      </Wrapper>
    );
  }

  return (
    <>
      <Wrapper size="small">
        <Formik
          initialValues={inittialValues}
          onSubmit={onChangePasswordSubmit}
        >
          {({}) => (
            <Form>
              <InputField
                name="newPassword"
                label="New password"
                placeholder="New password"
                type="password"
              ></InputField>

              {tokenError && (
                <Flex>
                  <Box color="red" mr={2}>
                    {tokenError}
                  </Box>
                  <NextLink href="/forgot-password">
                    <Link>Go back to forgot password</Link>
                  </NextLink>
                </Flex>
              )}

              <Button
                type="submit"
                colorScheme="teal"
                mt={4}
                isLoading={loading}
              >
                Change password
              </Button>
            </Form>
          )}
        </Formik>
      </Wrapper>
    </>
  );
}

export default ChangePassword;
