import React from "react";
import ReactPlayer from "react-player";
import { Button, Modal } from "antd";
import { InfoOutlined } from "@ant-design/icons";
import styles from "./VideoInstructionModal.module.scss";
import { useTranslation } from "react-i18next";

interface VideoInstructionModalProps {
  isModalVisible: boolean;
  onOpen: () => void;
  onClose: () => void;
  playerRef: React.RefObject<ReactPlayer>;
  src: string;
}

const VideoInstructionModal: React.FC<VideoInstructionModalProps> = ({
  isModalVisible,
  onOpen,
  onClose,
  playerRef,
  src,
}) => {
  const { t } = useTranslation();
  return (
    <div>
      <Button
        className={styles.messageButton}
        type="default"
        shape="circle"
        size="large"
        icon={<InfoOutlined className={styles.iconMessage} />}
        onClick={onOpen}
      ></Button>
      <Modal
        title={t("accountPage.modal.title")}
        visible={isModalVisible}
        onCancel={onClose}
        footer={null}
        width={1300}
      >
        <ReactPlayer
          ref={playerRef}
          url={src}
          controls
          width="100%"
          height="100%"
          playing={isModalVisible}
        />
      </Modal>
    </div>
  );
};

export default VideoInstructionModal;
