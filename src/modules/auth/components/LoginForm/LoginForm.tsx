import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import styles from './LoginForm.module.scss';
import { useGetAuthUserQuery, useLazyGetAuthUserQuery, useLoginMutation } from 'modules/auth/redux/api';
import { useDispatch } from 'react-redux';
import { authActions } from 'modules/auth/redux/slices/auth.slice';

export const LoginForm = () => {
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [getAuthUser] = useLazyGetAuthUserQuery()

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      const response = await login(values).unwrap().then(() => {
        getAuthUser()
      });
      // @ts-ignore
      const { access: token, refresh: refreshToken } = response;

      dispatch(authActions.setToken({ token, refreshToken }));
      message.success('Login successful!');
    } catch (error) {
      message.error('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h2>Авторизация</h2>
        <Form
          name="login_form"
          className={styles.loginForm}
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Пожалуйста, введите логин!' }]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Логин"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Пожалуйста, введите пароль!' }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Пароль"
            />
          </Form.Item>

          <Form.Item>
            <a className={styles.loginFormForgot} href="">
              Забыли пароль?
            </a>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className={styles.loginFormButton}
              loading={isLoading}
            >
              Login
            </Button>
          </Form.Item>

          <Form.Item>
            <a href="">Регистрация аккаунта</a>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
