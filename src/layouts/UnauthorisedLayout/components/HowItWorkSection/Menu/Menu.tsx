import React from "react";
import { Menu as AntMenu } from "antd";
import styles from "./Menu.module.scss";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Menu = () => {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <AntMenu mode="horizontal" className={styles.menu}>
      <AntMenu.Item key="examples" className={styles.item}>
        {location.pathname === "/login" ||
        location.pathname === "/signup" ||
        location.pathname === "/agreement" ||
        location.pathname === "/policy" ? (
          <Link to="/home">{t("menu-landing.examples")}</Link>
        ) : (
          <a href="#OurWorksSection">{t("menu-landing.examples")}</a>
        )}
      </AntMenu.Item>
      <AntMenu.Item key="how-it-works" className={styles.item}>
        {location.pathname === "/login" ||
        location.pathname === "/signup" ||
        location.pathname === "/agreement" ||
        location.pathname === "/policy" ? (
          <Link to="/home">{t("menu-landing.how_it_works")}</Link>
        ) : (
          <a href="#HowItWorkSection">{t("menu-landing.how_it_works")}</a>
        )}
      </AntMenu.Item>
      <AntMenu.Item key="benefits" className={styles.item}>
        {location.pathname === "/login" ||
        location.pathname === "/signup" ||
        location.pathname === "/agreement" ||
        location.pathname === "/policy" ? (
          <Link to="/home">{t("menu-landing.benefits")}</Link>
        ) : (
          <a href="#AdvantagesSection">{t("menu-landing.benefits")}</a>
        )}
      </AntMenu.Item>
      <AntMenu.Item key="what-you-get" className={styles.item}>
        {location.pathname === "/login" ||
        location.pathname === "/signup" ||
        location.pathname === "/agreement" ||
        location.pathname === "/policy" ? (
          <Link to="/home">{t("menu-landing.what_you_get")}</Link>
        ) : (
          <a href="#WhatYouGetSection">{t("menu-landing.what_you_get")}</a>
        )}
      </AntMenu.Item>
      <AntMenu.Item key="faq">
        {location.pathname === "/login" ||
        location.pathname === "/signup" ||
        location.pathname === "/agreement" ||
        location.pathname === "/policy" ? (
          <Link to="/home">{t("menu-landing.faq")}</Link>
        ) : (
          <a href="#FAQSection">{t("menu-landing.faq")}</a>
        )}
      </AntMenu.Item>
    </AntMenu>
  );
};

export default Menu;
