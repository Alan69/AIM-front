import React, { useState } from 'react';
import { Modal, Button, Divider, Tabs, TabsProps } from 'antd';
import { AppstoreAddOutlined, UnorderedListOutlined } from '@ant-design/icons';

import 'moment/locale/ru';
import { TCreatePost, TPostData } from 'modules/post/redux/api';
import { PostQueryGenerateForm } from '../PostQueryGenerateForm/PostQueryGenerateForm';
import { PostCreateForm } from '../PostCreateForm/PostCreateForm';
import { useTypedSelector } from 'hooks/useTypedSelector';
import { TPostQuerCreateData } from 'modules/post-query/redux/api';
import { ContentPlanPostList } from '../ContentPlanPostList/ContentPlanPostList';

type TProps = {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  postListByCompanyId: TPostData[] | undefined
  handleSelectNewPost: (post: TPostData) => void
  selectNewPost: TPostData | null;
  isPostCreating: boolean;
  isCustomPostCreating: boolean;
  post: TPostData | undefined
  handleGeneratePost: (updatedData: TPostQuerCreateData) => void
  handleCreateCustomPost: (updatedData: TCreatePost) => void
  handleGetPostById: (id: string) => void
};

export const ContentPlanPostsListModal = ({
  isModalOpen,
  setIsModalOpen,
  postListByCompanyId,
  handleSelectNewPost,
  selectNewPost,
  isPostCreating,
  isCustomPostCreating,
  post,
  handleGeneratePost,
  handleCreateCustomPost,
  handleGetPostById,
}: TProps) => {
  const [expandedKeys, setExpandedKeys] = useState<Record<number, boolean>>({});
  const [selectCurrentPost, setSelectCurrentPost] = useState<TPostData | null>(selectNewPost);
  const [activeTabKey, setActiveTabKey] = useState<string>('2');
  const { generatedPost, createdCustomPost } = useTypedSelector((state) => state.post);

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
    {
      key: '1',
      label: 'Создание поста',
      children:
        <PostCreateForm
          post={post}
          isCustomPostCreating={isCustomPostCreating}
          handleCreateCustomPost={handleCreateCustomPost}
        />,
      icon: <AppstoreAddOutlined />,
      disabled: isCustomPostCreating,
    },
    {
      key: '2',
      label: 'Генерация поста',
      children:
        <PostQueryGenerateForm
          post={post}
          isPostCreating={isPostCreating}
          handleGeneratePost={handleGeneratePost}
          handleGetPostById={handleGetPostById}
        />,
      icon: <AppstoreAddOutlined />,
      disabled: isPostCreating,
    },
    {
      key: '3',
      label: 'Список избранных постов',
      children:
        <ContentPlanPostList
          postListByCompanyId={postListByCompanyId}
          selectCurrentPost={selectCurrentPost}
          handleSelectNewPost={handleSelectNewPost}
          setSelectCurrentPost={setSelectCurrentPost}
          expandedKeys={expandedKeys}
          toggleExpand={toggleExpand}
          setIsModalOpen={setIsModalOpen}
        />
      ,
      icon: <UnorderedListOutlined />,
      disabled: isPostCreating,
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
      bodyStyle={{
        maxHeight: '70vh',
        overflowY: 'auto',
      }}
      footer={[
        <Button
          key="schedule"
          type="default"
          onClick={() => {
            activeTabKey === '1' && createdCustomPost && handleSelectNewPost(createdCustomPost);
            activeTabKey === '2' && generatedPost && handleSelectNewPost(generatedPost);
            activeTabKey === '3' && selectCurrentPost && handleSelectNewPost(selectCurrentPost);
            setIsModalOpen(false);
          }}
          style={{
            borderRadius: '16px',
            width: '100%',
          }}
          disabled={
            (activeTabKey === '1' && !createdCustomPost)
            ||
            (activeTabKey === '2' && !generatedPost)
            ||
            (activeTabKey === '3' && !selectCurrentPost)
          }
        >
          Выбрать
          {/* <b>{selectCurrentPost?.title}</b> */}
        </Button>
      ]}
    >
      <Divider />
      <Tabs
        defaultActiveKey="2"
        onChange={handleTabChange}
        centered
        items={items}
      />
      <Divider />
    </Modal >
  );
};
