import React from 'react';
import { Card, Row, Col, Typography, Button, Layout, Divider } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import styles from './OffersPage.module.scss';
import { Content } from 'antd/es/layout/layout';

const { Title, Text } = Typography;

export const OffersPage: React.FC = () => {
  return (
    <Layout>
      <Content style={{ padding: '24px', minHeight: 'calc(100vh - 70px)' }}>
        <Layout>
          <Content>
            <div className={styles.offerPage}>
              <Title level={2}>Покупка тарифного плана</Title>
              <Row gutter={[16, 16]} justify="center">
                <Col xs={24} sm={12} md={6}>
                  <Card hoverable>
                    <Title level={4}>Standard</Title>
                    <Title level={3}>9 900₸</Title>
                    <ul>
                      <li><CheckOutlined /> 50 постов</li>
                      <li><CheckOutlined /> Создание текста</li>
                      <li><CheckOutlined /> Создание визуала</li>
                      <li><CheckOutlined /> ∞ компаний</li>
                      <li><CheckOutlined /> ∞ продуктов</li>
                    </ul>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card hoverable>
                    <Title level={4}>Pro Plan</Title>
                    <Title level={3}>24 900₸</Title>
                    <ul>
                      <li><CheckOutlined /> 150 постов</li>
                      <li><CheckOutlined /> Создание текста</li>
                      <li><CheckOutlined /> Создание визуала</li>
                      <li><CheckOutlined /> ∞ компаний</li>
                      <li><CheckOutlined /> ∞ продуктов</li>
                    </ul>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card hoverable>
                    <Title level={4}>Business Plan</Title>
                    <Title level={3}>49 900₸</Title>
                    <ul>
                      <li><CheckOutlined /> 350 постов</li>
                      <li><CheckOutlined /> Создание текста</li>
                      <li><CheckOutlined /> Создание визуала</li>
                      <li><CheckOutlined /> ∞ компаний</li>
                      <li><CheckOutlined /> ∞ продуктов</li>
                    </ul>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card hoverable>
                    <Title level={4}>Ultra Plan</Title>
                    <Title level={3}>124 900₸</Title>
                    <ul>
                      <li><CheckOutlined /> 1000 постов</li>
                      <li><CheckOutlined /> Создание текста</li>
                      <li><CheckOutlined /> Создание визуала</li>
                      <li><CheckOutlined /> ∞ компаний</li>
                      <li><CheckOutlined /> ∞ продуктов</li>
                    </ul>
                  </Card>
                </Col>
              </Row>
              <div className={styles.accountInfo}>
                <Title level={4}>Номер вашего счета: 620-159-072</Title>
                <Divider />
                <Title level={4}>Покупка в 3 шага:</Title>
                <Text>1) Выберите удобный для вас тарифный план и банк. Мы работаем с Kaspi и Halyk.</Text><br />
                <Text>2) Напишите нам в WhatsApp: Тарифный план - XXXXX. Банк - XXXX. Номер счета - XXX-XXX-XXX.</Text><br />
                <Text>3) Мы выставим счет и активируем выбранный вами тарифный план после оплаты.</Text>

                <div className={styles.whatsappInfo}>
                  <Title level={4}>WhatsApp номер: 8-776-13-77-999</Title>
                  <Button type="default" size="large" href="https://wa.me/77761377999" target="_blank" className={styles.whatsappButton}>
                    НАПИСАТЬ НА WHATSAPP
                  </Button>
                </div>
              </div>

            </div>
          </Content>
        </Layout>
      </Content>
    </Layout>


  );
};
