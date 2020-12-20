import { NextPage } from "next";

import { Room } from "@/components/pages/Room";
import { useRouter } from "next/dist/client/router";

const RoomPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  if (typeof id !== "string") {
    return null;
  }

  return (
    <>
      <Room id={id} />
    </>
  );
};

export default RoomPage;
