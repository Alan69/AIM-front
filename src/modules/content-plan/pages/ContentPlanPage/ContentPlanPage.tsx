import React, { useEffect, useState } from 'react'
import { Layout, Modal, Tabs, TabsProps } from 'antd';
import { CalendarOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import styles from './ContentPlanPage.module.scss';
import { ContentPlanCalendar } from '../../components/ContentPlanCalendar/ContentPlanCalendar';
import { useTypedSelector } from 'hooks/useTypedSelector';
import { contentPlanActions } from 'modules/content-plan/redux/slices/contentPlan.slice';
import { useDispatch } from 'react-redux';
import { useGetSchedulersQuery } from 'modules/content-plan/redux/api';
import { ContentPlanAddPostModal } from 'modules/content-plan/components/ContentPlanAddPostModal/ContentPlanAddPostModal';
import { ContentPlanPostsListModal } from 'modules/content-plan/components/ContentPlanPostsListModal/ContentPlanPostsListModal';
import { TPostData, useGetPostListByCompanyIdQuery } from 'modules/post/redux/api';

const { Content } = Layout;

export const ContentPlanPage = () => {
  const [isContentPlanAddPostModalOpen, setIsContentPlanAddPostModalOpen] = useState(false);
  const [isContentPlanPostsListModalOpen, setIsContentPlanPostsListModalOpen] = useState(false);
  const [selectNewPost, setSelectNewPost] = useState<TPostData | null>(null);

  const { selectedPost } = useTypedSelector((state) => state.contentPlan);
  const { current_company } = useTypedSelector((state) => state.auth);

  const { data: postList } = useGetSchedulersQuery();
  const { data: postListByCompanyId } = useGetPostListByCompanyIdQuery(current_company?.id);

  const dispatch = useDispatch();

  const handleShowContentPlanAddPostModal = () => {
    setIsContentPlanAddPostModalOpen(true);
  };

  const handleShowContentPlanPostsListModal = () => {
    setIsContentPlanPostsListModalOpen(true);
  };

  const handleOk = () => {
    setIsContentPlanAddPostModalOpen(false);
  };

  const handleCancel = () => {
    setIsContentPlanAddPostModalOpen(false);
  };

  const handleSelectNewPost = (post: TPostData) => {
    setSelectNewPost(post);
  }

  console.log('selectNewPost', selectNewPost);

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Календарь',
      children:
        <ContentPlanCalendar
          handleShowContentPlanAddPostModal={handleShowContentPlanAddPostModal}
          selectedPost={selectedPost}
          postList={postList}
        />,
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

  useEffect(() => {
    return () => {
      dispatch(contentPlanActions.setSelectedPost(null));
    }
  }, [])

  return (
    <>
      <Layout>
        <Content style={{ padding: '24px', minHeight: 'calc(100vh - 70px)' }}>
          <h1>Контент план - {current_company?.name}</h1>
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
      <ContentPlanAddPostModal
        isModalOpen={isContentPlanAddPostModalOpen}
        setIsModalOpen={setIsContentPlanAddPostModalOpen}
        handleShowContentPlanPostsListModal={handleShowContentPlanPostsListModal}
        selectNewPost={selectNewPost}
      />
      <ContentPlanPostsListModal
        isModalOpen={isContentPlanPostsListModalOpen}
        setIsModalOpen={setIsContentPlanPostsListModalOpen}
        postListByCompanyId={postListByCompanyId}
        handleSelectNewPost={handleSelectNewPost}
        selectNewPost={selectNewPost}
      />
    </>
  )
}
