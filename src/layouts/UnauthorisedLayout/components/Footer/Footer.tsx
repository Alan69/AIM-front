import styles from "./Footer.module.scss";
import cn from "classnames";
import {
  FacebookOutlined,
  InstagramOutlined,
  LinkedinOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.column}>
          <a href="#" className={styles.item}>
            {t("footer-landing.columns.blog")}
          </a>
          <a href="#" className={styles.item}>
            {t("footer-landing.columns.latest_generations")}
          </a>
          <a href="#" className={styles.item}>
            {t("footer-landing.columns.terms_of_use")}
          </a>
          <a href="#" className={styles.item}>
            {t("footer-landing.columns.reviews")}
          </a>
        </div>
        <div className={styles.column}>
          <div className={styles.item}>
            {t("footer-landing.columns.follow_us")}
          </div>
          <div className={styles.socialIcons}>
            <a href="https://www.facebook.com/people/AimMagic/61560400936181/">
              <FacebookOutlined />
            </a>
            <a href="https://www.instagram.com/aimmagic/">
              <InstagramOutlined />
            </a>
            <a href="https://www.linkedin.com/company/a-gene/">
              <LinkedinOutlined />
            </a>
          </div>
        </div>
        <div className={cn(styles.column, styles.blockEmail)}>
          <div className={styles.blockEmail__head}>
            <div>{t("footer-landing.columns.contact_us.title")}</div>
            <svg
              className={styles.iconEmail}
              xmlns="http://www.w3.org/2000/svg"
              width="61"
              height="47"
              viewBox="0 0 61 47"
              fill="none"
            >
              <path
                d="M60.4997 46.665V38.3105H0.5V46.665H60.4997Z"
                fill="#005FAA"
              />
              <path
                d="M60.4997 8.69038V0.335938H0.5V8.69038H60.4997Z"
                fill="#005FAA"
              />
              <path
                d="M54.0448 2.23438L60.5005 8.69008L30.5006 37.9306L24.0449 31.4749L54.0448 2.23438Z"
                fill="#005FAA"
              />
              <path
                d="M6.9552 2.23438L0.499538 8.69008L30.4994 37.9306L36.9551 31.4749L6.9552 2.23438Z"
                fill="#005FAA"
              />
            </svg>
          </div>
          <a
            className={styles.blockEmail__link}
            href="mailto:info@aimmagic.com"
          >
            {t("footer-landing.columns.contact_us.email")}
          </a>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <div className={styles.footerBottom__text}>
          {t("footer-landing.bottom.text")}
        </div>
        <div className={styles.links}>
          <Link
            to="/agreement"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            {t("footer-landing.bottom.links.agreement")}
          </Link>
          <Link
            to="/policy"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            {t("footer-landing.bottom.links.privacy_policy")}
          </Link>
        </div>
      </div>
    </footer>
  );
};
