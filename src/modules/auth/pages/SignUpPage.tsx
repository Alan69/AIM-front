import { SignUpForm } from 'modules/auth/components/SignUpForm/SignUpForm'
import React from 'react'
import styles from './AuthPagesStyle.module.scss'

export const SignUpPage = () => {
  return (
    <div className={styles.container}>
      <div><SignUpForm /></div>
    </div>
  )
}
