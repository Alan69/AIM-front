import React, { memo, Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Spin, Typography } from 'antd'
import {
  FacebookOutlined,
  InstagramOutlined,
  LinkedinOutlined
} from '@ant-design/icons';
import cn from 'classnames'
import { Footer } from 'antd/es/layout/layout'
import { Footer as FooterLanding } from 'layouts/UnauthorisedLayout/components/Footer/Footer';
import MenuNav from '../../components/common/Menu/Menu';
import Header from '../UnauthorisedLayout/components/Header/Header';
import styles from './MainLayout.module.scss';

const { Text } = Typography;

export const MainLayout = memo(function MainLayout() {
  const location = useLocation();

  return (
    <div className={cn(location.pathname === '/home' || location.pathname === '/agreement' || location.pathname === '/policy' ? '' : styles.layout)}>
      {location.pathname === '/home' || location.pathname === '/agreement' || location.pathname === '/policy' ? <Header /> : <MenuNav />}
      <div className={cn(location.pathname === '/home' || location.pathname === '/agreement' || location.pathname === '/policy' ? styles.main : styles.body)}>
        <Suspense fallback={<Spin size="small" />}>
          <Outlet />
        </Suspense>
        {location.pathname === '/home' || location.pathname === '/agreement' || location.pathname === '/policy' ? <FooterLanding /> :
          <Footer>
            <div className={styles.footerContainer}>
              <Text>© Copyright <b>AimMagic.com.</b> All Rights Reserved</Text>
              <div className={styles.socialMedias}>
                <a href="https://www.facebook.com/people/AimMagic/61560400936181/"><FacebookOutlined /></a>
                <a href="https://www.instagram.com/aimmagic/"><InstagramOutlined /></a>
                <a href="/"><LinkedinOutlined /></a>
              </div>
            </div>
          </Footer>}
      </div>
    </div>
  )
})
