import React from "react";
import { Link } from "react-router-dom";
import { useTypedSelector } from "hooks/useTypedSelector";
import { useTranslation } from "react-i18next";
import styles from "./OfferInfo.module.scss";

const OfferInfo: React.FC = () => {
  const { user } = useTypedSelector((state) => state.auth);
  const { t } = useTranslation();

  return (
    <Link to="/tariffs" className={styles.link}>
      <div className={styles.offerInfo}>
        <div className={styles.details}>
          <div className={styles.name}>
            {t("offerInfo.your_tariff")}{" "}
            {user?.profile.user.tariff.is_active
              ? t("offerInfo.is_active")
              : ""}
            <div style={{ margin: "12px 0", fontSize: 24 }}>
              {user?.profile.user.tariff.is_active
                ? `${user?.profile.user.tariff.days} ${t("offerInfo.days_left")}`
                : t("offerInfo.free")}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default OfferInfo;
