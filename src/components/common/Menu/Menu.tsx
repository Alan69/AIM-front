import React from 'react';
import {
  UnorderedListOutlined,
  AppstoreAddOutlined,
  ProductOutlined,
  PlusCircleOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import styles from './Menu.module.scss';
import UserInfo from '../UserInfo/Userinfo';
import { Link } from 'react-router-dom';
import { useGetCompanyListQuery } from '../../../modules/company/redux/api';
import OfferInfo from '../OfferInfo/OfferInfo';

type MenuItem = Required<MenuProps>['items'][number];

const MenuNav: React.FC = () => {
  const { data } = useGetCompanyListQuery()

  const companyItems = data?.map((company) => ({
    key: `company-${company.id}`,
    label: <Link to={`/company/${company.id}`}>{company.name}</Link>,
  })) || [];

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
      icon: <AppstoreAddOutlined />,
      label: <Link to="/post/create">Создать пост</Link>,
    },
    {
      key: '4',
      icon: <UnorderedListOutlined />,
      label: <Link to="/post">История</Link>,
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