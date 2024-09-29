import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import styles from './LoginForm.module.scss';
import { useLoginMutation } from 'modules/auth/redux/api';
import { useDispatch } from 'react-redux';
import { authActions } from 'modules/auth/redux/slices/auth.slice';
import { Link } from 'react-router-dom';

export const LoginForm = () => {
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      const response = await login(values)

      // @ts-ignore
      const { access: token, refresh: refreshToken } = response.data;

      dispatch(authActions.setToken({ token, refreshToken }));
      message.success('Авторизация прошла успешно!');
    } catch (error) {
      message.error('Вход в систему не удался. Пожалуйста, проверьте свои учетные данные.');
    }
  };

  return (
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
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="Пароль"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className={styles.loginFormButton}
            loading={isLoading}
          >
            Войти
          </Button>
        </Form.Item>

        <div className={styles.linksBlock}>
          <Link to="/signup">Регистрация аккаунта</Link>
          <Link className={styles.loginFormForgot} to="/recovery">
            Забыли пароль?
          </Link>
        </div>
      </Form>
    </div>
  );
};
