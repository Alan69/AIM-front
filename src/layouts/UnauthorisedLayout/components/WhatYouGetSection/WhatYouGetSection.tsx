import React from 'react';
import styles from './WhatYouGetSection.module.scss';
import icon1 from 'assets/image/what-you-get-section/1.svg';
import icon2 from 'assets/image/what-you-get-section/2.svg';
import icon3 from 'assets/image/what-you-get-section/3.svg';
import icon4 from 'assets/image/what-you-get-section/4.svg';
import icon5 from 'assets/image/what-you-get-section/5.svg';
import icon6 from 'assets/image/what-you-get-section/6.svg';

export const WhatYouGetSection = () => {
  const benefits = [
    { id: 1, title: 'Узнаваемость бренда', description: 'Помогает выделиться среди конкурентов и повысить запоминаемость', icon: icon1 },
    { id: 2, title: 'Увеличение продаж', description: 'Привлечение большего числа клиентов и увеличение конверсий за счет эффективного маркетинга', icon: icon2 },
    { id: 3, title: 'Увеличение лояльности', description: 'Создание долгосрочных отношений с клиентами, обеспечивая высокий уровень удовлетворенности', icon: icon3 },
    { id: 4, title: 'Молекулярный разбор вашего бренда', description: 'Глубокий анализ всех аспектов бренда, включая его ценности и позиционирование', icon: icon4 },
    { id: 5, title: 'Повышение эффективности', description: 'Внедрение инновационных ИИ-решений для анализа данных и автоматизации рутинных задач', icon: icon5 },
    { id: 6, title: 'Прогнозирование и персонализация', description: 'Использование ИИ для предсказания поведения клиентов и предоставления персонализированных предложений', icon: icon6 },
  ];

  return (
    <section className={styles.section} id='WhatYouGetSection'>
      <div className={styles.head}>
        <div className={styles.label}>Лучшие решения</div>
        <h2 className={styles.title}>Что вы получите</h2>
      </div>
      <div className={styles.benefit}>
        {benefits.map((benefit) => (
          <div key={benefit.id} className={styles.benefit__item}>
            <div className={styles.iconWrapper}>
              <img src={benefit.icon} alt={benefit.title} className={styles.icon} />
            </div>
            <h3 className={styles.benefit__item__title}>{benefit.title}</h3>
            <p className={styles.benefit__item__description}>{benefit.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
