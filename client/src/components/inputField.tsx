import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Textarea } from "@chakra-ui/textarea";
import { useField } from "formik";

interface InputFieldProps {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  textarea?: boolean;
}

const InputField = ({ textarea, ...props }: InputFieldProps) => {
  const [field, { error }] = useField(props);

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{props.label}</FormLabel>
      {textarea ? (
        <Textarea {...field} id={field.name} {...props} />
      ) : (
        <Input {...field} id={field.name} {...props} />
      )}
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default InputField;
