import React, { useState } from 'react';
import cn from 'classnames';
import { Collapse } from 'antd';
import styles from './FAQSection.module.scss';
import { ReactComponent as IconArrow } from 'assets/arrow-grey.svg';

const { Panel } = Collapse;

export const FAQSection: React.FC = () => {
  const [activeKey, setActiveKey] = useState<string | string[]>([]);

  const handlePanelChange = (key: string | string[]) => {
    setActiveKey(key);
  };

  const faqData = [
    {
      question: 'Что такое ИИ?',
      answer: 'ИИ — это искусственный интеллект, который помогает автоматизировать процессы и улучшать маркетинговые результаты.'
    },
    {
      question: 'Что такое ваша ИИ-платформа?',
      answer: 'Она помогает в автоматизации рутинных задач, таких как сегментация аудитории, персонализация контента, управление рекламными кампаниями и анализ данных.'
    },
    {
      question: 'Как ИИ оптимизирует маркетинг?',
      answer: 'ИИ анализирует данные и помогает создавать более точные и эффективные маркетинговые кампании.'
    },
    {
      question: 'Подходит ли ваша платформа для малого бизнеса?',
      answer: 'Да, наша платформа подходит для компаний любого размера, включая малый бизнес.'
    },
    {
      question: 'Как интегрировать платформу с нашими текущими маркетинговыми инструментами?',
      answer: 'Наша платформа поддерживает интеграции с большинством популярных маркетинговых инструментов.'
    },
    {
      question: 'Какую поддержку вы предлагаете?',
      answer: 'Мы предоставляем круглосуточную поддержку и подробную документацию для всех наших пользователей.'
    },
    {
      question: 'Можно ли протестировать платформу перед покупкой?',
      answer: 'Да, вы можете воспользоваться демо-версией, чтобы оценить все возможности нашей платформы.'
    }
  ];

  console.log('activeKey', activeKey);


  return (
    <section className={styles.section} id='FAQSection'>
      <h2 className={styles.title}>FAQ</h2>
      <Collapse
        accordion
        className={styles.accordion}
        expandIcon={() => null}
        activeKey={activeKey}
        onChange={handlePanelChange}
      >
        {faqData.map((item, index) => (
          <Panel
            key={index}
            className={styles.item}
            header={
              <h4
                className={cn(
                  styles.item__title,
                  activeKey[0] === index.toString() ? styles.item__title__isActive : ''
                )}
              >
                {item.question}
                <IconArrow className={cn(styles.arrowIcon, activeKey[0] === index.toString() ? styles.arrowIcon__isActive : '')} />
              </h4>
            }
          >
            <p className={styles.item__text}>{item.answer}</p>
          </Panel>
        ))}
      </Collapse>


    </section>
  );
};
