import React from 'react'
import styles from './HowItWorkSection.module.scss';
import card from 'assets/image/how-it-works-section/card-bg.png';
import icon1 from 'assets/image/how-it-works-section/1.svg';
import icon2 from 'assets/image/how-it-works-section/2.svg';

export const HowItWorkSection = () => {
  return (
    <section className={styles.section} id='HowItWorkSection'>
      <h2 className={styles.title}>Как это работает</h2>
      <div className={styles.card}>
        <div className={styles.card__item}>
          <div className={styles.card__item__title}>01</div>
          <div className={styles.card__item__bottom}>
            <img className={styles.icon} src={icon1} alt="icon1" />
            <div className={styles.card__item__whiteBlock}>
              <div className={styles.card__item__whiteBlock__title}>
                Подписывайся
              </div>
              <div className={styles.card__item__whiteBlock__descr}>
                Получайте актуальные данные и аналитические отчеты, адаптированные под ваши маркетинговые цели.
              </div>
            </div>
          </div>
        </div>
        <div className={styles.card__item}>
          <div className={styles.card__item__title}>02</div>
          <div className={styles.card__item__bottom}>
            <img className={styles.icon} src={icon2} alt="icon2" />
            <div className={styles.card__item__whiteBlock}>
              <div className={styles.card__item__whiteBlock__title}>
                Создавай
              </div>
              <div className={styles.card__item__whiteBlock__descr}>
                Генерируйте креативный контент и кампании с использованием интеллектуальных инструментов платформы.
              </div>
            </div>
          </div>
        </div>
        <div className={styles.card__item} style={{ background: `url('${card}')` }}>
          <div className={styles.card__item__title}>03</div>
          <div className={styles.card__item__bottom}>
            <img className={styles.icon} src={icon1} alt="icon1" />

            <div className={styles.card__item__whiteBlock}>
              <div className={styles.card__item__whiteBlock__title}>
                Планируй и Публикуй
              </div>
              <div className={styles.card__item__whiteBlock__descr}>
                Управляйте контентом и запускайте кампании по заранее установленному графику для максимальной эффективности.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
