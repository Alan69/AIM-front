import React from "react";
import styles from "./OurWorksSection.module.scss";
import works1 from "assets/image/works/example1.png";
import works2 from "assets/image/works/example2.png";
import works3 from "assets/image/works/example3.png";
import works4 from "assets/image/works/example4.png";
import works5 from "assets/image/works/example5.png";
import works6 from "assets/image/works/example6.png";
import works7 from "assets/image/works/example7.png";
import works8 from "assets/image/works/example8.png";
import works9 from "assets/image/works/example9.png";
import works10 from "assets/image/works/example10.png";
import works11 from "assets/image/works/example11.png";
import works12 from "assets/image/works/example12.png";
import hand from "assets/image/works/hand.svg";
// @ts-ignore
import videoSrc from "assets/card.mp4";
// @ts-ignore
import videoSrc2 from "assets/card_1.mp4";
import { useIsXlTablet, useIsTablet } from "hooks/media";
import { useTranslation } from "react-i18next";

export const OurWorksSection = () => {
  const isTablet = useIsTablet();
  const isXlTablet = useIsXlTablet();
  const { t } = useTranslation();

  return (
    <section className={styles.section} id="OurWorksSection">
      <h3 className={styles.title}>{t("ourWorksSection.title")}</h3>
      <div className={styles.works}>
        <div className={styles.works__block}>
          <div className={styles.works__item}>
            <img src={works1} alt="works1" />
          </div>
          <div className={styles.works__item}>
            <img src={works2} alt="works2" />
          </div>
          <div className={styles.works__item}>
            <img src={works3} alt="works3" />
          </div>
          {isXlTablet ? (
            ""
          ) : (
            <>
              <div className={styles.works__item}>
                <img src={works4} alt="works4" />
              </div>
              <div className={styles.works__item}>
                <img src={works5} alt="works5" />
              </div>
              <div className={styles.works__item}>
                <img src={works6} alt="works6" />
              </div>
            </>
          )}
        </div>
        <div className={styles.works__block__hand}>
          <div className={styles.works__hand}>
            <img src={hand} alt="hand" />
            {isTablet ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                controls={false}
                className={styles.video}
              >
                <source src={videoSrc2} type="video/mp4" />
              </video>
            ) : (
              <video
                autoPlay
                muted
                loop
                playsInline
                controls={false}
                className={styles.video}
              >
                <source src={videoSrc} type="video/mp4" />
              </video>
            )}
          </div>
        </div>
        <div className={styles.works__block}>
          <div className={styles.works__item}>
            <img src={works7} alt="works7" />
          </div>
          <div className={styles.works__item}>
            <img src={works8} alt="works8" />
          </div>
          <div className={styles.works__item}>
            <img src={works9} alt="works9" />
          </div>
          {isXlTablet ? (
            ""
          ) : (
            <>
              <div className={styles.works__item}>
                <img src={works10} alt="works10" />
              </div>
              <div className={styles.works__item}>
                <img src={works11} alt="works11" />
              </div>
              <div className={styles.works__item}>
                <img src={works12} alt="works12" />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
