import { Spin } from 'antd'
import React, { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import styles from './UnauthorisedLayout.module.scss';
import Header from './components/Header/Header';

export const UnauthorisedLayout = () => {
  const location = useLocation();

  return (
    <div className={styles.layout}>
      {location.pathname === '/home' ? <Header /> : ''}
      <main className={styles.main}>
        <Suspense fallback={<Spin size="small" />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
