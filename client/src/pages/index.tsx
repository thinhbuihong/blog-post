import { NetworkStatus } from "@apollo/client";
import { Button } from "@chakra-ui/button";
import { Box, Flex, Heading, Link, Stack, Text } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { GetStaticProps } from "next";
import NextLink from "next/link";
import Layout from "../components/Layout";
import PostEditDeleteButtons from "../components/PostEditDeleteButton";
import UpvoteSection from "../components/UpvoteSection";
import {
  PostsDocument,
  useCurrentUserQuery,
  usePostsQuery,
} from "../generated/graphql";
import { addApolloState, initializeApollo } from "../lib/apolloClient";

export const limit = 3;

const Index = () => {
  const { data: currentUserData } = useCurrentUserQuery();

  const { data, loading, fetchMore, networkStatus } = usePostsQuery({
    variables: { limit },
    //component nao reder data, se rerender khi networkstatus thay doi (fetchmoere)
    notifyOnNetworkStatusChange: true,
  });

  const loadingMorePosts = networkStatus === NetworkStatus.fetchMore;

  const loadMorePOsts = async () => {
    return await fetchMore({ variables: { cursor: data?.posts?.cursor } });
  };

  return (
    <Layout>
      {loading && !loadingMorePosts ? (
        <Flex justifyContent="center" alignItems="center" minH="100vh">
          <Spinner></Spinner>
        </Flex>
      ) : (
        <Stack spacing={8}>
          {data?.posts?.paginatedPosts.map((post) => (
            <Flex key={post.id} p={5} shadow="md" borderWidth="1px">
              <UpvoteSection post={post} />
              <Box flex={1}>
                <NextLink href={`/posts/${post.id}`}>
                  <Link>
                    <Heading fontSize="xl">{post.title}</Heading>
                  </Link>
                </NextLink>

                <Text>posted by {post.user.username}</Text>
                <Flex align="center">
                  <Text mt={4}>{post.textSnippet}</Text>
                  <Box ml="auto">
                    {currentUserData?.currentUser?.id === post.user.id && (
                      <PostEditDeleteButtons
                        postId={post.id}
                        postUserId={post.user.id}
                      />
                    )}
                  </Box>
                </Flex>
              </Box>
            </Flex>
          ))}
        </Stack>
      )}
      {data?.posts?.hasMore && (
        <Flex>
          <Button
            m="auto"
            my={8}
            isLoading={loadingMorePosts}
            onClick={loadMorePOsts}
          >
            {loadingMorePosts ? "Loading" : "Show more"}
          </Button>
        </Flex>
      )}
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const apolloClient = initializeApollo();

  await apolloClient.query({
    query: PostsDocument,
    variables: {
      limit,
    },
  });

  return addApolloState(apolloClient, {
    props: {},
  });
};

export default Index;
