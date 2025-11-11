'use client';

import {Button} from '@/components/ui/button';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Menu, X, LogOut, LayoutDashboard} from 'lucide-react';
import {useState, useEffect} from 'react';
import {useCurrentStudent, useStudentLogout} from '@/hooks/useStudentAuth';

const Navbar = () => {
  useEffect(() => {
    // Load Norwester font dynamically
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Norwester&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {data: currentStudent, isLoading: isStudentLoading} =
    useCurrentStudent();
  const logoutMutation = useStudentLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className="top-0 z-50 w-full border-b border-gray-700/20"
      style={{backgroundColor: '#141C42'}}
    >
      <div className="max-w-7xl mx-auto flex h-16 items-center px-4 lg:px-6">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="1550+ Logo"
              className="h-12 w-auto"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-center flex-1 px-8">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                pathname === '/' ? 'text-white' : 'text-gray-300'
              }`}
            >
              Home
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                pathname === '/about' ? 'text-white' : 'text-gray-300'
              }`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                pathname === '/contact' ? 'text-white' : 'text-gray-300'
              }`}
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden lg:flex items-center space-x-4">
          {currentStudent ? (
            // Authenticated Student Menu
            <>
              <span className="text-gray-300 text-sm">
                Welcome, {currentStudent.firstName}
              </span>
              <Link href="/student-dashboard">
                <Button
                  variant="ghost"
                  className="text-blue-400 hover:text-white hover:bg-blue-400/20 transition-all duration-200"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-red-400 hover:text-white hover:bg-red-400/20 transition-all duration-200"
                disabled={logoutMutation.isPending}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
              </Button>
            </>
          ) : (
            // Unauthenticated Menu
            <>
              <Link href="/register">
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-white hover:bg-white/10"
                >
                  Sign up
                </Button>
              </Link>
              <Link href="/student-login">
                <Button className="login-gradient-btn text-white px-6 hover:scale-105 transition-all duration-200">
                  Student Login
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-300 hover:text-white hover:bg-white/10"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden border-t border-gray-700/20"
          style={{backgroundColor: '#141C42'}}
        >
          <div className="px-4 py-4 space-y-4">
            <Link
              href="/"
              className={`block text-sm font-medium transition-colors hover:text-blue-400 ${
                pathname === '/' ? 'text-white' : 'text-gray-300'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className={`block text-sm font-medium transition-colors hover:text-blue-400 ${
                pathname === '/about' ? 'text-white' : 'text-gray-300'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`block text-sm font-medium transition-colors hover:text-blue-400 ${
                pathname === '/contact' ? 'text-white' : 'text-gray-300'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact Us
            </Link>
            <div className="pt-4 border-t border-gray-700/20 space-y-3">
              {currentStudent ? (
                // Authenticated Student Mobile Menu
                <>
                  <div className="text-gray-300 text-sm px-3 py-2">
                    Welcome, {currentStudent.firstName}
                  </div>
                  <Link
                    href="/student-dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className="w-full text-blue-400 hover:text-white hover:bg-blue-400/20 transition-all duration-200 justify-start"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full text-red-400 hover:text-white hover:bg-red-400/20 transition-all duration-200 justify-start"
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                  </Button>
                </>
              ) : (
                // Unauthenticated Mobile Menu
                <>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className="w-full text-gray-300 hover:text-white hover:bg-white/10 justify-start"
                    >
                      Sign up
                    </Button>
                  </Link>
                  <Link
                    href="/student-login"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button className="login-gradient-btn w-full text-white hover:scale-105 transition-all duration-200">
                      Student Login
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
