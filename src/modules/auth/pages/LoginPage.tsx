import React from 'react'
import { LoginForm } from 'modules/auth/components/LoginForm/LoginForm';
import styles from './AuthPagesStyle.module.scss'

export const LoginPage = () => {
  return (
    <div className={styles.container}>
      <div><LoginForm /></div>
    </div>
  )
}
