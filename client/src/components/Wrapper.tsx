import { Box } from "@chakra-ui/layout";
import { ReactNode } from "react";

type WrapperSize = "regular" | "small";

interface IWrapperProps {
  children: ReactNode;
  size?: WrapperSize;
}

const Wrapper = ({ children, size = "regular" }: IWrapperProps) => {
  return (
    <Box
      maxWidth="400px"
      w="100%"
      mt={8}
      maxW={size === "regular" ? "800px" : "400px"}
      mx="auto"
    >
      {children}
    </Box>
  );
};
export default Wrapper;
