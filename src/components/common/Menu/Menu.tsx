import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  UnorderedListOutlined,
  AppstoreAddOutlined,
  CalendarOutlined,
  MenuUnfoldOutlined,
  CaretLeftOutlined
} from '@ant-design/icons';
import { Button, Menu } from 'antd';
import type { MenuProps } from 'antd';
import cn from 'classnames'
import { authActions } from 'modules/auth/redux/slices/auth.slice';
import UserInfo from '../UserInfo/Userinfo';
import OfferInfo from '../OfferInfo/OfferInfo';
import CurrentCompanyInfo from '../CurrentCompanyInfo/CurrentCompanyInfo';
import { ReactComponent as IconLogo } from 'assets/logo.svg';
import styles from './Menu.module.scss';
import { useIsSmallLaptop } from 'hooks/media';

type MenuItem = Required<MenuProps>['items'][number];

type TProps = {
  isOpen: boolean
  handleSwitchMenu: (e?: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

const MenuNav = ({ isOpen, handleSwitchMenu }: TProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isSmallLaptop = useIsSmallLaptop();

  const logOut = () => {
    dispatch(authActions.logOut());
    navigate('/login', { replace: true });
  }

  const items: MenuItem[] = [
    {
      key: '1',
      label: <Link to="/account/profile/edit" onClick={() => handleSwitchMenu()}><UserInfo /></Link>,
    },
    {
      key: '2',
      label: <OfferInfo />,
      // @ts-ignore
      onClick: handleSwitchMenu,
    },
    {
      key: '3',
      label: <div className={styles.logOutBtn} onClick={() => handleSwitchMenu()}><Button type='primary' onClick={logOut}>Выход</Button></div>,
    },
    {
      key: '4',
      label: <CurrentCompanyInfo handleSwitchMenu={handleSwitchMenu} />,
    },
    {
      key: '5',
      icon: <AppstoreAddOutlined />,
      label: <Link to="/post-query/create" onClick={() => handleSwitchMenu()}>Создать пост</Link>,
    },
    {
      key: '6',
      icon: <UnorderedListOutlined />,
      label: <Link to="/post-query" onClick={() => handleSwitchMenu()}>История</Link>,
    },
    {
      key: '7',
      icon: < CalendarOutlined />,
      label: <Link to="/content-plan" onClick={() => handleSwitchMenu()}>Контент план</Link>,
    },
  ];

  return (
    <div className={cn(styles.menuLayout, isOpen ? styles.menuLayout__isOpen : '')}>
      <div className={cn(styles.menuBody, isOpen ? styles.menuBody__isOpen : '')}>
        {isSmallLaptop ? <div className={styles.menuButton} onClick={() => handleSwitchMenu()}>{<CaretLeftOutlined />}</div> : ''}
        <Link className={styles.logo} to={'/home'}><IconLogo /></Link>
        <Menu
          defaultSelectedKeys={['1']}
          defaultOpenKeys={['sub1']}
          mode="inline"
          theme="light"
          items={items}
          style={{ borderColor: 'transparent' }}
        />
      </div>
    </div>
  );
};

export default MenuNav;