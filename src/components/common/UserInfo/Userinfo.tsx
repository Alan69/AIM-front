import React, { useEffect, useState } from 'react';
import styles from './UserInfo.module.scss';
import avatar from 'assets/avatar.png';
import { useTypedSelector } from 'hooks/useTypedSelector';

const UserInfo: React.FC = () => {
  const { user } = useTypedSelector((state) => state.auth);
  const [profileImage, setProfileImage] = useState<string>(avatar);

  useEffect(() => {
    if (user?.profile.picture) {
      const newImageUrl = `${user.profile.picture}?t=${new Date().getTime()}`;
      setProfileImage(newImageUrl);
    } else {
      setProfileImage(avatar);
    }
  }, [user?.profile.picture]);

  return (
    <div className={styles.userInfo}>
      <img
        src={profileImage}
        alt={user ? user.profile.user.first_name : '-'}
        className={styles.avatar}
        onError={() => setProfileImage(avatar)}
      />
      <div className={styles.details}>
        <div className={styles.name}>{user ? user.profile.user.first_name : '-'}</div>
        <div className={styles.email}>{user ? user.profile.user.email : '-'}</div>
      </div>
    </div>
  );
};

export default UserInfo;
