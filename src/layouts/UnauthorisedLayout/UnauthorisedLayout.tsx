import { Spin } from 'antd'
import React, { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import styles from './UnauthorisedLayout.module.scss';

export const UnauthorisedLayout = () => {
  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <Suspense fallback={<Spin size="small" />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  )
}
