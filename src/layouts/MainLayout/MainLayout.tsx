import { Spin } from 'antd'
import { Footer, Header } from 'antd/es/layout/layout'
import React, { memo, Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import MenuNav from '../../components/common/Menu/Menu';
import styles from './MainLayout.module.scss';

export const MainLayout = memo(function MainLayout() {
  return (
    <div className={styles.layoutBody}>
      {/* <Header /> */}
      <MenuNav />
      <div className={styles.body}>
        <Suspense fallback={<Spin size="small" />}>
          <Outlet />
        </Suspense>
      </div>
      {/* <Footer /> */}
    </div>
  )
})
