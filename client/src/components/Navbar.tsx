import { Button } from "@chakra-ui/button";
import { Box, Flex, Heading, Link } from "@chakra-ui/layout";
import NextLink from "next/link";
import {
  CurrentUserDocument,
  CurrentUserQuery,
  useCurrentUserQuery,
  useLogoutMutation,
} from "../generated/graphql";

const Navbar = () => {
  const { data, loading } = useCurrentUserQuery();
  const [logoutUser, { loading: logoutLoading }] = useLogoutMutation();

  let body;

  if (loading) {
    body = null;
  } else if (!data?.currentUser) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2}>Login</Link>
        </NextLink>

        <NextLink href="/register">
          <Link mr={2}>Register</Link>
        </NextLink>
      </>
    );
  } else {
    body = (
      <Button
        onClick={() =>
          logoutUser({
            update(cache, { data }) {
              if (data?.logout) {
                cache.writeQuery<CurrentUserQuery>({
                  query: CurrentUserDocument,
                  data: { currentUser: null },
                });
              }
            },
          })
        }
        isLoading={logoutLoading}
      >
        Logout
      </Button>
    );
  }

  return (
    <Box bg="tan" p={4}>
      <Flex maxW={800} justifyContent="space-between" m="auto" align="center">
        <NextLink href="/">
          <Heading>Reddit</Heading>
        </NextLink>

        <Box>{body}</Box>
      </Flex>
    </Box>
  );
};

export default Navbar;
