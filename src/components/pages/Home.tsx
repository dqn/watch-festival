import { randomAlphaNumeric } from "@/helpers/string";
import { useRouter } from "next/router";
import * as React from "react";
import { useCallback } from "react";

export const Home: React.FC = () => {
  const router = useRouter();

  const handleCreateNewRoom = useCallback(() => {
    router.push(`/rooms/${randomAlphaNumeric(10)}`);
  }, []);

  return (
    <main className="max-w-7xl mx-auto">
      <h1>Hello!</h1>
      <button
        className="rounded bg-green-600 text-white font-semibold p-2"
        onClick={handleCreateNewRoom}
      >
        Create new room
      </button>
    </main>
  );
};
