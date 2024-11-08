import React, { useState } from "react";
import { Modal, Button, Input, Form, message } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import { useSubmitFeedbackMutation } from "../../../../redux/api/feedback/feedbackApi";
import styles from "./ChatButtonWithForm.module.scss";

const ChatButtonWithForm: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("+7"); // Начальное значение с +7
  const [submitFeedback, { isLoading }] = useSubmitFeedbackMutation();
  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setPhoneNumber("+7");
  };

  const handleFinish = async (values: {
    name: string;
    phone_number: string;
  }) => {
    try {
      const response = await submitFeedback({
        ...values,
        phone_number: phoneNumber,
      }).unwrap();

      message.success(response.message);
      form.resetFields();
      setPhoneNumber("+7");
      setIsModalVisible(false);
    } catch (error) {
      message.error(
        "Не удалось отправить сообщение. Пожалуйста, попробуйте еще раз."
      );
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    if (!value.startsWith("+7")) {
      value = "+7" + value.replace(/\D/g, "");
    } else {
      value = "+7" + value.slice(2).replace(/\D/g, "");
    }

    if (value.length <= 12) {
      setPhoneNumber(value);
    }
  };

  return (
    <>
      <Button
        className={styles.messageButton}
        type="default"
        shape="circle"
        size="large"
        icon={<MessageOutlined className={styles.iconMessage} />}
        onClick={showModal}
      />

      <Modal
        title="Привет! Чем мы можем помочь?"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        className={styles.chatModal}
      >
        <div className={styles.chatForm}>
          <h3>Отправьте нам сообщение</h3>
          <p>Мы ответим, как только сможем</p>

          <Form
            form={form}
            className={styles.formBody}
            layout="vertical"
            onFinish={handleFinish}
            initialValues={{ phone_number: phoneNumber }}
          >
            <Form.Item
              label="Имя"
              name="name"
              rules={[
                { required: true, message: "Пожалуйста, введите ваше имя" },
              ]}
            >
              <Input placeholder="Введите ваше имя" />
            </Form.Item>

            <Form.Item
              label="Номер телефона"
              name="phone_number"
              rules={[
                {
                  required: true,
                  message: "Пожалуйста, введите ваш номер телефона",
                },
                {
                  pattern: /^\+7\d{10}$/,
                  message:
                    "Введите корректный номер телефона в формате +7XXXXXXXXXX",
                },
              ]}
            >
              <Input
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="Введите ваш номер телефона"
                maxLength={12}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={isLoading}
              >
                Отправить сообщение
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default ChatButtonWithForm;
