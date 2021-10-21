import { useRouter } from "next/dist/client/router";
import { useEffect } from "react";
import { useCurrentUserQuery } from "../generated/graphql";

export const useCheckAuth = () => {
  const router = useRouter();

  const { data, loading } = useCurrentUserQuery();

  useEffect(() => {
    if (!loading) {
      if (
        data?.currentUser &&
        (router.route === "/login" ||
          router.route === "/register" ||
          router.route === "/forgot-password" ||
          router.route === "/change-password")
      ) {
        router.push("/");
      } else if (
        !data?.currentUser &&
        router.route !== "/login" &&
        router.route !== "/register"
      ) {
        router.push("/login");
      }
    }
  }, [data, loading, router]);

  return { data, loading };
};
