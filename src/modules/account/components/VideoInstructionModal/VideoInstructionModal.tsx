import React, { useState } from "react";
import ReactPlayer from "react-player";
import questionMark from "assets/questionMark.svg";
import { Button, Modal } from "antd";
import styles from "./VideoInstructionModal.module.scss";
import { useTranslation } from "react-i18next";
import { InfoOutlined } from "@ant-design/icons";

const VideoInstructionModal = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleModalOpen = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const { t } = useTranslation();

  return (
    <div>
      <Button
        className={styles.messageButton}
        type="default"
        shape="circle"
        size="large"
        icon={<InfoOutlined className={styles.iconMessage} />}
        onClick={handleModalOpen}
      ></Button>
      <Modal
        title={t("accountPage.modal.title")}
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={1300}
      >
        <ReactPlayer
          url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          controls
          width="100%"
          height="100%"
          playing={true}
        />
      </Modal>
    </div>
  );
};

export default VideoInstructionModal;
