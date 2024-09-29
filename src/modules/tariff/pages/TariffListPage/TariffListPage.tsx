import React, { useState } from 'react';
import { Card, Typography, Button, Layout, Divider, Slider, Flex } from 'antd';
import styles from './TariffListPage.module.scss';
import { Content } from 'antd/es/layout/layout';
import { useTypedSelector } from 'hooks/useTypedSelector';
import { useCreateTariffMutation, usePaymentInitiateMutation, usePaymentTokenMutation } from 'modules/tariff/redux/api';

import iconPlus from 'assets/plus-white.svg'
import infinity from 'assets/infinity.svg'
import checked from 'assets/checked.svg'
import arrow from 'assets/arrow.svg'
import card from 'assets/tariff-card-bg.png';

const { Title, Text } = Typography;

export const TariffListPage: React.FC = () => {
  const { user } = useTypedSelector((state) => state.auth);

  const [companyCount, setCompanyCount] = useState<number>(1);
  const [monthDuration, setMonthDuration] = useState<number>(1);
  const [discount, setDiscount] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(4900);

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
    })
  }

  const calculateCost = (companies: number, months: number) => {
    const baseCost = 4900;
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

  // const items: TabsProps['items'] = [
  //   {
  //     key: '1',
  //     label: 'Месяц',
  //     children: <Row gutter={[16, 16]} justify="center">
  //       {data?.slice(0, 4).map((el) => (
  //         <Col key={el.id} xs={24} sm={12} md={6} className={styles.col}>
  //           <Card hoverable className={styles.card}>
  //             <Title level={3} className={styles.card__title}>{el.name}</Title>
  //             <div className={styles.card__body}>
  //               <div className={styles.card__item}>
  //                 <div className={styles.card__item__label}>Генерации постов</div>
  //                 <div className={styles.card__item__value}>{el.post_generations_limit ? el.post_generations_limit : '*'}</div>
  //               </div>
  //               <div className={styles.card__item}>
  //                 <div className={styles.card__item__label}>Генерация маркетинговой стратегии</div>
  //                 <div className={styles.card__item__value}>1</div>
  //               </div>
  //               <div className={styles.card__item}>
  //                 <div className={styles.card__item__label}>Генерация воронки продаж</div>
  //                 <div className={styles.card__item__value}>1</div>
  //               </div>
  //               <div className={styles.card__item}>
  //                 <div className={styles.card__item__label}>Компании</div>
  //                 <div className={styles.card__item__value}>{el.company_limit}</div>
  //               </div>
  //               <div className={styles.card__item}>
  //                 <div className={styles.card__item__label}>Продукты</div>
  //                 <div className={styles.card__item__value}>1</div>
  //               </div>
  //               <div className={styles.card__item}>
  //                 <div className={styles.card__item__label}>Аккаунты на каждую социальную сеть</div>
  //                 <div className={styles.card__item__value}>До {el.social_media_account_limit}</div>
  //               </div>
  //             </div>
  //             <Title level={4} className={styles.card__price}>{el.monthly_price ? `${el.monthly_price} ₸` : 'Бесплатно'}</Title>
  //             <Button block className={styles.card__button} icon={iconPlus}>Подключить</Button>
  //           </Card>
  //         </Col>
  //       ))}
  //     </Row>,
  //   },
  //   {
  //     key: '2',
  //     label: 'Год',
  //     children: <Row gutter={[16, 16]} justify="center">
  //       {data?.slice(0, 4).map((el) => (
  //         <Col key={el.id} xs={24} sm={12} md={6} className={styles.col}>
  //           <Card hoverable className={styles.card}>
  //             <Title level={3} className={styles.card__title}>{el.name}</Title>
  //             <div className={styles.card__body}>
  //               <div className={styles.card__item}>
  //                 <div className={styles.card__item__label}>Генерации постов</div>
  //                 <div className={styles.card__item__value}>{el.post_generations_limit ? el.post_generations_limit : '*'}</div>
  //               </div>
  //               <div className={styles.card__item}>
  //                 <div className={styles.card__item__label}>Генерация маркетинговой стратегии</div>
  //                 <div className={styles.card__item__value}>1</div>
  //               </div>
  //               <div className={styles.card__item}>
  //                 <div className={styles.card__item__label}>Генерация воронки продаж</div>
  //                 <div className={styles.card__item__value}>1</div>
  //               </div>
  //               <div className={styles.card__item}>
  //                 <div className={styles.card__item__label}>Компании</div>
  //                 <div className={styles.card__item__value}>{el.company_limit}</div>
  //               </div>
  //               <div className={styles.card__item}>
  //                 <div className={styles.card__item__label}>Продукты</div>
  //                 <div className={styles.card__item__value}>1</div>
  //               </div>
  //               <div className={styles.card__item}>
  //                 <div className={styles.card__item__label}>Аккаунты на каждую социальную сеть</div>
  //                 <div className={styles.card__item__value}>До {el.social_media_account_limit}</div>
  //               </div>
  //             </div>
  //             <Title level={4} className={styles.card__price}>{el.yearly_price ? `${el.yearly_price} ₸` : 'Бесплатно'}</Title>
  //             <Button block className={styles.card__button} icon={iconPlus}>Подключить</Button>
  //           </Card>
  //         </Col>
  //       ))}
  //     </Row>,
  //   },
  // ];

  return (
    <Layout>
      <Content style={{ padding: '24px', minHeight: 'calc(100vh - 70px)' }}>
        <Layout>
          <Content>
            <div className={styles.offerPage}>
              <Layout className={styles.accountInfo}>
                <Content>
                  <Title level={2}>Ваш тариф "Free" заканчивается через {user?.profile.user.tariff.days} дней.</Title>
                </Content>
              </Layout>

              <section className={styles.section}>
                <h3 className={styles.title}>Подбери свой тариф</h3>
                <div>
                  <Flex gap={60} justify="space-between">
                    <div className={styles.col}>
                      <div className={styles.slidersBlock}>
                        <div className={styles.sliderBlock}>
                          <h4 className={styles.subtitle}>Количество компаний</h4>
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
                          <h4 className={styles.subtitle}>Длительность, месяцев</h4>
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
                          <Button className={styles.card__button} onClick={handleBuyTariff}>Подключить <img src={iconPlus} alt='iconPlus' /></Button>
                        </div>
                      </Card>
                    </div>
                  </Flex>
                </div>
              </section>
            </div>
          </Content>
        </Layout>
      </Content>
    </Layout>
  );
};
