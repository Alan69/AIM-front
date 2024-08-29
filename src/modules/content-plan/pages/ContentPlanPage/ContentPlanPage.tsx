import React, { useEffect, useState } from 'react'
import { Layout, Modal, Tabs, TabsProps } from 'antd';
import { CalendarOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import styles from './ContentPlanPage.module.scss';
import { ContentPlanCalendar } from '../../components/ContentPlanCalendar/ContentPlanCalendar';
import { useTypedSelector } from 'hooks/useTypedSelector';

export const ContentPlanPage = () => {
  const { Content } = Layout;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { post } = useTypedSelector((state) => state.contentPlan);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Календарь',
      children: <ContentPlanCalendar showModal={showModal} />,
      icon: <CalendarOutlined />
    },
    {
      key: '2',
      label: 'Плитка',
      children: 'Content of Tab Pane 2',
      icon: <AppstoreOutlined />
    },
    {
      key: '3',
      label: 'Список',
      children: 'Content of Tab Pane 2',
      icon: <UnorderedListOutlined />
    },
  ];

  return (
    <>
      <Layout>
        <Content style={{ padding: '24px', minHeight: 'calc(100vh - 70px)' }}>
          <h1>Контент план</h1>
          <Layout>
            <Content>
              <div className={styles.container}>
                <Tabs
                  defaultActiveKey="1"
                  centered
                  items={items}
                  indicator={{ size: (origin) => origin - 20, align: 'center' }}
                />
              </div>
            </Content>
          </Layout>
        </Content>
      </Layout>
      <Modal title="Basic Modal" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
    </>
  )
}
