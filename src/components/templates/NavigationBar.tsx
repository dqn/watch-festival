import Link from "next/link";
import { useRouter } from "next/router";
import * as React from "react";
import { useMemo } from "react";
import { useCookies } from "react-cookie";

import { DropdownMenu } from "../organisms/DropdownMenu";

export const NavigationBar: React.FC = () => {
  const [, , removeCookie] = useCookies(["name"]);
  const router = useRouter();

  const menuItems = useMemo(() => {
    return [
      {
        text: "Profile",
        onClick() {
          router.push({
            pathname: "/profile",
            query: { callback: location.pathname },
          });
        },
      },
      {
        text: "Sign out",
        onClick() {
          removeCookie("name", { path: "/" });
          router.reload();
        },
      },
    ];
  }, [router, removeCookie]);

  return (
    <nav className="text-white text-xl font-bold bg-black px-3 py-2">
      <div className="flex flex-wrap items-center justify-between w-full px-2 max-w-10xl mx-auto">
        <div className="flex-grow">
          <Link href="/">
            <a className="hover:underline">Watch Festival</a>
          </Link>
        </div>
        <div className="relative flex-shrink z-10">
          <DropdownMenu items={menuItems} />
        </div>
      </div>
    </nav>
  );
};
