import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import cn from "classnames";
import { ReactComponent as IconPlus } from "assets/plus-white.svg";
import { useTypedSelector } from "hooks/useTypedSelector";
import { useTranslation } from "react-i18next";
import styles from "./HeroSection.module.scss";

type TProps = {
  isSticky: boolean;
};

export const HeroSection = ({ isSticky }: TProps) => {
  const navigate = useNavigate();
  const { token } = useTypedSelector((state) => state.auth);
  const { t } = useTranslation();

  const features = t("hero.features", { returnObjects: true }) as string[];

  const handleScrollToTariff = () => {
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

  const iconChecked = (
    <svg
      className={styles.iconChecked}
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M23.5 10L13.5 20L10 16.5" stroke="#005FAA" stroke-width="2" />
      <path d="M7 13.5L8.5 15" stroke="#005FAA" stroke-width="2" />
    </svg>
  );

  return (
    <section className={styles.section} id="hero-section">
      <h1 className={styles.title}>{t("hero.title")}</h1>
      <h3 className={styles.subtitle}>{t("hero.subtitle")}</h3>
      <div
        className={cn(styles.actions, isSticky ? styles.actions__hidden : "")}
      >
        <Button className={styles.tariffBtn} onClick={handleScrollToTariff}>
          {t("hero.tariffs_button")}
        </Button>
        <Button
          className={styles.startBtn}
          onClick={() => navigate(token ? "/tariffs" : "/login")}
        >
          {t("hero.start_button")} <IconPlus className={styles.iconPlus} />
        </Button>
      </div>
      <div className={styles.feature}>
        {features.map((feature, index) => (
          <div key={index} className={styles.feature__item}>
            {iconChecked}
            <span className={styles.feature__item__text}>{feature}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
