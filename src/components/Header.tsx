import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

const Header = ({ onToggleSidebar }: { onToggleSidebar: () => void }) => {
  const username = useSelector((state: RootState) => state.user.username);

  return (
    <header className="flex items-center justify-between bg-[#34495e] text-white px-4 py-2 md:pl-64 shadow-md">
      {/* Hamburger Button (Visible on Mobile Only) */}
      <button
        className="p-2 bg-[#3498db] rounded-md shadow-md md:hidden hover:bg-[#2980b9]"
        onClick={onToggleSidebar}
      >
        ☰
      </button>

      {/* Logged-In User */}
      <div className="text-sm">
        Logged in as: <span className="font-semibold">{username}</span>
      </div>
    </header>
  );
};

export default Header;
