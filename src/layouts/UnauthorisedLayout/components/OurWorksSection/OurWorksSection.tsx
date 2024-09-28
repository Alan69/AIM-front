import React from 'react'
import styles from './OurWorksSection.module.scss';
import works1 from 'assets/image/works/1.svg'
import works2 from 'assets/image/works/2.svg'
import works3 from 'assets/image/works/3.svg'
import works4 from 'assets/image/works/4.svg'
import works5 from 'assets/image/works/5.svg'
import works6 from 'assets/image/works/6.svg'
import works7 from 'assets/image/works/7.svg'
import works8 from 'assets/image/works/8.svg'
import works9 from 'assets/image/works/9.svg'
import works10 from 'assets/image/works/10.svg'
import works11 from 'assets/image/works/11.svg'
import works12 from 'assets/image/works/12.svg'
import hand from 'assets/image/works/hand.svg'

export const OurWorksSection = () => {
  return (
    <section className={styles.section} id='OurWorksSection'>
      <h3 className={styles.title}>Работы, созданные нашим ИИ</h3>
      <div className={styles.works}>
        <div className={styles.works__block}>
          <div className={styles.works__item}><img src={works1} alt='works1' /></div>
          <div className={styles.works__item}><img src={works2} alt='works2' /></div>
          <div className={styles.works__item}><img src={works3} alt='works3' /></div>
          <div className={styles.works__item}><img src={works4} alt='works4' /></div>
          <div className={styles.works__item}><img src={works5} alt='works5' /></div>
          <div className={styles.works__item}><img src={works6} alt='works6' /></div>
        </div>
        <div className={styles.works__block__hand}>
          <div className={styles.works__hand}><img src={hand} alt='hand' /></div>
        </div>
        <div className={styles.works__block}>
          <div className={styles.works__item}><img src={works7} alt='works7' /></div>
          <div className={styles.works__item}><img src={works8} alt='works8' /></div>
          <div className={styles.works__item}><img src={works9} alt='works9' /></div>
          <div className={styles.works__item}><img src={works10} alt='works10' /></div>
          <div className={styles.works__item}><img src={works11} alt='works11' /></div>
          <div className={styles.works__item}><img src={works12} alt='works12' /></div>
        </div>
      </div>
    </section>
  )
}
