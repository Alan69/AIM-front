import React, { memo, Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Spin, Typography } from 'antd'
import { Footer, Header } from 'antd/es/layout/layout'
import {
  FacebookOutlined,
  InstagramOutlined,
  LinkedinOutlined
} from '@ant-design/icons';
import MenuNav from '../../components/common/Menu/Menu';
import styles from './MainLayout.module.scss';

const { Text } = Typography;

export const MainLayout = memo(function MainLayout() {
  return (
    <div className={styles.layoutBody}>
      {/* <Header /> */}
      <MenuNav />
      <div className={styles.body}>
        <Suspense fallback={<Spin size="small" />}>
          <Outlet />
        </Suspense>
        <Footer>
          <div className={styles.footerContainer}>
            <Text>© Copyright <b>AimMagic.com.</b> All Rights Reserved</Text>
            <div className={styles.socialMedias}>
              <a href="https://www.facebook.com/people/AimMagic/61560400936181/"><FacebookOutlined /></a>
              <a href="https://www.instagram.com/aimmagic/"><InstagramOutlined /></a>
              <a href="/"><LinkedinOutlined /></a>
            </div>
          </div>
        </Footer>
      </div>
    </div>
  )
})
