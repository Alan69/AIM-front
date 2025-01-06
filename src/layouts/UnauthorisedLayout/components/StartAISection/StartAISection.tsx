import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import styles from "./StartAISection.module.scss";
import { ReactComponent as IconPlus } from "assets/plus-white.svg";
import { useTypedSelector } from "hooks/useTypedSelector";
import { useTranslation } from "react-i18next";

export const StartAISection = () => {
  const navigate = useNavigate();
  const { token } = useTypedSelector((state) => state.auth);
  const { t } = useTranslation();

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.label}>{t("startAiSection.label")}</div>
        <h2 className={styles.title}>{t("startAiSection.title")}</h2>
        <div className={styles.subtitle}>{t("startAiSection.subtitle")}</div>
        <Button
          className={styles.button}
          onClick={() => navigate(token ? "/tariffs" : "/login")}
        >
          {t("startAiSection.button")}
          <IconPlus className={styles.icon} />
        </Button>
      </div>
    </section>
  );
};
