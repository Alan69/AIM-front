import React from 'react';
import { Layout, Button } from 'antd';
import styles from './Header.module.scss';
import Menu from '../Menu/Menu';
import { DownOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { ReactComponent as IconLogo } from 'assets/logo.svg';

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();

  return (
    <AntHeader className={styles.header}>
      <Link className={styles.logo} to={'/home'}><IconLogo /></Link>
      <Menu />
      <div className={styles.actions}>
        <Button className={styles.languageButton} iconPosition='end' icon={<DownOutlined />}>РУС</Button>
        <Button className={styles.startButton} type="primary" onClick={() => navigate('/login')}>Начать</Button>
      </div>
    </AntHeader >
  );
};

export default Header;
