import React from 'react'
import { LoginForm } from 'modules/auth/components/LoginForm/LoginForm';
import styles from './LoginPage.module.scss'

export const LoginPage = () => {
  return (
    <div className={styles.container}>
      <LoginForm />
    </div>
  )
}
