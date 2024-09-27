import { Spin } from 'antd'
import React, { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import styles from './UnauthorisedLayout.module.scss';
import Header from './components/Header/Header';

export const UnauthorisedLayout = () => {

  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <Suspense fallback={<Spin size="small" />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
