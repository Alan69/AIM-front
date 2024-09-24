import React, { useState } from 'react';
import cn from 'classnames';
import { Card, Row, Col, Typography, Button, Layout, Divider, Tabs, TabsProps, Slider } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import styles from './TariffListPage.module.scss';
import { Content } from 'antd/es/layout/layout';
import { useGetTariffListQuery } from 'modules/tariff/redux/api';

const { Title, Text } = Typography;

export const TariffListPage: React.FC = () => {
  const { data } = useGetTariffListQuery();
  const [companyCount, setCompanyCount] = useState<number>(1);
  const [weekDuration, setWeekDuration] = useState<number>(1);
  const [discount, setDiscount] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);

  const handleCompanyChange = (value: number) => {
    setCompanyCount(value);
    calculateCost(value, weekDuration);
  };

  const handleDurationChange = (value: number) => {
    setWeekDuration(value);
    calculateCost(companyCount, value);
  };

  const calculateCost = (companies: number, weeks: number) => {
    const baseCost = 4900;
    let weekCost = 0;

    if (weeks === 1) {
      weekCost = baseCost;
    } else {
      const months = weeks - 1;
      weekCost = months * 4 * baseCost;
    }

    let companyCost = 0;
    if (companies === 1) {
      companyCost = weekCost;
    } else {
      companyCost = weekCost + (companies - 1) * 0.3 * weekCost;
    }

    const calculatedCost = companyCost;
    const maxCost = weeks * companies * baseCost;
    const calculatedDiscount = maxCost - calculatedCost;

    setTotalCost(calculatedCost);
    setDiscount(calculatedDiscount);
  };

  const getDurationLabel = () => {
    if (weekDuration === 1) {
      return "Длительность, недель 1";
    } else {
      return `Длительность, месяцев ${weekDuration - 1}`;
    }
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Месяц',
      children: <Row gutter={[16, 16]} justify="center">
        {data?.slice(0, 4).map((el) => (
          <Col key={el.id} xs={24} sm={12} md={6} className={styles.col}>
            <Card hoverable className={styles.card}>
              <Title level={2} className={styles.card__title}>{el.name}</Title>
              <div className={styles.card__body}>
                <div className={styles.card__item}>
                  <div className={styles.card__item__label}>Генерации постов</div>
                  <div className={styles.card__item__value}>{el.post_generations_limit ? el.post_generations_limit : '*'}</div>
                </div>
                <div className={styles.card__item}>
                  <div className={styles.card__item__label}>Компании</div>
                  <div className={styles.card__item__value}>{el.company_limit}</div>
                </div>
                <div className={styles.card__item}>
                  <div className={styles.card__item__label}>Аккаунты на каждую платформу социальных сетей</div>
                  <div className={styles.card__item__value}>До {el.social_media_account_limit}</div>
                </div>
              </div>
              <Title level={4} className={styles.card__price}>{el.monthly_price ? `${el.monthly_price} тг` : 'Бесплатно'}</Title>
              <Button block className={styles.card__button} icon={'+'}>Подключить</Button>
            </Card>
          </Col>
        ))}
      </Row>,
    },
    {
      key: '2',
      label: 'Год',
      children: <Row gutter={[16, 16]} justify="center">
        {data?.slice(0, 4).map((el) => (
          <Col key={el.id} xs={24} sm={12} md={6} className={styles.col}>
            <Card hoverable className={styles.card}>
              <Title level={2} className={styles.card__title}>{el.name}</Title>
              <div className={styles.card__body}>
                <div className={styles.card__item}>
                  <div className={styles.card__item__label}>Генерации постов</div>
                  <div className={styles.card__item__value}>{el.post_generations_limit ? el.post_generations_limit : '*'}</div>
                </div>
                <div className={styles.card__item}>
                  <div className={styles.card__item__label}>Компании</div>
                  <div className={styles.card__item__value}>{el.company_limit}</div>
                </div>
                <div className={styles.card__item}>
                  <div className={styles.card__item__label}>Аккаунты на каждую платформу социальных сетей</div>
                  <div className={styles.card__item__value}>До {el.social_media_account_limit}</div>
                </div>
              </div>
              <Title level={4} className={styles.card__price}>{el.yearly_price ? `${el.yearly_price} тг` : 'Бесплатно'}</Title>
              <Button block className={styles.card__button} icon={'+'}>Подключить</Button>
            </Card>
          </Col>
        ))}
      </Row>,
    },
  ];

  return (
    <Layout>
      <Content style={{ padding: '24px', minHeight: 'calc(100vh - 70px)' }}>
        <Layout>
          <Content>
            <div className={styles.offerPage}>
              <Layout className={styles.accountInfo}>
                <Content>
                  <Title level={2}>Тарифы на подписку</Title>
                  <Tabs defaultActiveKey="1" centered items={items} />
                </Content>
              </Layout>

              <Layout className={styles.accountInfo}>
                <Content>
                  <Row gutter={[16, 16]} justify="center">
                    <Col xs={24} sm={12}>
                      <Title level={2}>Подбери свой тариф</Title>
                      <div>
                        <Title level={4}>Количество компаний</Title>
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
                          max={13}
                          value={weekDuration}
                          onChange={handleDurationChange}
                          tooltip={{ visible: true }}
                          marks={{ 1: '1 нед.', 2: '1 мес.', 7: '6 мес.', 13: '12 мес.' }}
                        />
                        <Divider />
                        <div className={styles.discountSection}>
                          <Text>Ваша скидка:</Text>
                          <Text>{discount} тг</Text>
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12} md={6} className={styles.col}>
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
                        <Title level={4} className={styles.card__price}>{totalCost} тг</Title>
                        <Button block className={styles.card__button} icon={'+'}>Подключить</Button>
                      </Card>
                    </Col>
                  </Row>
                </Content>
              </Layout>
            </div>
          </Content>
        </Layout>
      </Content>
    </Layout>
  );
};
