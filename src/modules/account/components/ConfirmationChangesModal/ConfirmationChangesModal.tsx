import React from "react";
import { Modal } from "antd";

interface ConfirmationChangesModalProps {
  visible?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const ConfirmationChangesModal: React.FC<
  ConfirmationChangesModalProps
> = ({ visible, onConfirm, onCancel }) => {
  return (
    <Modal
      visible={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      title="Несохранённые изменения"
      okText="Сохранить"
      cancelText="Отмена"
    >
      <p>
        У вас есть несохранённые изменения. Вы уверены, что хотите покинуть
        страницу?
      </p>
    </Modal>
  );
};
