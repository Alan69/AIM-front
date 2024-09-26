import React from 'react'
import { HeroSection } from '../components/HeroSection/HeroSection'
import { VideoSection } from '../components/VideoSection/VideoSection'
import { OurWorksSection } from '../components/OurWorksSection/OurWorksSection'
import { WorkWithSection } from '../components/WorkWithSection/WorkWithSection'
import { HowItWorkSection } from '../components/HowItWorkSection/HowItWorkSection';

export const LandingPage = () => {
  return (
    <div>
      <HeroSection />
      <VideoSection />
      <OurWorksSection />
      <WorkWithSection />
      <HowItWorkSection />
    </div>
  )
}
