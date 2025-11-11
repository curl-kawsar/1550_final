'use client';

import {Facebook, Instagram, Youtube} from 'lucide-react';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {useState} from 'react';
import {useSubmitContact} from '@/hooks/useContact';

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

    // Basic validation
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
        // Reset form on success
        setContactForm({
          firstName: '',
          lastName: '',
          email: '',
          message: '',
        });
      },
    });
  };

  return (
    <footer className="bg-black text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, white 2px, transparent 0)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* Logo Section */}
        <div className="flex justify-left mb-16">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="1550+ Logo" className="h-12 w-auto" />
          </Link>
        </div>

        {/* Main Content - 3 Column Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-16">
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">
              Quick Link
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  About
                </Link>
              </li>
              {/* <li>
                <Link
                  href="/services"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Services
                </Link>
              </li> */}
              {/* <li>
                <Link
                  href="/team"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Meet Your Team
                </Link>
              </li> */}
              <li>
                <Link
                  href="/contact"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          {/* <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Services</h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/services/test-prep"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Test Prep
                </Link>
              </li>
              <li>
                <Link
                  href="/services/admissions"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Admissions Service
                </Link>
              </li>
              <li>
                <Link
                  href="/services/internship"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Internship
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Events
                </Link>
              </li>
            </ul>
          </div> */}

          {/* Socials */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Socials</h3>
            <div className="space-y-4">
              <a
                href="https://www.facebook.com/collegemastermindUSA"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <Facebook className="h-5 w-5" />
                <span>Facebook</span>
              </a>
              <a
                href="https://www.instagram.com/collegemastermind"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span>Instagram</span>
              </a>
              {/* <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <Youtube className="h-5 w-5" />
                <span>Youtube</span>
              </a> */}
              {/* <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                </svg>
                <span>TikTok</span>
              </a> */}
            </div>
          </div>

          {/* Get in Touch */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-white">
              Get in touch
            </h3>
            <p className="text-gray-300 mb-6 text-sm">
              You can reach us anytime
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="text"
                  placeholder="First name"
                  value={contactForm.firstName}
                  onChange={(e) =>
                    handleInputChange('firstName', e.target.value)
                  }
                  className="bg-transparent border-gray-600 text-white placeholder:text-gray-400 focus:border-white"
                />
                <Input
                  type="text"
                  placeholder="Last name"
                  value={contactForm.lastName}
                  onChange={(e) =>
                    handleInputChange('lastName', e.target.value)
                  }
                  className="bg-transparent border-gray-600 text-white placeholder:text-gray-400 focus:border-white"
                />
              </div>

              <Input
                type="email"
                placeholder="Your mail"
                value={contactForm.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="bg-transparent border-gray-600 text-white placeholder:text-gray-400 focus:border-white"
              />

              <textarea
                placeholder="Tell us"
                value={contactForm.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className="w-full px-3 py-2 bg-transparent border border-gray-600 rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:border-white resize-none h-24"
              />

              <Button
                type="submit"
                disabled={submitContactMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 disabled:opacity-50"
              >
                {submitContactMutation.isPending ? 'Sending...' : 'Submit'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
