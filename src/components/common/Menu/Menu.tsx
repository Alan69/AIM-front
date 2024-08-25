import React from 'react';
import {
  UnorderedListOutlined,
  AppstoreAddOutlined,
  ProductOutlined,
  PlusCircleOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Menu } from 'antd';
import styles from './Menu.module.scss';
import UserInfo from '../UserInfo/Userinfo';
import { Link } from 'react-router-dom';
import { useGetCompanyListQuery } from '../../../modules/company/redux/api';
import OfferInfo from '../OfferInfo/OfferInfo';
import { authActions } from 'modules/auth/redux/slices/auth.slice';
import { useDispatch } from 'react-redux';

type MenuItem = Required<MenuProps>['items'][number];

const MenuNav: React.FC = () => {
  const dispatch = useDispatch();
  const { data } = useGetCompanyListQuery()

  const companyItems = data?.map((company) => ({
    key: `company-${company.id}`,
    label: <Link to={`/company/${company.id}`}>{company.name}</Link>,
  })) || [];

  const logOut = () => {
    dispatch(authActions.logOut());
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
      icon: <AppstoreAddOutlined />,
      label: <Link to="/post-query/create">Создать пост</Link>,
    },
    {
      key: '5',
      icon: <UnorderedListOutlined />,
      label: <Link to="/post-query">История</Link>,
    },
    {
      key: 'sub1',
      label: 'Мои компании',
      icon: <ProductOutlined />,
      children: [
        { key: '6', label: <Link to="/company/create"><PlusCircleOutlined /> Добавить</Link> },
        ...companyItems,
      ],
    },
    {
      key: '6',
      icon: < CalendarOutlined />,
      label: <Link to="/content-plan">Контент план</Link>,
    },
    // {
    //   key: 'sub2',
    //   label: 'Navigation Two',
    //   icon: <AppstoreOutlined />,
    //   children: [
    //     { key: '9', label: <Link to="/option9">Option 9</Link> },
    //     { key: '10', label: <Link to="/option10">Option 10</Link> },
    //     {
    //       key: 'sub3',
    //       label: 'Submenu',
    //       children: [
    //         { key: '11', label: <Link to="/option11">Option 11</Link> },
    //         { key: '12', label: <Link to="/option12">Option 12</Link> },
    //       ],
    //     },
    //   ],
    // },
  ];

  return (
    <div className={styles.menuBody}>
      <div className={styles.logo}>AIM</div>
      {/* <Divider orientation="right" plain></Divider> */}
      <Menu
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1']}
        mode="inline"
        theme="light"
        items={items}
      />
    </div>
  );
};

export default MenuNav;