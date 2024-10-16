import React, { useState } from 'react';
import { Card, Typography, Button, Layout, Divider, Slider, message } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { useTypedSelector } from 'hooks/useTypedSelector';
import { useCreateTariffMutation, usePaymentInitiateMutation, usePaymentTokenMutation } from 'modules/tariff/redux/api';

import infinity from 'assets/infinity.svg'
import checked from 'assets/checked.svg'
import { ReactComponent as IconPlus } from 'assets/plus-white.svg';
import { ReactComponent as IconArrow } from 'assets/arrow.svg';
import styles from './TariffListPage.module.scss';

const { Title } = Typography;

export const TariffListPage: React.FC = () => {
  const { user } = useTypedSelector((state) => state.auth);

  const [companyCount, setCompanyCount] = useState<number>(1);
  const [monthDuration, setMonthDuration] = useState<number>(1);
  const [discount, setDiscount] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(29900);
  const [totalCostWithoutDiscount, setTotalCostWithoutDiscount] = useState<number>(29900);

  const [createTariff] = useCreateTariffMutation();
  const [paymentToken] = usePaymentTokenMutation();
  const [paymentInitiate] = usePaymentInitiateMutation();

  const handleCompanyChange = (value: number) => {
    setCompanyCount(value);
    calculateCost(value, monthDuration);
  };

  const handleDurationChange = (value: number) => {
    setMonthDuration(value);
    calculateCost(companyCount, value);
  };

  const handleBuyTariff = () => {
    createTariff({ company_limit: companyCount, month: monthDuration }).unwrap().then(() => {
      paymentToken().unwrap().then((res) => {
        paymentInitiate({ token: res.access_token }).unwrap().then((resInitiate) => {
          window.open(resInitiate.invoice_url, '_self');
        })
      })
    }).catch((error) => {
      message.error(error.data.error)
    })
  }

  const calculateCost = (companies: number, months: number) => {
    const baseCost = 29900;
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
    setTotalCostWithoutDiscount(maxCost);
    setDiscount(calculatedDiscount);
  };

  return (
    <Layout>
      <Content className='page-layout'>
        <Layout>
          <Content>
            <div className={styles.offerPage}>
              <Layout className={styles.accountInfo}>
                <Content>
                  <Title level={2}>Ваш тариф заканчивается через {user?.profile.user.tariff.days} дней.</Title>
                </Content>
              </Layout>

              <section className={styles.section}>
                <h3 className={styles.title}>Подбери свой тариф</h3>
                <div className={styles.subtitle}>Акция: купи годовой тариф и получи 2 месяца в подарок</div>
                <div className={styles.row}>
                  <div className={styles.col}>
                    <div className={styles.slidersBlock}>
                      <div className={styles.sliderBlock}>
                        <h4 className={styles.sliderSubtitle}>Количество компаний</h4>
                        <Slider
                          className={'customSlider tariff-page-slider'}
                          min={1}
                          max={12}
                          value={companyCount}
                          onChange={handleCompanyChange}
                          tooltip={{ visible: false }}
                          marks={{ 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10', 11: '11', 12: '12' }}
                        />
                        {/* <div>{companyCount}</div> */}
                      </div>
                      <div className={styles.sliderBlock}>
                        <h4 className={styles.sliderSubtitle}>Длительность, месяцев</h4>
                        <Slider
                          className={'customSlider tariff-page-slider'}
                          min={1}
                          max={12}
                          value={monthDuration}
                          onChange={handleDurationChange}
                          tooltip={{ visible: false }}
                          marks={{ 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10', 11: '11', 12: '12' }}
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
                    <Card hoverable className={styles.card}>
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
                          <IconArrow />
                          <div className={styles.card__price__value}>
                            {discount > 0 ? <span>{totalCostWithoutDiscount.toFixed()} ₸</span> : ''}
                            {totalCost.toFixed()} ₸
                          </div>
                        </div>
                        <Button className={styles.card__button} onClick={handleBuyTariff}>Подключить <IconPlus className={styles.iconPlus} /></Button>
                      </div>
                    </Card>
                  </div>
                </div>
              </section>
            </div>
          </Content>
        </Layout>
      </Content>
    </Layout>
  );
};
