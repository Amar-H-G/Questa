"use client";

import { createClient } from "../../lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(undefined); // start as undefined
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    // 1) Get the persisted session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 2) Listen for auth changes (sign in / out)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // 3) Scroll listener
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);

    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // No need to router.refresh: auth listener will update `user`
    router.push("/auth/signin");
  };

  // Prevent flicker: if user is still undefined, don’t render auth buttons yet
  const isLoadingAuth = user === undefined;

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm"
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:inline-block">
              Questa
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/features"
              className="text-gray-700 hover:text-indigo-600 transition-colors font-medium flex items-center"
            >
              Features <ChevronDown className="w-4 h-4 ml-1" />
            </Link>
            <Link
              href="/pricing"
              className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
            >
              Pricing
            </Link>
            <Link
              href="/templates"
              className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
            >
              Templates
            </Link>

            {/* Auth buttons */}
            {!isLoadingAuth &&
              (user ? (
                <div className="flex items-center space-x-4 ml-4">
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4 ml-4">
                  <Link
                    href="/auth/signin"
                    className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Get Started
                  </Link>
                </div>
              ))}
          </nav>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 focus:outline-none"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`md:hidden ${isOpen ? "block" : "hidden"}`}>
        <div className="px-2 pt-2 pb-4 space-y-2 bg-white border-t border-gray-100">
          <Link
            href="/features"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            Pricing
          </Link>
          <Link
            href="/templates"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            Templates
          </Link>

          {!isLoadingAuth &&
            (user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-2 space-y-2">
                <Link
                  href="/auth/signin"
                  className="block w-full px-4 py-2 text-center rounded-md border border-gray-200 text-base font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="block w-full px-4 py-2 text-center rounded-md bg-indigo-600 text-white text-base font-medium hover:bg-indigo-700"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            ))}
        </div>
      </div>
    </header>
  );
}
