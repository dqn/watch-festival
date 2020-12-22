import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useCookies } from "react-cookie";

import { Room } from "@/components/pages/Room";

const RoomPage: NextPage = () => {
  const router = useRouter();
  const [cookies] = useCookies(["name"]);

  useEffect(() => {
    if (!cookies.name) {
      router.push({
        pathname: "/profile",
        query: {
          callback: location.pathname,
        },
      });
    }
  }, []);

  const { id } = router.query;

  if (!cookies.name || typeof id !== "string") {
    return null;
  }

  return (
    <>
      <Room id={id} name={cookies.name} />
    </>
  );
};

export default RoomPage;
