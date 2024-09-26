import React from 'react'
import styles from './WorkWithSection.module.scss';
import inst from '../../../../assets/image/social-media-logos/inst.svg'
import youtube from '../../../../assets/image/social-media-logos/youtube.svg'
import tiktok from '../../../../assets/image/social-media-logos/tiktok.svg'
import vk from '../../../../assets/image/social-media-logos/vk.svg'
import facebook from '../../../../assets/image/social-media-logos/facebook.svg'

export const WorkWithSection = () => {
  return (
    <section className={styles.section}>
      <h3 className={styles.title}>Мы работаем с</h3>
      <div className={styles.socialMedia}>
        <div className={styles.socialMedia__item}><img src={inst} alt='inst' /></div>
        <div className={styles.socialMedia__item}><img src={youtube} alt='youtube' /></div>
        <div className={styles.socialMedia__item}><img src={tiktok} alt='tiktok' /></div>
        <div className={styles.socialMedia__item}><img src={vk} alt='vk' /></div>
        <div className={styles.socialMedia__item}><img src={facebook} alt='facebook' /></div>
      </div>
    </section>
  )
}
