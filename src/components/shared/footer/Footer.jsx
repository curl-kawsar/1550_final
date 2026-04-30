'use client';

import {ArrowUpRight, Facebook, Instagram} from 'lucide-react';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {useState} from 'react';
import {useSubmitContact} from '@/hooks/useContact';
import '@/components/landing-page/landing.css';

const sectionLabel =
  'text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45';

const linkClass =
  'text-sm text-white/70 hover:text-white transition-colors duration-200';

const Footer = () => {
  const [contactForm, setContactForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  });

  const submitContactMutation = useSubmitContact();

  const handleInputChange = (field, value) => {
    setContactForm((prev) => ({...prev, [field]: value}));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !contactForm.firstName ||
      !contactForm.lastName ||
      !contactForm.email ||
      !contactForm.message
    ) {
      return;
    }

    submitContactMutation.mutate(contactForm, {
      onSuccess: () => {
        setContactForm({
          firstName: '',
          lastName: '',
          email: '',
          message: '',
        });
      },
    });
  };

  const fieldClass =
    'rounded-lg border border-[#1c3568] bg-[#050b1a]/90 text-white placeholder:text-white/38 ' +
    'outline-none ring-offset-0 focus-visible:border-[#457BF5] ' +
    'focus-visible:ring-1 focus-visible:ring-[#457BF5]/80 focus-visible:ring-offset-0 ' +
    'shadow-none';

  return (
    <footer className="relative w-full max-w-none overflow-hidden border-t border-white/[0.06] bg-[#010516] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.32]"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 55% at 50% -20%, rgba(42, 77, 255, 0.38), transparent 55%)',
        }}
      />

      <div className="relative z-10 w-full px-4 py-16 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-14">
          <div className="lg:col-span-3">
            <Link href="/" className="inline-flex items-center gap-3">
              <img src="/logo.png" alt="1550+ Logo" className="h-11 w-auto" />
            </Link>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/60">
              SAT prep, admissions, and scholarships for students who aim
              higher.
            </p>
            <p className="mt-6 text-sm text-white/45">
              We respect your privacy. Messages go to our team only.
            </p>
          </div>

          <div className="lg:col-span-2">
            <p className={sectionLabel}>Navigate</p>
            <ul className="mt-5 space-y-3">
              <li>
                <Link href="/" className={linkClass}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className={linkClass}>
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className={linkClass}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className={sectionLabel}>Connect</p>
            <p className="mt-5 text-sm text-white/55">
              Follow College Mastermind for tips and updates.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://www.facebook.com/collegemastermindUSA"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/80 transition-colors duration-200 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" strokeWidth={1.75} />
              </a>
              <a
                href="https://www.instagram.com/collegemastermind"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/80 transition-colors duration-200 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" strokeWidth={1.75} />
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-white/[0.08] bg-[#071028]/70 p-6 shadow-[0_24px_80px_-28px_rgba(0,0,0,0.65)] backdrop-blur-md sm:p-7 lg:p-8">
              <p className={sectionLabel}>Get in touch</p>
              <p className="mt-4 text-sm text-white/60">
                You can reach us anytime. We typically reply within one business
                day.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="text"
                    placeholder="First name"
                    value={contactForm.firstName}
                    onChange={(e) =>
                      handleInputChange('firstName', e.target.value)
                    }
                    className={fieldClass}
                  />
                  <Input
                    type="text"
                    placeholder="Last name"
                    value={contactForm.lastName}
                    onChange={(e) =>
                      handleInputChange('lastName', e.target.value)
                    }
                    className={fieldClass}
                  />
                </div>

                <Input
                  type="email"
                  placeholder="Email"
                  value={contactForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={fieldClass}
                />

                <textarea
                  placeholder="Your message"
                  value={contactForm.message}
                  onChange={(e) =>
                    handleInputChange('message', e.target.value)
                  }
                  className={[
                    fieldClass,
                    'min-h-[5.5rem] w-full resize-none px-3 py-2.5 text-sm',
                  ].join(' ')}
                  rows={4}
                />

                <Button
                  type="submit"
                  disabled={submitContactMutation.isPending}
                  className="hero-cta-btn mt-2 w-full focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  {submitContactMutation.isPending ? (
                    'Sending…'
                  ) : (
                    <>
                      Submit
                      <ArrowUpRight
                        className="hero-cta-icon"
                        size={18}
                        aria-hidden
                      />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/[0.08] pt-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/45">
            © {new Date().getFullYear()} 1550plus. All rights reserved.
          </p>
          <nav
            aria-label="Footer"
            className="flex flex-wrap gap-x-6 gap-y-2 text-sm"
          >
            <Link href="/about" className="text-white/50 hover:text-white/80">
              About
            </Link>
            <Link href="/contact" className="text-white/50 hover:text-white/80">
              Contact
            </Link>
            <Link href="/register" className="text-white/50 hover:text-white/80">
              Join
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
