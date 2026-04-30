import React from 'react';
import MidPoint from '@/components/landing-page/Mid-point';
import Testimonial from '@/components/landing-page/Testimonial';
import CallToAction from '@/components/landing-page/CallToAction';
import HowItWorks from '@/components/landing-page/HowItWorks';
import ProveYourself from '@/components/landing-page/ProveYourself';
import Unlock from '@/components/landing-page/Unlock';
import HowItWorks2 from '@/components/landing-page/howitswork_2';
import Success from '@/components/landing-page/success';
import Philosophy from '@/components/landing-page/Philosophy';
import YourPath from '@/components/landing-page/yourPath';

const Home = () => {
  return (
    <div>
      <ProveYourself />
      <Unlock />
      <HowItWorks />
      <MidPoint />
      <HowItWorks2 />
      <Success />
      <Philosophy />
      <YourPath />
      <Testimonial />
      <CallToAction />
    </div>
  );
};

export default Home;