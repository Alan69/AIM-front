import React, { useEffect, useState } from "react";
import { Modal, Button, Input, Form, message } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import { useSubmitFeedbackMutation } from "../../../../redux/api/feedback/feedbackApi";
import styles from "./ChatButtonWithForm.module.scss";
import Title from "antd/es/typography/Title";
import { useTranslation } from "react-i18next";

const ChatButtonWithForm: React.FC = () => {
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("+7");
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
      message.error(t("chatButton.form.error_message"));
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

  useEffect(() => {
    setTimeout(() => {
      setIsModalVisible(true);
    }, 3000);
  }, []);

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
        title={
          <Title level={2} style={{ textAlign: "center" }}>
            {t("chatButton.modal_title")}
          </Title>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        className={styles.chatModal}
      >
        <div className={styles.chatForm}>
          <h3>{t("chatButton.form_title")}</h3>

          <Form
            form={form}
            className={styles.formBody}
            layout="vertical"
            onFinish={handleFinish}
            initialValues={{ phone_number: phoneNumber }}
          >
            <Form.Item
              label={t("chatButton.form.name_label")}
              name="name"
              rules={[
                { required: true, message: t("chatButton.form.name_error") },
              ]}
            >
              <Input placeholder={t("chatButton.form.name_placeholder")} />
            </Form.Item>

            <Form.Item
              label={t("chatButton.form.phone_label")}
              name="phone_number"
              rules={[
                {
                  required: true,
                  message: t("chatButton.form.phone_error"),
                },
                {
                  pattern: /^\+7\d{10}$/,
                  message: t("chatButton.form.phone_format_error"),
                },
              ]}
            >
              <Input
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder={t("chatButton.form.phone_placeholder")}
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
                {t("chatButton.form.submit_button")}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default ChatButtonWithForm;
