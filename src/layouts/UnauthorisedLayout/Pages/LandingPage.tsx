import React, { useState, useEffect } from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import cn from "classnames";
import { ArrowUpOutlined } from "@ant-design/icons";
import { useTypedSelector } from "hooks/useTypedSelector";
import { useTranslation } from "react-i18next";

import { HeroSection } from "../components/HeroSection/HeroSection";
import { VideoSection } from "../components/VideoSection/VideoSection";
import { OurWorksSection } from "../components/OurWorksSection/OurWorksSection";
import { WorkWithSection } from "../components/WorkWithSection/WorkWithSection";
import { HowItWorkSection } from "../components/HowItWorkSection/HowItWorkSection";
import { AdvantagesSection } from "../components/AdvantagesSection/AdvantagesSection";
import { WhatYouGetSection } from "../components/WhatYouGetSection/WhatYouGetSection";
import { TariffSelectorSection } from "../components/TariffSelectorSection/TariffSelectorSection";
import { FAQSection } from "../components/FAQSection/FAQSection";
import { StartAISection } from "../components/StartAISection/StartAISection";

import { ReactComponent as IconPlus } from "assets/plus-white.svg";
import styles from "../UnauthorisedLayout.module.scss";
import ChatButtonWithForm from "../components/ChatButtonWithForm/ChatButtonWithForm";

export const LandingPage = () => {
  const navigate = useNavigate();
  const { token } = useTypedSelector((state) => state.auth);
  const [isSticky, setSticky] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { t } = useTranslation();

  const handleScroll = () => {
    const tariffSection = document.getElementById("tariff-section");
    const heroSection = document.getElementById("hero-section");

    if (tariffSection && heroSection) {
      const tariffTop = tariffSection.getBoundingClientRect().top;
      const tariffHeight = tariffSection.getBoundingClientRect().height;
      const heroTop = heroSection.getBoundingClientRect().top;
      const heroHeight = heroSection.getBoundingClientRect().height;
      const windowHeight = window.innerHeight;

      if (
        heroTop < -heroHeight / 2 &&
        tariffTop > windowHeight - tariffHeight / 6
      ) {
        setSticky(true);
      } else {
        setSticky(false);
      }
    }

    if (window.scrollY > 300) {
      setShowScrollButton(true);
    } else {
      setShowScrollButton(false);
    }
  };

  const scrollToTariff = () => {
    const tariffSection = document.getElementById("tariff-section");
    if (tariffSection) {
      const offset = -124;
      const elementPosition =
        tariffSection.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition + offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <div
        className={cn(
          styles.stickyActions,
          isSticky ? styles.stickyActions__visible : ""
        )}
      >
        <Button className={styles.tariffBtn} onClick={scrollToTariff}>
          {t("landingPage.tariffs")}
        </Button>
        <Button
          className={styles.startBtn}
          onClick={() => navigate(token ? "/tariffs" : "/login")}
        >
          {t("landingPage.start_now")} <IconPlus className={styles.iconPlus} />
        </Button>
      </div>

      <HeroSection isSticky={isSticky} />
      <VideoSection />
      <OurWorksSection />
      <WorkWithSection />
      <HowItWorkSection />
      <AdvantagesSection />
      <WhatYouGetSection />
      <TariffSelectorSection />
      <FAQSection />
      <StartAISection />

      {showScrollButton && (
        <Button
          className={styles.showScrollButton}
          type="primary"
          shape="circle"
          icon={<ArrowUpOutlined className={styles.iconArrow} />}
          size="large"
          onClick={scrollToTop}
        />
      )}

      <ChatButtonWithForm />
    </>
  );
};
