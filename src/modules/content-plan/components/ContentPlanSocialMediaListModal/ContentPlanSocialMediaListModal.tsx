import { Modal, Button, Divider, Typography } from 'antd';
import cn from 'classnames'

import React, { useState } from 'react';
import 'moment/locale/ru';
import styles from './ContentPlanSocialMediaListModal.module.scss'
import { TSocialMediaByCurrentCompanyData } from 'modules/social-media/redux/api';

type TProps = {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  socialMediaList: TSocialMediaByCurrentCompanyData[] | undefined
  handleSelectNewSocialMedia: (socialMedia: TSocialMediaByCurrentCompanyData) => void
  selectNewSocialMedia: TSocialMediaByCurrentCompanyData | null;
};

const { Title } = Typography;

export const ContentPlanSocialMediaListModal = ({
  isModalOpen,
  setIsModalOpen,
  socialMediaList,
  handleSelectNewSocialMedia,
  selectNewSocialMedia,
}: TProps) => {
  const [selectCurrentSocialMedia, setSelectCurrentSocialMedia] = useState<TSocialMediaByCurrentCompanyData | null>(selectNewSocialMedia);

  return (
    <Modal
      title="Выбрать социальную сеть"
      open={isModalOpen}
      onOk={() => setIsModalOpen(false)}
      onCancel={() => setIsModalOpen(false)}
      width={600}
      footer={[
        <Button
          key="schedule"
          type="default"
          onClick={() => {
            selectCurrentSocialMedia && handleSelectNewSocialMedia(selectCurrentSocialMedia);
            setIsModalOpen(false);
          }}
          style={{
            borderRadius: '16px',
            width: '100%',
          }}
          disabled={!selectCurrentSocialMedia}
        >
          Выбрать
          {/* <b>{selectCurrentSocialMedia?.title}</b> */}
        </Button>
      ]}
    >
      <Divider />
      <div className={styles.itemList}>
        {socialMediaList?.map((item) => (
          <div key={item.id} className={cn(styles.item, selectCurrentSocialMedia?.id === item.id ? styles.item__isActive : '')} onClick={() => setSelectCurrentSocialMedia(item)}>
            <img width={32} height={32} src={item?.platform.icon} alt={item?.username} />
            <Title level={5} className={styles.username}>{item?.username}</Title>
          </div>
        ))}
      </div>
      <Divider />
    </Modal>
  );
};
