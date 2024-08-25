import React from 'react';
import styles from './UserInfo.module.scss';
import avatar from '../../../assets/avatar.png';
import { useTypedSelector } from 'hooks/useTypedSelector';

const UserInfo: React.FC = () => {
  const { user } = useTypedSelector((state) => state.auth);

  const baseURL = 'http://195.49.210.209';

  const profileImage = user?.profile.picture ? `${baseURL}${user.profile.picture}` : avatar;

  return (
    <div className={styles.userInfo}>
      <img
        src={profileImage}
        alt={user ? user.profile.user.first_name : '-'}
        className={styles.avatar}
      />
      <div className={styles.details}>
        <div className={styles.name}>{user ? user.profile.user.first_name : '-'}</div>
        <div className={styles.email}>{user ? user.profile.user.email : '-'}</div>
      </div>
    </div>
  );
};

export default UserInfo;
