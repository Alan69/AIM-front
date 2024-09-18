import { Modal, Button, Divider, List, Image, Typography, Tabs, TabsProps } from 'antd';
import { AppstoreAddOutlined, UnorderedListOutlined } from '@ant-design/icons';
import cn from 'classnames'

import React, { useState } from 'react';
import 'moment/locale/ru';
import styles from './ContentPlanPostsListModal.module.scss'
import { TPostData } from 'modules/post/redux/api';
import { PostQueryGenerateForm } from '../PostQueryGenerateForm/PostQueryGenerateForm';
import { PostCreateForm } from '../PostCreateForm/PostCreateForm';

type TProps = {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  postListByCompanyId: TPostData[] | undefined
  handleSelectNewPost: (post: TPostData) => void
  selectNewPost: TPostData | null;
};

const { Title, Paragraph } = Typography;

export const ContentPlanPostsListModal = ({
  isModalOpen,
  setIsModalOpen,
  postListByCompanyId,
  handleSelectNewPost,
  selectNewPost,
}: TProps) => {
  const [expandedKeys, setExpandedKeys] = useState<Record<number, boolean>>({});
  const [selectCurrentPost, setSelectCurrentPost] = useState<TPostData | null>(selectNewPost);
  const [activeTabKey, setActiveTabKey] = useState<string>('1');

  const toggleExpand = (index: number) => {
    setExpandedKeys((prevKeys) => ({
      ...prevKeys,
      [index]: !prevKeys[index],
    }));
  };

  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
  };

  const items: TabsProps['items'] = [
    // {
    //   key: '1',
    //   label: 'Создание поста',
    //   children: <PostCreateForm />,
    //   icon: <AppstoreAddOutlined />
    // },
    {
      key: '2',
      label: 'Генерация поста',
      children: <PostQueryGenerateForm />,
      icon: <AppstoreAddOutlined />,
    },
    {
      key: '3',
      label: 'Список постов',
      children: <div className={styles.modalWithScroll}>
        <List
          itemLayout="horizontal"
          dataSource={postListByCompanyId}
          renderItem={(item, index) => (
            <List.Item
              onClick={() => setSelectCurrentPost(item)}
              className={cn(styles.item, selectCurrentPost?.id === item.id ? styles.item__isActive : '')}
            >
              <List.Item.Meta
                avatar={<Image width={160} height={160} src={item.picture} />}
                title={<Title level={5}>{item.title}</Title>}
                description={
                  <>
                    <Paragraph
                      className={styles.text}
                      ellipsis={!expandedKeys[index] ? { rows: 4, expandable: false } : false}
                    >
                      {item.main_text}
                    </Paragraph>
                    <div className={styles.expandBtn}>
                      <Button type="link" onClick={() => toggleExpand(index)}>
                        {expandedKeys[index] ? 'Скрыть' : 'Развернуть'}
                      </Button>
                    </div>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </div>,
      icon: <UnorderedListOutlined />,
    },
  ];

  return (
    <Modal
      title="Выбрать пост"
      open={isModalOpen}
      onOk={() => setIsModalOpen(false)}
      onCancel={() => setIsModalOpen(false)}
      onClose={() => setIsModalOpen(false)}
      width={600}
      footer={activeTabKey === '3' ? [
        <Button
          key="schedule"
          type="default"
          onClick={() => {
            selectCurrentPost && handleSelectNewPost(selectCurrentPost);
            setIsModalOpen(false);
          }}
          style={{
            borderRadius: '16px',
            width: '100%',
          }}
          disabled={!selectCurrentPost}
        >
          Выбрать
          {/* <b>{selectCurrentPost?.title}</b> */}
        </Button>
      ] : null}
    >
      <Divider />
      <Tabs
        defaultActiveKey="1"
        onChange={handleTabChange}
        centered
        items={items}
      />
      <Divider />
    </Modal>
  );
};
