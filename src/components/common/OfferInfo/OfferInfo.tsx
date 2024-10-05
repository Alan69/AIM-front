import React from 'react';
import { Link } from 'react-router-dom';
import { Tooltip } from 'antd';
import {
  QuestionCircleOutlined
} from '@ant-design/icons';
import { useTypedSelector } from 'hooks/useTypedSelector';
import styles from './OfferInfo.module.scss';

const OfferInfo: React.FC = () => {
  const { user } = useTypedSelector((state) => state.auth);

  return (
    <Link to="/tariffs" className={styles.link}>
      <div className={styles.offerInfo}>
        <div className={styles.details}>
          <div className={styles.name}>
            Ваш тариф
            {user?.profile.user.tariff.is_active ?
              `${' активен ' + user?.profile.user.tariff.days + ' дней'}`
              : ' Free'
            }
            {/* <Tooltip title="1 монета = 1 генерация">
              <span style={{ marginLeft: '4px' }}><QuestionCircleOutlined /></span>
            </Tooltip> */}
          </div>
          <Link to="/tariffs" className={styles.link}>Купить тарифный план</Link>
        </div>
      </div>
    </Link>
  );
};

export default OfferInfo;
