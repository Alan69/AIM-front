import React from 'react';
import { Menu as AntMenu } from 'antd';
import styles from './Menu.module.scss';

const Menu = () => {
  return (
    <AntMenu mode="horizontal" className={styles.menu}>
      <AntMenu.Item key="examples">
        <a href="#examples">Примеры</a>
      </AntMenu.Item>
      <AntMenu.Item key="how-it-works">
        <a href="#how-it-works">Как это работает</a>
      </AntMenu.Item>
      <AntMenu.Item key="benefits">
        <a href="#benefits">Преимущества</a>
      </AntMenu.Item>
      <AntMenu.Item key="what-you-get">
        <a href="#what-you-get">Что вы получите</a>
      </AntMenu.Item>
      <AntMenu.Item key="reviews">
        <a href="#reviews">Отзывы</a>
      </AntMenu.Item>
      <AntMenu.Item key="faq">
        <a href="#faq">FAQ</a>
      </AntMenu.Item>
    </AntMenu>
  );
};

export default Menu;
