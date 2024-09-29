import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import styles from './StartAISection.module.scss';
import { ReactComponent as IconPlus } from 'assets/plus-white.svg';
import { useTypedSelector } from 'hooks/useTypedSelector';

export const StartAISection = () => {
  const navigate = useNavigate();
  const { token } = useTypedSelector((state) => state.auth);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.label}>Мы готовы, а Вы?</div>
        <h2 className={styles.title}>
          Начните работу <br /> с нашей ИИ-платформой <br /> прямо сейчас!
        </h2>
        <div className={styles.subtitle}>
          Автоматизируйте маркетинг, оптимизируйте процессы и увеличьте конверсии  с помощью ИИ
        </div>
        <Button className={styles.button} onClick={() => navigate(token ? '/tariffs' : '/login')}>
          Начать бесплатно<IconPlus className={styles.icon} />
        </Button>
      </div>
    </section>
  );
};
