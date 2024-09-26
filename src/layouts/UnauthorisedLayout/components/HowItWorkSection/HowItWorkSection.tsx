import React from 'react'
import styles from './HowItWorkSection.module.scss';
import coins from '../../../../assets/image/card-bg.png';

export const HowItWorkSection = () => {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Как это работает</h2>
      <div className={styles.card}>
        <div className={styles.card__item}>
          <div className={styles.card__item__title}>01</div>
          <div className={styles.card__item__whiteBlock}>
            <div className={styles.card__item__whiteBlock__title}>
              Подписывайся
            </div>
            <div className={styles.card__item__whiteBlock__desct}>
              Получайте актуальные данные и аналитические отчеты, адаптированные под ваши маркетинговые цели.
            </div>
          </div>
        </div>
        <div className={styles.card__item}>
          <div className={styles.card__item__title}>02</div>
          <div className={styles.card__item__whiteBlock}>
            <div className={styles.card__item__whiteBlock__title}>
              Создавай
            </div>
            <div className={styles.card__item__whiteBlock__desct}>
              Генерируйте креативный контент и кампании с использованием интеллектуальных инструментов платформы.
            </div>
          </div>
        </div>
        <div className={styles.card__item} style={{ background: `url('${coins}')` }}>
          <div className={styles.card__item__title}>03</div>
          <div className={styles.card__item__whiteBlock}>
            <div className={styles.card__item__whiteBlock__title}>
              Планируй и Публикуй
            </div>
            <div className={styles.card__item__whiteBlock__desct}>
              Управляйте контентом и запускайте кампании по заранее установленному графику для максимальной эффективности.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
