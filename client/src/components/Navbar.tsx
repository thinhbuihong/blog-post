import { Button } from "@chakra-ui/button";
import { Box, Flex, Heading, Link } from "@chakra-ui/layout";
import NextLink from "next/link";
import { useCurrentUserQuery } from "../generated/graphql";

const Navbar = () => {
  const { data, loading, error } = useCurrentUserQuery();

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
    body = <Button>Logout</Button>;
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
