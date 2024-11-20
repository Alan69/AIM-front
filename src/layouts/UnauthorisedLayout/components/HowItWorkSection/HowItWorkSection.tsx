import React from "react";
import styles from "./HowItWorkSection.module.scss";
import card from "assets/image/how-it-works-section/card-bg.png";
import icon1 from "assets/image/how-it-works-section/1.svg";
import icon2 from "assets/image/how-it-works-section/2.svg";
import { useTranslation } from "react-i18next";

export const HowItWorkSection = () => {
  const { t } = useTranslation();
  const steps = t("how_it_works.steps", { returnObjects: true }) as {
    number: string;
    title: string;
    description: string;
  }[];

  return (
    <section className={styles.section} id="HowItWorkSection">
      <h2 className={styles.title}>{t("how_it_works.title")}</h2>
      <div className={styles.card}>
        {steps.map((step, index) => (
          <div
            key={index}
            className={styles.card__item}
            style={index === 2 ? { background: `url('${card}')` } : {}}
          >
            <div className={styles.card__item__title}>{step.number}</div>
            <div className={styles.card__item__bottom}>
              <img
                className={styles.icon}
                src={index === 1 ? icon2 : icon1}
                alt={`icon${index + 1}`}
              />
              <div className={styles.card__item__whiteBlock}>
                <div className={styles.card__item__whiteBlock__title}>
                  {step.title}
                </div>
                <div className={styles.card__item__whiteBlock__descr}>
                  {step.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
