import { Modal, Button, Divider, Typography } from 'antd';

import React, { useState } from 'react';
import 'moment/locale/ru';
import styles from './ModalImageStylesList.module.scss'
import { TImgStylesData } from 'redux/api/imgStyles/imgStylesApi';

type TProps = {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  imgStylesList: TImgStylesData[] | undefined;
  handleChangeCurrentImgStyle: (style: TImgStylesData | undefined) => void
};

const { Title } = Typography;

export const ModalImageStylesList = ({ isModalOpen, setIsModalOpen, imgStylesList, handleChangeCurrentImgStyle }: TProps) => {
  return (
    <Modal
      title="Стили рисунка"
      open={isModalOpen}
      footer={null}
      onClose={() => setIsModalOpen(false)}
      onOk={() => setIsModalOpen(false)}
      onCancel={() => setIsModalOpen(false)}
    >
      <Divider />
      <div className={styles.imgStylesList}>
        {imgStylesList?.map((item) => (
          <div key={item.id} className={styles.imgStylesItem}>
            <Title level={4}>{item.name}</Title>
            <img src={item.picture} alt={item.name} onClick={() => handleChangeCurrentImgStyle(item)} />
          </div>
        ))}
      </div>
    </Modal>
  );
};
