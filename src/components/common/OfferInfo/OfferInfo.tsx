import React from "react";
import { Link } from "react-router-dom";
import { useTypedSelector } from "hooks/useTypedSelector";
import styles from "./OfferInfo.module.scss";

const OfferInfo: React.FC = () => {
  const { user } = useTypedSelector((state) => state.auth);

  return (
    <Link to="/tariffs" className={styles.link}>
      <div className={styles.offerInfo}>
        <div className={styles.details}>
          <div className={styles.name}>
            Ваш тариф
            {user?.profile.user.tariff.is_active ? `${" активен "}` : ""}
            <div style={{ margin: "12px 0", fontSize: 24 }}>
              {user?.profile.user.tariff.is_active
                ? `${user?.profile.user.tariff.days + " дней"}`
                : " Free"}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default OfferInfo;
