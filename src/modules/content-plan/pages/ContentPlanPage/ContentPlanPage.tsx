import { useEffect, useState } from 'react'
import cn from 'classnames';
import { Button, Layout, List, Tabs, TabsProps, Typography, Image, message } from 'antd';
import { CalendarOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import styles from './ContentPlanPage.module.scss';
import { ContentPlanCalendar } from '../../components/ContentPlanCalendar/ContentPlanCalendar';
import { useTypedSelector } from 'hooks/useTypedSelector';
import { contentPlanActions } from 'modules/content-plan/redux/slices/contentPlan.slice';
import { useDispatch } from 'react-redux';
import { TAddToSchedulersData, useAddToSchedulersMutation, useGetSchedulersQuery } from 'modules/content-plan/redux/api';
import { ContentPlanAddPostModal } from 'modules/content-plan/components/ContentPlanAddPostModal/ContentPlanAddPostModal';
import { ContentPlanPostsListModal } from 'modules/content-plan/components/ContentPlanPostsListModal/ContentPlanPostsListModal';
import { TPostData, useGetPostListByCompanyIdQuery, useLazyGetPostByIdQuery, usePostNowMutation } from 'modules/post/redux/api';
import { TSocialMediaByCurrentCompanyData, useGetSocialMediaListByCurrentCompanyQuery } from 'modules/social-media/redux/api';
import { ContentPlanSocialMediaListModal } from 'modules/content-plan/components/ContentPlanSocialMediaListModal/ContentPlanSocialMediaListModal';
import { SelectedPostPreview } from 'modules/content-plan/components/SelectedPostPreview/SelectedPostPreview';
import { TPostQuerCreateData, useCreatePostQueryMutation } from 'modules/post-query/redux/api';
import { postActions } from 'modules/post/redux/slices/post.slice';

const { Content } = Layout;
const { Title } = Typography;

export const ContentPlanPage = () => {
  const dispatch = useDispatch();

  const [isContentPlanAddPostModalOpen, setIsContentPlanAddPostModalOpen] = useState(false);
  const [isContentPlanPostsListModalOpen, setIsContentPlanPostsListModalOpen] = useState(false);
  const [isContentPlanSocialMediaListModalOpen, setIsContentPlanSocialMediaListModalOpen] = useState(false);

  const [selectNewPost, setSelectNewPost] = useState<TPostData | null>(null);
  const [selectedNewSocialMedias, setSelectedNewSocialMedias] = useState<TSocialMediaByCurrentCompanyData[]>([]);

  const [selectedDatePreview, setSelectedDatePreview] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<any[] | null>(null);
  const [formattedSelectedDate, setFormattedSelectedDate] = useState<string | null>(null);

  const { selectedPost } = useTypedSelector((state) => state.contentPlan);
  const { current_company } = useTypedSelector((state) => state.auth);

  const { data: postList, refetch: refetchPostList } = useGetSchedulersQuery(current_company?.id);
  const { data: postListByCompanyId, refetch: refetchPostListByCompanyId } = useGetPostListByCompanyIdQuery(current_company?.id);
  const { data: socialMediaList, refetch: refetchSocialMediaList } = useGetSocialMediaListByCurrentCompanyQuery();
  const [addToSchedulers, { isLoading: isAddingToSchedulers }] = useAddToSchedulersMutation();
  const [createPost, { isLoading: isPostCreating }] = useCreatePostQueryMutation();
  const [getPostById, { data: post }] = useLazyGetPostByIdQuery();
  const [postNow, { isLoading: isPostNowLoading }] = usePostNowMutation();

  const handleShowContentPlanAddPostModal = () => {
    refetchPostListByCompanyId();
    setIsContentPlanAddPostModalOpen(true);
  };

  const handleShowContentPlanPostsListModal = () => setIsContentPlanPostsListModalOpen(true);

  const handleShowContentPlanSocialMediaListModal = () => setIsContentPlanSocialMediaListModalOpen(true);

  const handleSelectNewPost = (post: TPostData) => setSelectNewPost(post);

  const handleSelectNewSocialMedias = (socialMedias: TSocialMediaByCurrentCompanyData[]) => setSelectedNewSocialMedias(socialMedias);

  const handlePostNow = () => {
    if (selectNewPost?.id) {
      postNow({
        post_id: selectNewPost?.id,
        social_media_account_ids: selectedNewSocialMedias.map((media) => media.id)
      }).unwrap().then((res) => {
        setIsContentPlanSocialMediaListModalOpen(false);
        setIsContentPlanAddPostModalOpen(false);
        setSelectedNewSocialMedias([]);
        message.success(res.message);
      })
    }
  };

  const handleAddToSchedulers = (item: TAddToSchedulersData) => {
    addToSchedulers(item).unwrap().then(() => {
      refetchPostList();
      setIsContentPlanAddPostModalOpen(false);
      message.success('Пост успешно добавлен в планировщик.');
    });
  }

  const handleGeneratePost = (updatedData: TPostQuerCreateData) => {
    createPost(updatedData).unwrap().then((response) => {
      getPostById(response.id).unwrap().then((responsePost) => {
        dispatch(postActions.setIsPostGenerated(true));
        dispatch(postActions.setGeneratedPost(responsePost));
        refetchPostListByCompanyId();
      })
    });
  };

  const handleGetPostById = (id: string) => {
    getPostById(id);
  }

  const handleSelectEvent = (event: any) => {
    if (selectedPost?.id === event.id) {
      dispatch(contentPlanActions.setSelectedPost(null));
    } else {
      dispatch(contentPlanActions.setSelectedPost(event));
    }
  };

  const handleClearAddModalParams = () => {
    setSelectNewPost(null);
    setSelectedNewSocialMedias([]);
  }

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Календарь',
      children:
        <ContentPlanCalendar
          postList={postList}
          handleSelectEvent={handleSelectEvent}
          selectedDatePreview={selectedDatePreview}
          setSelectedDatePreview={setSelectedDatePreview}
          setSelectedEvents={setSelectedEvents}
          setFormattedSelectedDate={setFormattedSelectedDate}
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
      dispatch(postActions.setIsPostGenerated(false));
      dispatch(postActions.setGeneratedPost(null));
    };
  }, []);

  useEffect(() => {
    dispatch(contentPlanActions.setSelectedPost(null));
    refetchSocialMediaList();
  }, [current_company]);

  return (
    <>
      <Layout>
        <Content style={{ padding: '24px', minHeight: 'calc(100vh - 70px)' }}>
          <h1>Контент план - {current_company?.name}</h1>
          <Layout>
            <Content className={styles.content}>
              <div className={cn(styles.calendar, selectedPost === null && selectedDatePreview === null ? styles.calendarIsFull : '')}>
                <Tabs
                  defaultActiveKey="1"
                  tabBarExtraContent={<Button type="primary" onClick={handleShowContentPlanAddPostModal}>Добавить контент</Button>}
                  centered
                  items={items}
                />
              </div>
              {selectedDatePreview || selectedPost !== null ? (
                <div className={styles.previewBlock}>
                  {selectedDatePreview ? (
                    <div className={styles.selectedEvents}>
                      <Title level={5}>{formattedSelectedDate}</Title>
                      {selectedEvents && selectedEvents.length > 0 ? (
                        <List
                          itemLayout="horizontal"
                          dataSource={selectedEvents}
                          renderItem={(item) => (
                            <List.Item
                              className={cn(styles.selectedPost, selectedPost?.id === item.id ? styles.selectedPost__isActive : '')}
                              onClick={() => handleSelectEvent(item)}
                            >
                              <List.Item.Meta
                                className={styles.selectedPost__content}
                                avatar={<Image width={32} height={32} src={item.picture} />}
                                title={
                                  <div className={styles.selectedPost__text}>
                                    <div className={styles.selectedPost__title}>{item.title}</div>
                                    <div className={styles.selectedPost__time}>{item.time}</div>
                                  </div>
                                }
                              />
                            </List.Item>
                          )}
                        />
                      ) : (
                        <p>Нет событий</p>
                      )}
                    </div>
                  ) : ''}
                  {selectedPost === null ? '' : <SelectedPostPreview selectedPost={selectedPost} />}
                </div>
              ) : ''}
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
        selectedNewSocialMedias={selectedNewSocialMedias}
        isAddingToSchedulers={isAddingToSchedulers}
        handleAddToSchedulers={handleAddToSchedulers}
        handleClearAddModalParams={handleClearAddModalParams}
        isPostNowLoading={isPostNowLoading}
        handlePostNow={handlePostNow}
      />
      <ContentPlanPostsListModal
        isModalOpen={isContentPlanPostsListModalOpen}
        setIsModalOpen={setIsContentPlanPostsListModalOpen}
        postListByCompanyId={postListByCompanyId}
        handleSelectNewPost={handleSelectNewPost}
        selectNewPost={selectNewPost}
        isPostCreating={isPostCreating}
        post={post}
        handleGeneratePost={handleGeneratePost}
        handleGetPostById={handleGetPostById}
      />
      <ContentPlanSocialMediaListModal
        isModalOpen={isContentPlanSocialMediaListModalOpen}
        setIsModalOpen={setIsContentPlanSocialMediaListModalOpen}
        socialMediaList={socialMediaList}
        handleSelectNewSocialMedias={handleSelectNewSocialMedias}
        selectedNewSocialMedias={selectedNewSocialMedias}
      />
    </>
  )
}
