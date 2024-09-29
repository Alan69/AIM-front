import React from 'react';
import {
  UnorderedListOutlined,
  AppstoreAddOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Menu } from 'antd';
import styles from './Menu.module.scss';
import UserInfo from '../UserInfo/Userinfo';
import { Link, useNavigate } from 'react-router-dom';
import OfferInfo from '../OfferInfo/OfferInfo';
import { authActions } from 'modules/auth/redux/slices/auth.slice';
import { useDispatch } from 'react-redux';
import CurrentCompanyInfo from '../CurrentCompanyInfo/CurrentCompanyInfo';
import { ReactComponent as IconLogo } from 'assets/logo.svg';
import { useIsXlTablet } from 'hooks/media';

type MenuItem = Required<MenuProps>['items'][number];

const MenuNav: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isXlTablet = useIsXlTablet();

  const logOut = () => {
    dispatch(authActions.logOut());
    navigate('/login', { replace: true });
  }

  const items: MenuItem[] = [
    {
      key: '1',
      label: <Link to="/account/profile/edit"><UserInfo /></Link>,
    },
    {
      key: '2',
      label: <OfferInfo />,
    },
    {
      key: '3',
      label: <div className={styles.logOutBtn}><Button type='primary' onClick={logOut}>Выход</Button></div>,
    },
    {
      key: '4',
      label: <CurrentCompanyInfo />,
    },
    {
      key: '5',
      icon: <AppstoreAddOutlined />,
      label: <Link to="/post-query/create">Создать пост</Link>,
    },
    {
      key: '6',
      icon: <UnorderedListOutlined />,
      label: <Link to="/post-query">История</Link>,
    },
    {
      key: '7',
      icon: < CalendarOutlined />,
      label: <Link to="/content-plan">Контент план</Link>,
    },
  ];

  return (
    <div className={styles.menuBody}>
      <Link className={styles.logo} to={'/home'}><IconLogo /></Link>
      <Menu
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1']}
        mode="inline"
        theme="light"
        items={items}
      // inlineCollapsed={isXlTablet ? true : false}
      />
    </div>
  );
};

export default MenuNav;