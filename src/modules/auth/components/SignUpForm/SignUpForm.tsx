import React from "react";
import { Form, Input, Button, message } from "antd";
import { LockOutlined, UserOutlined, PhoneOutlined } from "@ant-design/icons";
import styles from "./SignUpForm.module.scss";
import { useSignUpMutation } from "modules/auth/redux/api";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { authActions } from "modules/auth/redux/slices/auth.slice";
import { useTranslation } from "react-i18next";

export const SignUpForm = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [signUp, { isLoading }] = useSignUpMutation();

  const passwordValidator = (rule: any, value: any) => {
    if (!value) {
      return Promise.reject(t("signUpForm.password_required"));
    }
    if (value.length < 8) {
      return Promise.reject(t("signUpForm.password_invalid"));
    }
    if (!/\d.*\d/.test(value)) {
      return Promise.reject(t("signUpForm.password_invalid"));
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      return Promise.reject(t("signUpForm.password_invalid"));
    }
    return Promise.resolve();
  };

  const confirmPasswordValidator = ({ getFieldValue }: any) => ({
    validator(_: any, value: any) {
      if (!value || getFieldValue("password") === value) {
        return Promise.resolve();
      }
      return Promise.reject(t("signUpForm.password_mismatch"));
    },
  });

  const onFinish = (values: {
    email: string;
    password: string;
    password2: string;
    phone_number: string;
  }) => {
    signUp({ ...values, first_name: "Имя", last_name: "Фамилия" })
      .unwrap()
      .then((response) => {
        const { access: token, refresh: refreshToken } = response;

        dispatch(authActions.setToken({ token, refreshToken }));
        message.success(t("signUpForm.success_message"));
      })
      .catch((error) => {
        const errorMsg = error?.data?.error || t("signUpForm.error_message");
        message.error(errorMsg);
      });
  };

  return (
    <div className={styles.signUpBox}>
      <h2>{t("signUpForm.title")}</h2>
      <Form
        name="signup_form"
        className={styles.signUpForm}
        onFinish={onFinish}
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: t("signUpForm.email_required") },
            {
              type: "email",
              message: t("signUpForm.email_invalid"),
            },
          ]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder={t("signUpForm.email_placeholder")}
          />
        </Form.Item>

        <Form.Item
          name="phone_number"
          rules={[
            { required: true, message: t("signUpForm.phone_required") },
            {
              pattern: /^\+7\d{10}$/,
              message: t("signUpForm.phone_invalid"),
            },
          ]}
        >
          <Input
            prefix={<PhoneOutlined className="site-form-item-icon" />}
            placeholder={t("signUpForm.phone_placeholder")}
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true }, { validator: passwordValidator }]}
        >
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder={t("signUpForm.password_placeholder")}
          />
        </Form.Item>

        <Form.Item
          name="password2"
          dependencies={["password"]}
          rules={[
            {
              required: true,
              message: t("signUpForm.confirm_password_placeholder"),
            },
            confirmPasswordValidator,
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder={t("signUpForm.confirm_password_placeholder")}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className={styles.signUpFormButton}
            loading={isLoading}
          >
            {t("signUpForm.submit_button")}
          </Button>
        </Form.Item>

        <Form.Item>
          <Link to="/login">{t("signUpForm.login_link")}</Link>
        </Form.Item>
      </Form>
    </div>
  );
};
