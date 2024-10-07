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

  const passwordValidator = (rule: any, value: any) => {
    if (!value) {
      return Promise.reject('Пожалуйста, введите пароль!');
    }
    if (value.length < 8) {
      return Promise.reject('Пароль должен содержать минимум 8 символов.');
    }
    if (!/\d.*\d/.test(value)) {
      return Promise.reject('Пароль должен содержать как минимум два числа.');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      return Promise.reject('Пароль должен содержать как минимум один спецсимвол.');
    }
    return Promise.resolve();
  };

  const confirmPasswordValidator = ({ getFieldValue }: any) => ({
    validator(_: any, value: any) {
      if (!value || getFieldValue('password') === value) {
        return Promise.resolve();
      }
      return Promise.reject('Пароли не совпадают!');
    },
  });

  const onFinish = (values: { email: string; password: string; password2: string }) => {
    signUp({ ...values, first_name: 'Имя', last_name: 'Фамилия' })
      .unwrap()
      .then((response) => {
        const { access: token, refresh: refreshToken } = response;

        dispatch(authActions.setToken({ token, refreshToken }));
        message.success('Регистрация успешна! Пожалуйста, войдите в систему.');
      })
      .catch((error) => {
        const errorMsg = error?.data?.error || 'Ошибка регистрации. Пожалуйста, проверьте введенные данные.';
        message.error(errorMsg);
      });
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
          rules={[
            { required: true },
            { validator: passwordValidator }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="Пароль"
          />
        </Form.Item>

        <Form.Item
          name="password2"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Пожалуйста, подтвердите пароль!' },
            confirmPasswordValidator
          ]}
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
