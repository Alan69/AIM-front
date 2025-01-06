import React from "react";
import cn from "classnames";
import styles from "./AdvantagesSection.module.scss";
import icon1 from "assets/image/advantages-section/1.svg";
import icon2 from "assets/image/advantages-section/2.svg";
import icon3 from "assets/image/advantages-section/3.svg";
import icon4 from "assets/image/advantages-section/4.svg";
import icon5 from "assets/image/advantages-section/5.svg";
import icon6 from "assets/image/advantages-section/6.svg";
import icon7 from "assets/image/advantages-section/7.svg";
import icon8 from "assets/image/advantages-section/8.svg";
import { useTranslation } from "react-i18next";

export const AdvantagesSection = () => {
  const { t } = useTranslation();
  const advantages = t("advantagesSection.items", {
    returnObjects: true,
  }) as string[];

  return (
    <section className={styles.section} id="AdvantagesSection">
      <h2 className={styles.title}>
        {t("advantagesSection.title").split(" ")[0]} <br />{" "}
        {t("advantagesSection.title").split(" ").slice(1).join(" ")}
      </h2>
      <div className={styles.advantagesBlock}>
        <div className={cn(styles.advantagesRow, styles.advantagesRow__end)}>
          <div className={cn(styles.advantageItem, styles.advantageItem__big)}>
            <div className={styles.advantageItem__title}>{advantages[0]}</div>
            <img
              className={styles.advantageItem__icon}
              src={icon1}
              alt="icon1"
            />
          </div>
        </div>
        <div className={styles.advantagesRow}>
          <div className={cn(styles.advantageItem, styles.advantageItem__big)}>
            <div className={styles.advantageItem__title}>{advantages[1]}</div>
            <img
              className={styles.advantageItem__icon}
              src={icon2}
              alt="icon2"
            />
          </div>
          <div
            className={cn(styles.advantageItem, styles.advantageItem__reverse)}
          >
            <img
              className={styles.advantageItem__icon}
              src={icon3}
              alt="icon3"
            />
            <div className={styles.advantageItem__title}>{advantages[2]}</div>
          </div>
        </div>
        <div className={styles.advantagesRow}>
          <div className={styles.advantageItem}>
            <div className={styles.advantageItem__title}>{advantages[3]}</div>
            <img
              className={styles.advantageItem__icon}
              src={icon4}
              alt="icon4"
            />
          </div>
          <div
            className={cn(styles.advantageItem, styles.advantageItem__reverse)}
          >
            <img
              className={styles.advantageItem__icon}
              src={icon5}
              alt="icon5"
            />
            <div className={styles.advantageItem__title}>{advantages[4]}</div>
          </div>
        </div>
        <div className={cn(styles.advantagesRow, styles.advantagesRow__end)}>
          <div className={cn(styles.advantageItem, styles.advantageItem__big)}>
            <div className={styles.advantageItem__title}>{advantages[5]}</div>
            <img
              className={styles.advantageItem__icon}
              src={icon6}
              alt="icon6"
            />
          </div>
        </div>
        <div className={styles.advantagesRow}>
          <div className={cn(styles.advantageItem, styles.advantageItem__big)}>
            <div className={styles.advantageItem__title}>{advantages[6]}</div>
            <img
              className={styles.advantageItem__icon}
              src={icon7}
              alt="icon7"
            />
          </div>
          <div
            className={cn(styles.advantageItem, styles.advantageItem__reverse)}
          >
            <img
              className={styles.advantageItem__icon}
              src={icon8}
              alt="icon8"
            />
            <div className={styles.advantageItem__title}>{advantages[7]}</div>
          </div>
        </div>
      </div>
    </section>
  );
};
