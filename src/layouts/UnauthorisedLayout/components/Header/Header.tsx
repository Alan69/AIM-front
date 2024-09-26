import React from 'react';
import { Layout, Button } from 'antd';
import styles from './Header.module.scss';
import Menu from '../Menu/Menu';
import logo from '../../../../assets/logo.svg';
import { DownOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();

  return (
    <AntHeader className={styles.header}>
      <div className={styles.logo}>
        <Link to={'/home'}><img src={logo} alt={logo} /></Link>
      </div>
      <Menu />
      <div className={styles.actions}>
        <Button className={styles.languageButton} iconPosition='end' icon={<DownOutlined />}>РУС</Button>
        <Button className={styles.startButton} type="primary" onClick={() => navigate('/login')}>Начать</Button>
      </div>
    </AntHeader >
  );
};

export default Header;
