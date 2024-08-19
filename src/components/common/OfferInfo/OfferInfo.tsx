import React from 'react';
import styles from './OfferInfo.module.scss';
import coins from '../../../assets/coins.jpeg';
import { Link } from 'react-router-dom';
import { Tooltip } from 'antd';

const OfferInfo: React.FC = () => {
  return (
    <Link to="/account/offers" className={styles.link}>
      <div className={styles.offerInfo}>
        <img src={coins} alt="User Avatar" className={styles.avatar} />
        <div className={styles.details}>
          <div className={styles.name}>Монет: 10 <Tooltip title="1 монета = 1 генерация">
            <span>sds</span>
          </Tooltip></div>
          <Link to="/account/offers" className={styles.link}>Купить тарифный план</Link>
        </div>
      </div>
    </Link>
  );
};

export default OfferInfo;
