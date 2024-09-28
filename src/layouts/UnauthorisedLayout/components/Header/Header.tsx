import React from 'react';
import { Layout, Button } from 'antd';
import styles from './Header.module.scss';
import Menu from '../Menu/Menu';
import logo from 'assets/logo.svg';
import { DownOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AntHeader className={styles.header}>
      <Link className={styles.logo} to={'/home'}><img src={logo} alt={logo} /></Link>
      {location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/recovery' || location.pathname === '/policy' || location.pathname === '/agreement' ? '' : <Menu />}
      <div className={styles.actions}>
        <Button className={styles.languageButton} iconPosition='end' icon={<DownOutlined />}>РУС</Button>
        <Button className={styles.startButton} type="primary" onClick={() => navigate('/login')}>Начать</Button>
      </div>
    </AntHeader >
  );
};

export default Header;
