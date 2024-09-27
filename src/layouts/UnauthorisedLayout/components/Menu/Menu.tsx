import React from 'react';
import { Menu as AntMenu } from 'antd';
import styles from './Menu.module.scss';

const Menu = () => {
  return (
    <AntMenu mode="horizontal" className={styles.menu}>
      <AntMenu.Item key="examples" className={styles.item}>
        <a href="#OurWorksSection">Примеры</a>
      </AntMenu.Item>
      <AntMenu.Item key="how-it-works" className={styles.item}>
        <a href="#HowItWorkSection">Как это работает</a>
      </AntMenu.Item>
      <AntMenu.Item key="benefits" className={styles.item}>
        <a href="#AdvantagesSection">Преимущества</a>
      </AntMenu.Item>
      <AntMenu.Item key="what-you-get" className={styles.item}>
        <a href="#WhatYouGetSection">Что вы получите</a>
      </AntMenu.Item>
      {/* <AntMenu.Item key="reviews">
        <a href="#reviews">Отзывы</a>
      </AntMenu.Item> */}
      <AntMenu.Item key="faq">
        <a href="#FAQSection">FAQ</a>
      </AntMenu.Item>
    </AntMenu>
  );
};

export default Menu;
