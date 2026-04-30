'use client';

import {Button} from '@/components/ui/button';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Menu, X, LogOut, LayoutDashboard} from 'lucide-react';
import {useState} from 'react';
import {useCurrentStudent, useStudentLogout} from '@/hooks/useStudentAuth';
import Image from 'next/image';

const NavLink = ({href, children, onClick}) => {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`text-base font-medium tracking-[-0.8px] transition-colors hover:text-white/90 ${
        active ? 'text-white' : 'text-white/85'
      }`}
    >
      {children}
    </Link>
  );
};

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {data: currentStudent} = useCurrentStudent();
  const logoutMutation = useStudentLogout();

  const closeMobile = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsMobileMenuOpen(false);
  };

  const shellClass =
    'rounded-lg border border-white/10 bg-[rgba(2,10,43,0.55)] backdrop-blur-[6px] shadow-sm';

  const loginBtnClass =
    'inline-flex items-center justify-center rounded-md px-6 py-2.5 text-base font-semibold text-white transition-colors bg-[#004eff] hover:bg-[#0e5dff] active:bg-[#0038cc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7af0ff] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent';

  return (
    <nav className="sticky top-0 z-50 w-full px-4 pt-3 pb-3 lg:px-6">
      <div className={`mx-auto max-w-7xl ${shellClass}`}>
        <div className="flex items-center justify-between gap-4 px-6 py-3">
          <Link href="/" className="flex shrink-0 items-center" onClick={closeMobile}>
            <Image
              src="/navbar-logo-figma.png"
              alt="1550+ Logo"
              className="h-[50px] w-auto"
              width={184}
              height={100}
              priority
            />
          </Link>

          <div className="hidden flex-1 items-center justify-center lg:flex">
            <div className="flex items-center gap-10">
              <NavLink href="/">Home</NavLink>
              <NavLink href="/about">About</NavLink>
              <NavLink href="/contact">Contact us</NavLink>
            </div>
          </div>

          <div className="hidden items-center gap-5 lg:flex">
            {currentStudent ? (
              <>
                <span className="text-sm font-medium tracking-[-0.8px] text-white/90">
                  Welcome, {currentStudent.firstName}
                </span>
                <Link href="/student-dashboard">
                  <Button
                    variant="ghost"
                    className="text-base font-medium tracking-[-0.8px] text-white hover:bg-white/10 hover:text-white"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="text-base font-medium tracking-[-0.8px] text-white/90 hover:bg-white/10 hover:text-white"
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="text-base font-semibold tracking-[-0.8px] text-white drop-shadow-[0px_4px_8px_rgba(96,93,255,0.25)] transition-opacity hover:opacity-90"
                >
                  Sign up
                </Link>
                <Link href="/student-login" className={loginBtnClass}>
                  Login
                </Link>
              </>
            )}
          </div>

          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:bg-white/10 hover:text-white"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-white/15 px-6 pb-5 pt-4 lg:hidden">
            <div className="flex flex-col gap-4">
              <NavLink href="/" onClick={closeMobile}>
                Home
              </NavLink>
              <NavLink href="/about" onClick={closeMobile}>
                About
              </NavLink>
              <NavLink href="/contact" onClick={closeMobile}>
                Contact us
              </NavLink>
            </div>
            <div className="mt-4 space-y-3 border-t border-white/15 pt-4">
              {currentStudent ? (
                <>
                  <div className="px-1 text-sm font-medium tracking-[-0.8px] text-white/90">
                    Welcome, {currentStudent.firstName}
                  </div>
                  <Link href="/student-dashboard" onClick={closeMobile}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-white/10 hover:text-white"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start text-white/90 hover:bg-white/10 hover:text-white"
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/register" onClick={closeMobile}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-base font-semibold tracking-[-0.8px] text-white drop-shadow-[0px_4px_8px_rgba(96,93,255,0.25)] hover:bg-white/10"
                    >
                      Sign up
                    </Button>
                  </Link>
                  <Link
                    href="/student-login"
                    onClick={closeMobile}
                    className={`${loginBtnClass} w-full`}
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
