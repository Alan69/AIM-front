import { useEffect, useState } from 'react'
import { Layout, Tabs, TabsProps } from 'antd';
import { CalendarOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import styles from './ContentPlanPage.module.scss';
import { ContentPlanCalendar } from '../../components/ContentPlanCalendar/ContentPlanCalendar';
import { useTypedSelector } from 'hooks/useTypedSelector';
import { contentPlanActions } from 'modules/content-plan/redux/slices/contentPlan.slice';
import { useDispatch } from 'react-redux';
import { TAddToSchedulersData, useAddToSchedulersMutation, useGetSchedulersQuery } from 'modules/content-plan/redux/api';
import { ContentPlanAddPostModal } from 'modules/content-plan/components/ContentPlanAddPostModal/ContentPlanAddPostModal';
import { ContentPlanPostsListModal } from 'modules/content-plan/components/ContentPlanPostsListModal/ContentPlanPostsListModal';
import { TPostData, useGetPostListByCompanyIdQuery } from 'modules/post/redux/api';
import { TSocialMediaByCurrentCompanyData, useGetSocialMediaListByCurrentCompanyQuery } from 'modules/social-media/redux/api';
import { ContentPlanSocialMediaListModal } from 'modules/content-plan/components/ContentPlanSocialMediaListModal/ContentPlanSocialMediaListModal';

const { Content } = Layout;

export const ContentPlanPage = () => {
  const dispatch = useDispatch();

  const [isContentPlanAddPostModalOpen, setIsContentPlanAddPostModalOpen] = useState(false);
  const [isContentPlanPostsListModalOpen, setIsContentPlanPostsListModalOpen] = useState(false);
  const [isContentPlanSocialMediaListModalOpen, setIsContentPlanSocialMediaListModalOpen] = useState(false);
  const [selectNewPost, setSelectNewPost] = useState<TPostData | null>(null);
  const [selectNewSocialMedia, setSelectNewSocialMedia] = useState<TSocialMediaByCurrentCompanyData | null>(null);

  const { selectedPost } = useTypedSelector((state) => state.contentPlan);
  const { current_company } = useTypedSelector((state) => state.auth);

  const { data: postList, refetch: refetchPostList } = useGetSchedulersQuery(current_company?.id);
  const { data: postListByCompanyId } = useGetPostListByCompanyIdQuery(current_company?.id);
  const { data: socialMediaList } = useGetSocialMediaListByCurrentCompanyQuery();
  const [addToSchedulers] = useAddToSchedulersMutation();

  const handleShowContentPlanAddPostModal = () => {
    setIsContentPlanAddPostModalOpen(true);
  };

  const handleShowContentPlanPostsListModal = () => {
    setIsContentPlanPostsListModalOpen(true);
  };

  const handleShowContentPlanSocialMediaListModal = () => {
    setIsContentPlanSocialMediaListModalOpen(true);
  };

  const handleSelectNewPost = (post: TPostData) => {
    setSelectNewPost(post);
  }

  const handleSelectNewSocialMedia = (socialMedia: TSocialMediaByCurrentCompanyData) => {
    setSelectNewSocialMedia(socialMedia);
  }

  const handleAddToSchedulers = (item: TAddToSchedulersData) => {
    addToSchedulers(item).unwrap().then(() => refetchPostList());
  }

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
      icon: <AppstoreOutlined />,
      disabled: true
    },
    {
      key: '3',
      label: 'Список',
      children: 'Content of Tab Pane 2',
      icon: <UnorderedListOutlined />,
      disabled: true
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
        handleShowContentPlanSocialMediaListModal={handleShowContentPlanSocialMediaListModal}
        selectNewPost={selectNewPost}
        selectNewSocialMedia={selectNewSocialMedia}
        handleAddToSchedulers={handleAddToSchedulers}
      />
      <ContentPlanPostsListModal
        isModalOpen={isContentPlanPostsListModalOpen}
        setIsModalOpen={setIsContentPlanPostsListModalOpen}
        postListByCompanyId={postListByCompanyId}
        handleSelectNewPost={handleSelectNewPost}
        selectNewPost={selectNewPost}
      />
      <ContentPlanSocialMediaListModal
        isModalOpen={isContentPlanSocialMediaListModalOpen}
        setIsModalOpen={setIsContentPlanSocialMediaListModalOpen}
        socialMediaList={socialMediaList}
        handleSelectNewSocialMedia={handleSelectNewSocialMedia}
        selectNewSocialMedia={selectNewSocialMedia}
      />
    </>
  )
}
