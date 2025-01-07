import React from "react";
import { Modal } from "antd";

interface ConfirmationChangesModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  okText: string;
  cancelText: string;
}

export const ConfirmationChangesModal: React.FC<
  ConfirmationChangesModalProps
> = ({ visible, onConfirm, onCancel, title, message, okText, cancelText }) => {
  return (
    <Modal
      open={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      title={title}
      okText={okText}
      cancelText={cancelText}
    >
      <p>{message}</p>
    </Modal>
  );
};
