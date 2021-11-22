import DraftEditor from "../Editor";
import InputField from "../inputField";

const CreatePostForm = ({
  values,
  dirty,
  handleSubmit,
  handleReset,
  setFieldValue,
  isSubmitting,
}: any) => (
  <form onSubmit={handleSubmit} className="createPostForm">
    <InputField name="title" placeholder="Title" label="Title" />

    <label htmlFor="text" style={{ display: "block", marginTop: ".5rem" }}>
      Text
    </label>

    <DraftEditor editorState={values.editorState} onChange={setFieldValue} />

    <button
      type="button"
      className="outline"
      onClick={handleReset}
      disabled={!dirty || isSubmitting}
    >
      Reset
    </button>

    <button type="submit" disabled={isSubmitting}>
      Submit
    </button>
  </form>
);

export default CreatePostForm;
