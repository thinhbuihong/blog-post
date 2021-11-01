import { Reference } from "@apollo/client";
import { Button } from "@chakra-ui/button";
import { Box, Flex, Heading, Link } from "@chakra-ui/layout";
import NextLink from "next/link";
import {
  CurrentUserDocument,
  CurrentUserQuery,
  useCurrentUserQuery,
  useLogoutMutation,
} from "../generated/graphql";
import { initializeApollo } from "../lib/apolloClient";

const Navbar = () => {
  const { data, loading } = useCurrentUserQuery();
  const [logout, { loading: logoutLoading }] = useLogoutMutation();

  const logoutUser = async () => {
    await logout({
      // update(cache, { data }) {
      // 	if (data?.logout) {
      // 		cache.writeQuery<CurrentUserQuery>({
      // 			query: CurrentUserDocument,
      // 			data: { currentUser: null }
      // 		})
      // 		cache.modify({
      // 			fields: {
      // 				posts(existing) {
      // 					existing.paginatedPosts.forEach((post: Reference) => {
      // 						cache.writeFragment({
      // 							id: post.__ref, // `Post:17`
      // 							fragment: gql`
      // 								fragment VoteType on Post {
      // 									voteType
      // 								}
      // 							`,
      // 							data: {
      // 								voteType: 0
      // 							}
      // 						})
      // 					})
      // 					return existing
      // 				}
      // 			}
      // 		})
      // 	}
      // }
    });
    const apolloClient = initializeApollo({});
    apolloClient.resetStore();
  };

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
      <Flex>
        <NextLink href="/create-post">
          <Button mr={4}>Create post</Button>
        </NextLink>
        <Button onClick={logoutUser} isLoading={logoutLoading}>
          Logout
        </Button>
      </Flex>
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
