import React, { useState } from 'react';
import cn from 'classnames';
import { Card, Typography, Button, Layout, Divider, Slider, Flex } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import styles from './TariffListPage.module.scss';
import { Content } from 'antd/es/layout/layout';
import { useTypedSelector } from 'hooks/useTypedSelector';
import { useCreateTariffMutation, usePaymentInitiateMutation, usePaymentTokenMutation } from 'modules/tariff/redux/api';

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

  const getDurationLabel = () => {
    return `Длительность, месяцев ${monthDuration}`;
  };

  const iconPlus = (
    <svg className={styles.iconPlus} width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M6.83325 4.0001C7.12021 4.0001 7.37497 4.18372 7.46571 4.45595L8.44363 7.38972L11.3774 8.36764C11.6496 8.45838 11.8333 8.71314 11.8333 9.0001C11.8333 9.28705 11.6496 9.54181 11.3774 9.63255L8.44363 10.6105L7.46571 13.5442C7.37497 13.8165 7.12021 14.0001 6.83325 14.0001C6.5463 14.0001 6.29154 13.8165 6.2008 13.5442L5.22287 10.6105L2.2891 9.63255C2.01687 9.54181 1.83325 9.28705 1.83325 9.0001C1.83325 8.71314 2.01687 8.45838 2.2891 8.36764L5.22287 7.38972L6.2008 4.45595C6.29154 4.18372 6.5463 4.0001 6.83325 4.0001ZM6.83325 6.77495L6.38237 8.12758C6.31602 8.32665 6.15981 8.48286 5.96074 8.54922L4.6081 9.0001L5.96074 9.45098C6.15981 9.51733 6.31602 9.67354 6.38237 9.87261L6.83325 11.2252L7.28413 9.87261C7.35049 9.67354 7.5067 9.51733 7.70577 9.45098L9.0584 9.0001L7.70577 8.54922C7.5067 8.48286 7.35049 8.32665 7.28413 8.12758L6.83325 6.77495Z" fill="white" />
      <path fill-rule="evenodd" clip-rule="evenodd" d="M12.1666 1.6001C12.3388 1.6001 12.4916 1.71027 12.5461 1.87361L13.0661 3.43387L14.6264 3.95396C14.7897 4.0084 14.8999 4.16126 14.8999 4.33343C14.8999 4.5056 14.7897 4.65846 14.6264 4.7129L13.0661 5.23299L12.5461 6.79326C12.4916 6.95659 12.3388 7.06676 12.1666 7.06676C11.9944 7.06676 11.8416 6.95659 11.7871 6.79326L11.267 5.23299L9.70676 4.7129C9.54342 4.65846 9.43325 4.5056 9.43325 4.33343C9.43325 4.16126 9.54342 4.0084 9.70676 3.95396L11.267 3.43387L11.7871 1.87361C11.8416 1.71027 11.9944 1.6001 12.1666 1.6001Z" fill="white" />
    </svg>
  );

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

              <Layout className={styles.accountInfo}>
                <Content>
                  <Flex gap={60} justify="center">
                    <div className={styles.col}>
                      <Title level={4}>Количество компаний {companyCount}</Title>
                      <Slider
                        className={cn(styles.customSlider, 'customSlider')}
                        min={1}
                        max={12}
                        value={companyCount}
                        onChange={handleCompanyChange}
                        tooltip={{ visible: true }}
                        marks={{ 1: '1', 6: '6', 12: '12' }}
                      />
                      <Title level={4}>{getDurationLabel()}</Title>
                      <Slider
                        className={cn(styles.customSlider, 'customSlider')}
                        min={1}
                        max={12}
                        value={monthDuration}
                        onChange={handleDurationChange}
                        tooltip={{ visible: true }}
                        marks={{ 1: '1 мес.', 6: '6 мес.', 12: '12 мес.' }}
                      />
                      <Divider />
                      <div className={styles.discountSection}>
                        <Text>Ваша скидка: </Text>
                        <Text>{discount} ₸</Text>
                      </div>
                    </div>
                    <div className={styles.col}>
                      <Card hoverable className={styles.card}>
                        <Title level={2} className={styles.card__title}>Твой уникальный тариф</Title>
                        <div className={styles.card__body}>
                          <div className={styles.card__item}>
                            <div className={styles.card__item__label}>Генерация маркетинговой стратегии</div>
                            <div className={styles.card__item__value}><CheckOutlined /></div>
                          </div>
                          <div className={styles.card__item}>
                            <div className={styles.card__item__label}>Генерация воронки продаж</div>
                            <div className={styles.card__item__value}><CheckOutlined /></div>
                          </div>
                          <div className={styles.card__item}>
                            <div className={styles.card__item__label}>Генерации постов</div>
                            <div className={styles.card__item__value}>*</div>
                          </div>
                          <div className={styles.card__item}>
                            <div className={styles.card__item__label}>Продукты</div>
                            <div className={styles.card__item__value}>*</div>
                          </div>
                          <div className={styles.card__item}>
                            <div className={styles.card__item__label}>Аккаунты на каждую платформу социальных сетей</div>
                            <div className={styles.card__item__value}>До 1</div>
                          </div>
                        </div>
                        <Title level={4} className={styles.card__price}>{totalCost} ₸</Title>
                        <Button block className={styles.card__button} icon={iconPlus} onClick={handleBuyTariff}>Подключить</Button>
                      </Card>
                    </div>
                  </Flex>
                </Content>
              </Layout>
            </div>
          </Content>
        </Layout>
      </Content>
    </Layout>
  );
};
