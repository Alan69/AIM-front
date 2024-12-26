import React from "react";
import styles from "./WhatYouGetSection.module.scss";
import gif1 from "assets/image/what-you-get-section/1.gif";
import gif2 from "assets/image/what-you-get-section/2.gif";
import gif3 from "assets/image/what-you-get-section/3.gif";
import gif4 from "assets/image/what-you-get-section/4.gif";
import git5 from "assets/image/what-you-get-section/5.gif";
import gif6 from "assets/image/what-you-get-section/6.gif";
import { useTranslation } from "react-i18next";

export const WhatYouGetSection = () => {
  const { t } = useTranslation();
  const benefits = t("whatYouGetSection.benefits", { returnObjects: true }) as {
    title: string;
    description: string;
    icon: string;
  }[];

  const icons = [gif1, gif2, gif3, gif4, git5, gif6];

  return (
    <section className={styles.section} id="WhatYouGetSection">
      <div className={styles.head}>
        <div className={styles.label}>{t("whatYouGetSection.label")}</div>
        <h2 className={styles.title}>{t("whatYouGetSection.title")}</h2>
      </div>
      <div className={styles.benefit}>
        {benefits.map((benefit, index) => (
          <div key={index} className={styles.benefit__item}>
            <div className={styles.iconWrapper}>
              <img
                src={icons[index]}
                alt={benefit.title}
                className={styles.icon}
              />
            </div>
            <h3 className={styles.benefit__item__title}>{benefit.title}</h3>
            <p className={styles.benefit__item__description}>
              {benefit.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
