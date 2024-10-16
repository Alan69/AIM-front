import React from 'react';
import { Menu as AntMenu } from 'antd';
import styles from './Menu.module.scss';
import { Link, useLocation } from 'react-router-dom';

const Menu = () => {
  const location = useLocation();

  return (
    <AntMenu mode="horizontal" className={styles.menu}>
      <AntMenu.Item key="examples" className={styles.item}>
        {location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/agreement' || location.pathname === '/policy' ?
          <Link to='/home'>Примеры</Link>
          : <a href="#OurWorksSection">Примеры</a>
        }
      </AntMenu.Item>
      <AntMenu.Item key="how-it-works" className={styles.item}>
        {location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/agreement' || location.pathname === '/policy' ?
          <Link to='/home'>Как это работает</Link>
          : <a href="#HowItWorkSection">Как это работает</a>
        }
      </AntMenu.Item>
      <AntMenu.Item key="benefits" className={styles.item}>
        {location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/agreement' || location.pathname === '/policy' ?
          <Link to='/home'>Преимущества</Link>
          : <a href="#AdvantagesSection">Преимущества</a>
        }
      </AntMenu.Item>
      <AntMenu.Item key="what-you-get" className={styles.item}>
        {location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/agreement' || location.pathname === '/policy' ?
          <Link to='/home'>Что вы получите</Link>
          : <a href="#WhatYouGetSection">Что вы получите</a>
        }
      </AntMenu.Item>
      {/* <AntMenu.Item key="reviews">
        <a href="#reviews">Отзывы</a>
      </AntMenu.Item> */}
      <AntMenu.Item key="faq">
        {location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/agreement' || location.pathname === '/policy' ?
          <Link to='/home'>FAQ</Link>
          : <a href="#FAQSection">FAQ</a>
        }
      </AntMenu.Item>
    </AntMenu>
  );
};

export default Menu;
