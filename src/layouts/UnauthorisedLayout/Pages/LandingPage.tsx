import React from 'react'
import { HeroSection } from '../components/HeroSection/HeroSection'
import { VideoSection } from '../components/VideoSection/VideoSection'
import { OurWorksSection } from '../components/OurWorksSection/OurWorksSection'
import { WorkWithSection } from '../components/WorkWithSection/WorkWithSection'
import { HowItWorkSection } from '../components/HowItWorkSection/HowItWorkSection';
import { AdvantagesSection } from '../components/AdvantagesSection/AdvantagesSection'
import { WhatYouGetSection } from '../components/WhatYouGetSection/WhatYouGetSection'
import { TariffSelectorSection } from '../components/TariffSelectorSection/TariffSelectorSection'
import { FAQSection } from '../components/FAQSection/FAQSection'
import { StartAISection } from '../components/StartAISection/StartAISection'

export const LandingPage = () => {
  return (
    <>
      <HeroSection />
      <VideoSection />
      <OurWorksSection />
      <WorkWithSection />
      <HowItWorkSection />
      <AdvantagesSection />
      <WhatYouGetSection />
      <TariffSelectorSection />
      <FAQSection />
      <StartAISection />
    </>
  )
}
