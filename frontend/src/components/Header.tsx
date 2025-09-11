"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Header: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleLoginClick = () => {
    if (isLoggedIn) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 pb-8 w-full flex items-center justify-between py-6 px-4 sm:px-12 bg-transparent backdrop-blur-md">
      {/* Logo */}
      <span className="text-2xl font-extrabold bg-gradient-to-r from-[#E052CB] to-[#4F8CFF] bg-clip-text text-transparent select-none">
        Shortify
      </span>
      {/* Nav Buttons */}
      <div className="flex gap-4">
        <button
          className="px-5 py-2 rounded-full font-medium text-sm border border-[#23263a] bg-[#23263a] text-white hover:bg-[#35384a] transition flex items-center gap-2 shadow-none"
          onClick={handleLoginClick}
        >
          <span>{isLoggedIn ? "Dashboard" : "Login"}</span>
          <span className="inline-block">→</span>
        </button>
        {!isLoggedIn && (
          <Link
            href="/register"
            className="px-5 py-2 rounded-full font-medium text-sm bg-[#4F8CFF] text-white shadow-lg hover:bg-[#3973d6] transition flex items-center justify-center"
          >
            Register Now
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
