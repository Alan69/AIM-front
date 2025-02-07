import React from "react";
import { Menu as AntMenu } from "antd";
import styles from "./Menu.module.scss";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Menu = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const isDocPage = 
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/agreement" ||
    location.pathname === "/privacy-policy" ||
    location.pathname === "/terms-and-conditions";

  return (
    <AntMenu mode="horizontal" className={styles.menu}>
      <AntMenu.Item key="examples" className={styles.item}>
        {isDocPage ? (
          <Link to="/home">{t("menuLanding.examples")}</Link>
        ) : (
          <a href="#OurWorksSection">{t("menuLanding.examples")}</a>
        )}
      </AntMenu.Item>
      <AntMenu.Item key="how-it-works" className={styles.item}>
        {isDocPage ? (
          <Link to="/home">{t("menuLanding.howItWorksSection")}</Link>
        ) : (
          <a href="#HowItWorkSection">{t("menuLanding.howItWorksSection")}</a>
        )}
      </AntMenu.Item>
      <AntMenu.Item key="benefits" className={styles.item}>
        {isDocPage ? (
          <Link to="/home">{t("menuLanding.benefits")}</Link>
        ) : (
          <a href="#AdvantagesSection">{t("menuLanding.benefits")}</a>
        )}
      </AntMenu.Item>
      <AntMenu.Item key="what-you-get" className={styles.item}>
        {location.pathname === "/login" ||
        location.pathname === "/signup" ||
        location.pathname === "/agreement" ||
        location.pathname === "/privacy-policy" ||
        location.pathname === "/terms-and-conditions" ? (
          <Link to="/home">{t("menuLanding.whatYouGetSection")}</Link>
        ) : (
          <a href="#WhatYouGetSection">{t("menuLanding.whatYouGetSection")}</a>
        )}
      </AntMenu.Item>
      <AntMenu.Item key="faq">
        {location.pathname === "/login" ||
        location.pathname === "/signup" ||
        location.pathname === "/agreement" ||
        location.pathname === "/privacy-policy" ||
        location.pathname === "/terms-and-conditions" ? (
          <Link to="/home">{t("menuLanding.faqSection")}</Link>
        ) : (
          <a href="#FAQSection">{t("menuLanding.faqSection")}</a>
        )}
      </AntMenu.Item>
      <AntMenu.Item key="privacy-policy">
        <Link to="/privacy-policy">
          {t("footerLanding.bottom.links.privacy_policy")}
        </Link>
      </AntMenu.Item>
      <AntMenu.Item key="terms">
        <Link to="/terms-and-conditions">
          {t("footerLanding.bottom.links.terms_and_conditions")}
        </Link>
      </AntMenu.Item>
    </AntMenu>
  );
};

export default Menu;
