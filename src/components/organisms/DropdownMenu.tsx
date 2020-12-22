import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

type MenuItem = {
  text: string;
  onClick(): void;
};

export type Props = {
  items: MenuItem[];
};

export const DropdownMenu: React.FC<Props> = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    isOpen && ref.current?.focus();
  }, [isOpen]);

  const toggleIsOpen = useCallback(() => {
    setIsOpen((state) => !state);
  }, [setIsOpen]);

  const handleBlur = useCallback(() => {
    setTimeout(() => setIsOpen(false), 100);
  }, [setIsOpen]);

  return (
    <>
      <button
        type="button"
        className="focus:outline-none"
        onClick={toggleIsOpen}
      >
        <svg
          className="fill-current h-4 w-4"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="bg-white absolute right-0 py-1 mt-2 w-56 border rounded focus:outline-none"
          ref={ref}
          onBlur={handleBlur}
          tabIndex={1}
        >
          {items.map(({ text, onClick }, i) => (
            <a
              className="block text-sm text-gray-700 hover:bg-gray-100 px-4 py-2 cursor-pointer"
              onClick={onClick}
              key={i}
            >
              {text}
            </a>
          ))}
        </div>
      )}
    </>
  );
};
