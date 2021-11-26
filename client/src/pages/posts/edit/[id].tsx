import { useRouter } from "next/router";
import Layout from "../../../components/Layout";
import {
  UpdatePostInput,
  useCurrentUserQuery,
  usePostQuery,
  useUpdatePostMutation,
} from "../../../generated/graphql";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { Formik, Form, withFormik, FormikErrors } from "formik";
import InputField from "../../../components/inputField";
import { convertFromRaw, convertToRaw, EditorState } from "draft-js";
import { ApolloError } from "@apollo/client";
import { mapFieldErrorsApollo } from "../../../helpers/mapFieldErrors";
import CreatePostForm from "../../../components/forms/CreatePostForm";

const PostEdit = () => {
  const router = useRouter();
  const toast = useToast();
  const postId = router.query.id as string;

  const { data: currentUserData, loading: currentUserLoading } =
    useCurrentUserQuery();

  const { data: postData, loading: postLoading } = usePostQuery({
    variables: { id: postId },
  });

  const [updatePost] = useUpdatePostMutation();

  const onUpdatePostSubmit = async (
    values: Omit<UpdatePostInput, "id">,
    { setErrors }: { setErrors: (erros: FormikErrors<UpdatePostInput>) => void }
  ) => {
    try {
      await updatePost({
        variables: {
          updatePostInput: {
            id: postId,
            ...values,
          },
        },
      });
      toast({
        title: "Update post",
        description: "Update post successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      router.back();
    } catch (error) {
      if (error instanceof ApolloError) {
        setErrors(mapFieldErrorsApollo(error));
      }
    }
  };

  if (currentUserLoading || postLoading)
    return (
      <Layout>
        <Flex justifyContent="center" alignItems="center" minH="100vh">
          <Spinner />
        </Flex>
      </Layout>
    );

  if (!postData?.post)
    return (
      <Layout>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Post not found</AlertTitle>
        </Alert>
        <Box mt={4}>
          <NextLink href="/">
            <Button>Back to Homepage</Button>
          </NextLink>
        </Box>
      </Layout>
    );

  if (
    !currentUserLoading &&
    !postLoading &&
    currentUserData?.currentUser?.id !== postData?.post?.userId.toString()
  )
    return (
      <Layout>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Unauthorised</AlertTitle>
        </Alert>
        <Box mt={4}>
          <NextLink href="/">
            <Button>Back to Homepage</Button>
          </NextLink>
        </Box>
      </Layout>
    );
  ////////////////////////////
  const contentState = convertFromRaw(JSON.parse(postData.post.text));

  const formikEnhancer = withFormik({
    mapPropsToValues: (_props) => ({
      editorState: EditorState.createWithContent(contentState),
      title: postData.post!.title,
    }),
    handleSubmit: (
      values: { editorState: EditorState; title: string },
      { setErrors }
    ) => {
      const rawText = convertToRaw(values.editorState.getCurrentContent());
      onUpdatePostSubmit(
        {
          title: values.title,
          text: JSON.stringify(rawText),
        },
        { setErrors }
      );
    },
  });

  const UpdatePostEnhancedForm = formikEnhancer(CreatePostForm);

  return (
    <Layout>
      <UpdatePostEnhancedForm />
      <NextLink href="/">
        <Button>Go back to Homepage</Button>
      </NextLink>
      {/* <Formik initialValues={initialValues} onSubmit={onUpdatePostSubmit}>
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" placeholder="Title" label="Title" />

            <Box mt={4}>
              <InputField
                name="text"
                placeholder="Text"
                label="Text"
                type="textarea"
              />
            </Box>

            <Flex justifyContent="space-between" alignItems="center" mt={4}>
              <Button type="submit" colorScheme="teal" isLoading={isSubmitting}>
                Update Post
              </Button>
              <NextLink href="/">
                <Button>Back to Homepage</Button>
              </NextLink>
            </Flex>
          </Form>
        )}
      </Formik> */}
    </Layout>
  );
};

export default PostEdit;
