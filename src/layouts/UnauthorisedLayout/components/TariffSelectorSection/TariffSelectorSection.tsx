import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Slider, Card, Button, Divider, Flex } from 'antd';

import styles from './TariffSelectorSection.module.scss';

import iconPlus from '../../../../assets/plus-white.svg'
import infinity from '../../../../assets/infinity.svg'
import checked from '../../../../assets/checked.svg'
import arrow from '../../../../assets/arrow.svg'
import card from '../../../../assets/tariff-card-bg.png';

export const TariffSelectorSection: React.FC = () => {
  const navigate = useNavigate();

  const [companyCount, setCompanyCount] = useState<number>(1);
  const [monthDuration, setMonthDuration] = useState<number>(1);
  const [discount, setDiscount] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(9900);

  const handleCompanyChange = (value: number) => {
    setCompanyCount(value);
    calculateCost(value, monthDuration);
  };

  const handleDurationChange = (value: number) => {
    setMonthDuration(value);
    calculateCost(companyCount, value);
  };

  const calculateCost = (companies: number, months: number) => {
    const baseCost = 9900;
    let discount = 0;

    if (months >= 4 && months <= 6) {
      discount = 0.5;
    } else if (months >= 7 && months <= 9) {
      discount = 1;
    } else if (months >= 10 && months <= 12) {
      discount = 2;
    }

    const monthCost = (months - discount) * baseCost;

    let companyCost = 0;
    if (companies === 1) {
      companyCost = monthCost;
    } else {
      companyCost = monthCost + (companies - 1) * 0.3 * monthCost;
    }

    const calculatedCost = companyCost;
    const maxCost = months * companies * baseCost;
    const calculatedDiscount = maxCost - calculatedCost;

    setTotalCost(calculatedCost);
    setDiscount(calculatedDiscount);
  };


  return (
    <section className={styles.section}>
      <h3 className={styles.title}>Подбери свой тариф</h3>
      <div>
        <Flex gap={120} justify="center">
          <div className={styles.col}>
            <div className={styles.slidersBlock}>
              <div className={styles.sliderBlock}>
                <h4 className={styles.subtitle}>Количество компаний</h4>
                <Slider
                  className='customSlider'
                  min={1}
                  max={12}
                  value={companyCount}
                  onChange={handleCompanyChange}
                  tooltip={{ visible: false }}
                  marks={{ 1: '1', 2: '2', 3: '3', 4: '5', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10', 11: '11', 12: '12' }}
                />
                {/* <div>{companyCount}</div> */}
              </div>
              <div className={styles.sliderBlock}>
                <h4 className={styles.subtitle}>Длительность, месяцев</h4>
                <Slider
                  className='customSlider'
                  min={1}
                  max={12}
                  value={monthDuration}
                  onChange={handleDurationChange}
                  tooltip={{ visible: false }}
                  marks={{ 1: '1', 2: '2', 3: '3', 4: '5', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10', 11: '11', 12: '12' }}
                />
                {/* <div>{monthDuration}</div> */}
              </div>
            </div>
            <Divider />
            <div className={styles.discountSection}>
              <div className={styles.discountSection__label}>Ваша скидка: </div>
              <div className={styles.discountSection__value}>{discount} ₸</div>
            </div>
          </div>
          <div className={styles.col}>
            <Card hoverable className={styles.card} style={{ background: `url('${card}')` }}>
              <div className={styles.card__head}>
                <div className={styles.card__title}>Твой уникальный тариф</div>
                <div className={styles.card__body}>
                  <div className={styles.card__item}>
                    <div className={styles.card__item__label}>Генерация маркетинговой стратегии</div>
                    <div className={styles.card__item__value}><img src={checked} alt='checked' /></div>
                  </div>
                  <div className={styles.card__item}>
                    <div className={styles.card__item__label}>Генерация воронки продаж</div>
                    <div className={styles.card__item__value}><img src={checked} alt='checked' /></div>
                  </div>
                  <div className={styles.card__item}>
                    <div className={styles.card__item__label}>Генерации постов</div>
                    <div className={styles.card__item__value}><img src={infinity} alt='infinity' /></div>
                  </div>
                  <div className={styles.card__item}>
                    <div className={styles.card__item__label}>Количество продуктов</div>
                    <div className={styles.card__item__value}><img src={infinity} alt='infinity' /></div>
                  </div>
                </div>
              </div>
              <div className={styles.card__bottom}>
                <div className={styles.card__price}>
                  <div className={styles.card__price__label}>Стоимость:</div>
                  <img src={arrow} alt='arrow' />
                  <div className={styles.card__price__value}>{totalCost} ₸</div>
                </div>
                <Button className={styles.card__button} onClick={() => navigate('/login')}>Подключить <img src={iconPlus} alt='iconPlus' /></Button>
              </div>
            </Card>
          </div>
        </Flex>
      </div>
    </section>
  );
};
