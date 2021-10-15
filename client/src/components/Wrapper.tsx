import { Box } from "@chakra-ui/layout";
import { ReactNode } from "react";

interface IWrapperProps {
  children: ReactNode;
}

const Wrapper = ({ children }: IWrapperProps) => {
  return (
    <Box maxWidth="400px" w="100%" mt={8} mx="auto">
      {children}
    </Box>
  );
};
export default Wrapper;
