import React, { useEffect, useState } from "react";
import { Layout, Button, Dropdown, Menu } from "antd";
import styles from "./Header.module.scss";
import MenuComponent from "../Menu/Menu";
import { DownOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { ReactComponent as IconLogo } from "assets/logo.svg";
import { useTranslation } from "react-i18next";

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState<string>("ru");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") || "ru";
    setLanguage(savedLanguage);
    i18n.changeLanguage(savedLanguage);
  }, [i18n]);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    i18n.changeLanguage(lang);
  };

  const languageMenu = (
    <Menu>
      <Menu.Item key="en" onClick={() => handleLanguageChange("en")}>
        {t("headerLanding.language_menu.english")}
      </Menu.Item>
      <Menu.Item key="ru" onClick={() => handleLanguageChange("ru")}>
        {t("headerLanding.language_menu.russian")}
      </Menu.Item>
    </Menu>
  );

  return (
    <AntHeader className={styles.header}>
      <Link className={styles.logo} to={"/home"}>
        <IconLogo />
      </Link>
      <MenuComponent />
      <div className={styles.actions}>
        <Dropdown overlay={languageMenu} trigger={["click"]}>
          <Button className={styles.languageButton} icon={<DownOutlined />}>
            {language === "ru"
              ? t("headerLanding.language_ru")
              : t("headerLanding.language_en")}
          </Button>
        </Dropdown>
        <Button
          className={styles.startButton}
          type="primary"
          onClick={() => navigate("/login")}
        >
          {t("headerLanding.start_button")}
        </Button>
      </div>
    </AntHeader>
  );
};

export default Header;
