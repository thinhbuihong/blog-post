import { useCheckAuth } from "../utils/useCheckAuth";
import { Flex, Spinner, Box, Button, useToast } from "@chakra-ui/react";
import Layout from "../components/Layout";
import { Formik, Form, FormikHelpers, withFormik, FormikErrors } from "formik";

import NextLink from "next/link";
import {
  CreatePostInput,
  PaginatedPosts,
  useCreatePostMutation,
} from "../generated/graphql";
import router from "next/router";
import { ApolloError, Reference } from "@apollo/client";
import { mapFieldErrorsApollo } from "../helpers/mapFieldErrors";
import { convertToRaw, EditorState } from "draft-js";
import CreatePostForm from "../components/forms/CreatePostForm";

const CreatePost = () => {
  const { data: authData, loading: authLoading } = useCheckAuth();
  const toast = useToast();
  // const initialValues = { title: "", text: "" };

  const [createPost, _] = useCreatePostMutation();

  const formikEnhancer = withFormik({
    mapPropsToValues: (_props) => ({
      editorState: EditorState.createEmpty(),
      title: "",
    }),
    handleSubmit: async (
      values: { editorState: EditorState; title: string },
      { setErrors }
    ) => {
      const rawText = convertToRaw(values.editorState.getCurrentContent());
      await onCreatePostSubmit(
        {
          title: values.title,
          text: JSON.stringify(rawText),
        },
        { setErrors }
      );
    },
  });

  const MyEnhancedForm = formikEnhancer(CreatePostForm);

  const onCreatePostSubmit = async (
    values: CreatePostInput,
    {
      setErrors,
    }: { setErrors: (errors: FormikErrors<CreatePostInput>) => void }
  ) => {
    try {
      await createPost({
        variables: { createPostInput: values },
        update(cache, { data }) {
          cache.modify({
            fields: {
              posts(
                existing: Omit<PaginatedPosts, "paginatedPosts"> & {
                  paginatedPosts: Reference[];
                }
              ) {
                if (data?.createPost.success && data.createPost.post) {
                  // Post:new_id
                  const newPostRef = cache.identify(data.createPost.post);

                  const newPostsAfterCreation = {
                    ...existing,
                    totalCount: existing.totalCount + 1,
                    paginatedPosts: [
                      { __ref: newPostRef },
                      ...existing.paginatedPosts, // [{__ref: 'Post:1'}, {__ref: 'Post:2'}]
                    ],
                  };

                  return newPostsAfterCreation;
                }
                return existing;
              },
            },
          });
        },
      });
      toast({
        title: "Create post",
        description: "Create post successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      router.push("/");
    } catch (error) {
      if (error instanceof ApolloError) {
        setErrors(mapFieldErrorsApollo(error));
        toast({
          title: "Create post",
          description: "invalid input",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    }
  };

  if (authLoading || (!authLoading && !authData?.currentUser)) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="100vh">
        <Spinner />
      </Flex>
    );
  } else {
    return (
      <Layout>
        <MyEnhancedForm />
        {/* <Formik initialValues={initialValues} onSubmit={onCreatePostSubmit}>
          {({ isSubmitting }) => (
            <Form>
              <InputField name="title" placeholder="Title" label="Title" />

              <Box mt={4}>
                <InputField
                  name="text"
                  placeholder="Text"
                  label="Text"
                  textarea={true}
                />
              </Box>

              <Flex justifyContent="space-between" alignItems="center" mt={4}>
                <Button
                  type="submit"
                  colorScheme="teal"
                  isLoading={isSubmitting}
                >
                  Create Post
                </Button>
                </Flex>
                
                </Form>
                )}
              </Formik> */}
        <NextLink href="/">
          <Button>Go back to Homepage</Button>
        </NextLink>
      </Layout>
    );
  }
};

export default CreatePost;
