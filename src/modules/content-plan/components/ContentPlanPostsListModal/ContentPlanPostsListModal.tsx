import { Modal, Button, Divider, List, Image, Typography } from 'antd';
import cn from 'classnames'

import React, { useState } from 'react';
import 'moment/locale/ru';
import styles from './ContentPlanPostsListModal.module.scss'
import { TPostData } from 'modules/post/redux/api';

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

  const toggleExpand = (index: number) => {
    setExpandedKeys((prevKeys) => ({
      ...prevKeys,
      [index]: !prevKeys[index],
    }));
  };

  return (
    <Modal
      title="Выбрать пост"
      open={isModalOpen}
      onOk={() => setIsModalOpen(false)}
      onCancel={() => setIsModalOpen(false)}
      footer={[
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
        >
          Выбрать <b>{selectCurrentPost?.title}</b>
        </Button>
      ]}
    >
      <Divider />
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
                    ellipsis={!expandedKeys[index] ? { rows: 4, expandable: false } : false}
                  >
                    {item.main_text}
                  </Paragraph>
                  <Button type="link" onClick={() => toggleExpand(index)}>
                    {expandedKeys[index] ? 'Скрыть' : 'Развернуть'}
                  </Button>
                </>
              }
            />
          </List.Item>
        )}
      />
      <Divider />
    </Modal>
  );
};
