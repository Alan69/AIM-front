import React from "react";
import { Form, Input, Button, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import styles from "./LoginForm.module.scss";
import { useLoginMutation } from "modules/auth/redux/api";
import { useDispatch } from "react-redux";
import { authActions } from "modules/auth/redux/slices/auth.slice";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const LoginForm = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const onFinish = async (values: { email: string; password: string }) => {
    const dataToSend = {
      ...values,
      email: values.email.toLowerCase(),
    };

    try {
      const response = await login(dataToSend);

      // @ts-ignore
      const { access: token, refresh: refreshToken } = response.data;

      dispatch(authActions.setToken({ token, refreshToken }));
      message.success(t("loginForm.login_success"));
    } catch (error) {
      message.error(t("loginForm.login_error"));
    }
  };

  return (
    <div className={styles.loginBox}>
      <h2>{t("loginForm.title")}</h2>
      <Form
        name="loginForm"
        className={styles.loginForm}
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: t("loginForm.email_placeholder") },
          ]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder={t("loginForm.email_placeholder")}
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            { required: true, message: t("loginForm.password_placeholder") },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder={t("loginForm.password_placeholder")}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className={styles.loginFormButton}
            loading={isLoading}
          >
            {t("loginForm.submit_button")}
          </Button>
        </Form.Item>

        <div className={styles.linksBlock}>
          <Link to="/signup">{t("loginForm.registration_link")}</Link>
          <Link className={styles.loginFormForgot} to="/login">
            {t("loginForm.forgot_password_link")}
          </Link>
        </div>
      </Form>
    </div>
  );
};
