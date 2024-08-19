import React from 'react';
import styles from './UserInfo.module.scss';
import { useGetProfilesQuery } from '../../../modules/account/redux/api';
import avatar from '../../../assets/avatar.png';

const UserInfo: React.FC = () => {
  const { data } = useGetProfilesQuery();

  return (
    <div className={styles.userInfo}>
      <img src={data && data[0].picture ? data[0].picture : avatar} alt="User Avatar" className={styles.avatar} />
      <div className={styles.details}>
        <div className={styles.name}>{data ? data[0].user.username : '-'}</div>
        <div className={styles.email}>{data ? data[0].user.email : '-'}</div>
      </div>
    </div>
  );
};

export default UserInfo;
