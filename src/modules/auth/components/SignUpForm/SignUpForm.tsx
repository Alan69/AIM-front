import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import styles from './SignUpForm.module.scss';
import { useSignUpMutation } from 'modules/auth/redux/api';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authActions } from 'modules/auth/redux/slices/auth.slice';

export const SignUpForm = () => {
  const dispatch = useDispatch();
  const [signUp, { isLoading }] = useSignUpMutation();

  const onFinish = async (values: { email: string; password: string; password2: string }) => {
    if (values.password !== values.password2) {
      message.error('Пароли не совпадают!');
      return;
    }

    try {
      const response = await signUp({ ...values, first_name: 'Имя', last_name: 'Фамилия' });
      // @ts-ignore
      const { access: token, refresh: refreshToken } = response.data;

      dispatch(authActions.setToken({ token, refreshToken }));
      message.success('Регистрация успешна! Пожалуйста, войдите в систему.');
    } catch (error) {
      message.error('Ошибка регистрации. Пожалуйста, проверьте введенные данные.');
    }
  };

  return (
    <div className={styles.signUpBox}>
      <h2>Регистрация</h2>
      <Form
        name="signup_form"
        className={styles.signUpForm}
        onFinish={onFinish}
      >
        <Form.Item
          name="email"
          rules={[{ required: true, message: 'Пожалуйста, введите email!' }]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="Email"
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

        <Form.Item
          name="password2"
          rules={[{ required: true, message: 'Пожалуйста, подтвердите пароль!' }]}
        >
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="Подтверждение пароля"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className={styles.signUpFormButton}
            loading={isLoading}
          >
            Создать
          </Button>
        </Form.Item>

        <Form.Item>
          <Link to="/login">Есть аккаунт?</Link>
        </Form.Item>
      </Form>
    </div>
  );
};
