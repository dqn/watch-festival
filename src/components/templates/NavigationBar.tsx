import Link from "next/link";
import { useRouter } from "next/router";
import * as React from "react";
import { useCallback, useMemo, useState } from "react";
import { useCookies } from "react-cookie";

export const NavigationBar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, , removeCookie] = useCookies(["name"]);
  const router = useRouter();

  const toggleIsMenuOpen = useCallback(() => {
    setIsMenuOpen((state) => !state);
  }, [setIsMenuOpen]);

  const handleClickProfile = useCallback(() => {
    setIsMenuOpen(false);
    router.push({
      pathname: "/profile",
      query: { callback: location.pathname },
    });
  }, [removeCookie]);

  const handleClickSignOut = useCallback(() => {
    removeCookie("name", { path: "/" });
    setIsMenuOpen(false);
    router.reload();
  }, [removeCookie]);

  const links = useMemo(() => {
    return [
      { text: "Profile", onClick: handleClickProfile },
      { text: "Sign out", onClick: handleClickSignOut },
    ];
  }, [handleClickProfile, handleClickSignOut]);

  return (
    <nav className="text-white text-xl font-bold bg-black px-3 py-2">
      <div className="flex flex-wrap items-center justify-between w-full px-2 max-w-7xl mx-auto">
        <div className="flex-grow">
          <Link href="/">
            <a className="hover:underline">Watch Festival</a>
          </Link>
        </div>
        <div className="relative flex-shrink z-10">
          <button
            type="button"
            className="focus:outline-none"
            onClick={toggleIsMenuOpen}
          >
            <svg
              className="fill-current h-4 w-4"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
            </svg>
          </button>

          {isMenuOpen && (
            <div className="bg-white absolute right-0 py-1 mt-2 w-56 border rounded">
              {links.map(({ text, onClick }, i) => (
                <a
                  className="block text-sm text-gray-700 hover:bg-gray-100 px-4 py-2"
                  onClick={onClick}
                  key={i}
                >
                  {text}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
