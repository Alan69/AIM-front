import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  UnorderedListOutlined,
  AppstoreAddOutlined,
  AppstoreOutlined,
  BorderOuterOutlined,
  CalendarOutlined,
  FormOutlined,
  SettingOutlined,
  MenuUnfoldOutlined,
  FileDoneOutlined,
  CaretLeftOutlined,
  StockOutlined,
  WechatOutlined,
  FundOutlined,
  RadarChartOutlined
} from '@ant-design/icons';
import { Badge, Button, Menu } from 'antd';
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
    // {
    //   key: '5',
    //   icon: <AppstoreAddOutlined />,
    //   label: <Link to="/post-query/create">Создать пост</Link>,
    // },

    {
      key: '5',
      icon: <BorderOuterOutlined />, // Change to a different icon
      label: <Link to="#">Идеи</Link>,
    },
    {
      key: '6',
      icon: <FormOutlined />, // Change to another icon
      label: <Link to="/post-query">Посты</Link>,
    },
    {
      key: '7',
      icon: <FileDoneOutlined /> , // Keep the original or change as needed
      label: <Link to="#">Сценарий</Link>,
    },

    {
      key: '8',
      icon: <CalendarOutlined />,
      label: <Link to="/content-plan">Контент план</Link>,
    },
    {
      key: '9',
      icon: <StockOutlined />,
      label: <div className={styles.soon}>Маркетинговая стратегия <Badge count={'скоро'} /></div>,
      disabled: true
    },
    {
      key: '10',
      icon: <FundOutlined />,
      label: <div className={styles.soon}>Воронка продаж <Badge count={'скоро'} /></div>,
      disabled: true
    },
    {
      key: '11',
      icon: <WechatOutlined />,
      label: <div className={styles.soon}>Единый чат-хаб <Badge count={'скоро'} /></div>,
      disabled: true
    },
    {
      key: '12',
      icon: <RadarChartOutlined />,
      label: <div className={styles.soon}>Аналитика <Badge count={'скоро'} /></div>,
      disabled: true
    },
  ];

  return (
    <div className={cn(styles.menuLayout, isOpen ? styles.menuLayout__isOpen : '')} onClick={handleSwitchMenu}>
      <div className={cn(styles.menuBody, isOpen ? styles.menuBody__isOpen : '')} onClick={(e) => e.stopPropagation()}>
        {isSmallLaptop ? <div className={styles.menuButton} onClick={handleSwitchMenu}>{<CaretLeftOutlined />}</div> : ''}
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