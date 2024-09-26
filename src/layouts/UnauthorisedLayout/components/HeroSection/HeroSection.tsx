import React from 'react'
import styles from './HeroSection.module.scss';
import { Button } from 'antd';

export const HeroSection = () => {
  const features = [
    'Маркетинговая стратегия',
    'Воронка продаж',
    'Создание постов',
    'Автопостинг',
    'Аналитика',
    'Единый чат-хаб',
  ];

  const icon = <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.4286 0H8.57143V5.71429H11.4286V0Z" fill="white" />
    <path d="M11.4286 14.2857H8.57143V20H11.4286V14.2857Z" fill="white" />
    <path d="M5.71429 11.4286V8.57143H0V11.4286H5.71429Z" fill="white" />
    <path d="M20 11.4286V8.57143H14.2857V11.4286H20Z" fill="white" />
    <path d="M11.4286 8.57143V11.4286H8.57143V8.57143H11.4286Z" fill="white" />
  </svg>

  const checkedIcon = <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.5 10L13.5 20L10 16.5" stroke="#005FAA" stroke-width="2" />
    <path d="M7 13.5L8.5 15" stroke="#005FAA" stroke-width="2" />
  </svg>

  return (
    <section className={styles.section}>
      <h1 className={styles.title}>С нами бизнес <br /> процветает</h1>
      <h3 className={styles.subtitle}>Инновационная ИИ-платформа для <br /> автоматизации и оптимизации маркетинга</h3>
      <div className={styles.actions}>
        <Button className={styles.tariffBtn}>Тарифы</Button>
        <Button className={styles.startBtn} icon={icon} iconPosition='end'>Начать бесплатно</Button>
      </div>
      <div className={styles.feature}>
        {features.map((feature, index) => (
          <div key={index} className={styles.feature__item}>
            {checkedIcon}
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
