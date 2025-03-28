import { useEffect, useRef, useState } from "react";
import cn from "classnames";
import {
  Button,
  Layout,
  List,
  Tabs,
  TabsProps,
  Typography,
  message,
} from "antd";
import {
  CalendarOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import styles from "./ContentPlanPage.module.scss";
import { ContentPlanCalendar } from "../../components/ContentPlanCalendar/ContentPlanCalendar";
import { useTypedSelector } from "hooks/useTypedSelector";
import { contentPlanActions } from "modules/content-plan/redux/slices/contentPlan.slice";
import { useDispatch } from "react-redux";
import {
  TAddToSchedulersRequest,
  TEditPostFromSchedulersRequest,
  useAddToSchedulersMutation,
  useDeteleFromSchedulerMutation,
  useEditPostFromSchedulerMutation,
  useGetSchedulersQuery,
} from "modules/content-plan/redux/api";
import { ContentPlanAddPostModal } from "modules/content-plan/components/ContentPlanAddPostModal/ContentPlanAddPostModal";
import { ContentPlanPostsListModal } from "modules/content-plan/components/ContentPlanPostsListModal/ContentPlanPostsListModal";
import {
  TCreatePost,
  TPostData,
  useCreateCustomPostMutation,
  useGetPostListByCompanyIdQuery,
  useLazyGetPostByIdQuery,
  usePostNowMutation,
} from "modules/post/redux/api";
import {
  TSocialMediaByCurrentCompanyData,
  useGetSocialMediaListByCurrentCompanyQuery,
} from "modules/social-media/redux/api";
import { ContentPlanSocialMediaListModal } from "modules/content-plan/components/ContentPlanSocialMediaListModal/ContentPlanSocialMediaListModal";
import { SelectedPostPreview } from "modules/content-plan/components/SelectedPostPreview/SelectedPostPreview";
import {
  TPostQueryCreateData,
  useCreatePostQueryMutation,
} from "modules/post-query/redux/api";
import { postActions } from "modules/post/redux/slices/post.slice";
import { SelectedPreviewBlockModal } from "modules/content-plan/components/SelectedPreviewBlockModal/SelectedPreviewBlockModal.modal";
import { useIsMobile, useIsSmallLaptop } from "hooks/media";
import { useTranslation } from "react-i18next";
import { ContentPlanReelsModal } from "modules/content-plan/components/ContentPlanReelsModal/ContentPlanReelsModal";
import {
  TCreateReelRequest,
  TReelData,
  useCreateCustomReelMutation,
  useLazyGetReelByIdQuery,
  useLazyGetReelMediaListByIdQuery,
  usePostReelNowMutation,
} from "modules/reel/redux/api";
import { reelActions } from "modules/reel/redux/slices/reel.slice";
import { ContentPlanPostingType } from "modules/content-plan/types";
import {
  TCreateStoriesRequest,
  TStoriesData,
  useCreateCustomStoriesMutation,
  useLazyGetStoriesByIdQuery,
  usePostStoriesNowMutation,
} from "modules/stories/redux/api";
import { storiesActions } from "modules/stories/redux/slices/stories.slice";
import { ContentPlanStoriesModal } from "modules/content-plan/components/ContentPlanStoriesModal/ContentPlanStoriesModal";
import { ContentPlanDeletePost } from "modules/content-plan/components/ContentPlanDeletePost/ContentPlanDeletePost";
import { ContentPlanEditPost } from "modules/content-plan/components/ContentPlanEditPost/ContentPlanEditPost";
import VideoInstructionModal from "modules/account/components/VideoInstructionModal/VideoInstructionModal";
import ReactPlayer from "react-player";

const { Content } = Layout;
const { Title } = Typography;

export const ContentPlanPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isSmallLaptop = useIsSmallLaptop();
  const isMobile = useIsMobile();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const playerRef = useRef<ReactPlayer | null>(null);

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => {
    setIsModalVisible(false);
    if (playerRef.current) {
      playerRef.current.getInternalPlayer().pause();
    }
  };

  const [isContentPlanAddPostModalOpen, setIsContentPlanAddPostModalOpen] =
    useState(false);
  const [isContentPlanPostsListModalOpen, setIsContentPlanPostsListModalOpen] =
    useState(false);
  const [isContentPlanReelsModalOpen, setIsContentPlanReelsModalOpen] =
    useState(false);
  const [isContentPlanStorieModalOpen, setIsContentPlanStorieModalOpen] =
    useState(false);
  const [
    isContentPlanSocialMediaListModalOpen,
    setIsContentPlanSocialMediaListModalOpen,
  ] = useState(false);
  const [
    isContentPlanDeletePostModalOpen,
    setIsContentPlanDeletePostModalOpen,
  ] = useState(false);
  const [isContentPlanEditPostModalOpen, setIsContentPlanEditPostModalOpen] =
    useState(false);

  const [selectedPostType, setSelectedPostType] = useState(
    ContentPlanPostingType.UNKNOWN
  );

  const [selectNewPost, setSelectNewPost] = useState<
    TPostData | TReelData | TStoriesData | null
  >(null);

  const [selectedNewSocialMedias, setSelectedNewSocialMedias] = useState<
    TSocialMediaByCurrentCompanyData[]
  >([]);

  const [selectedDatePreview, setSelectedDatePreview] = useState<Date | null>(
    null
  );
  const [selectedEvents, setSelectedEvents] = useState<any[] | null>(null);
  const [formattedSelectedDate, setFormattedSelectedDate] = useState<
    string | null
  >(null);

  const { selectedPost } = useTypedSelector((state) => state.contentPlan);
  const { current_company } = useTypedSelector((state) => state.auth);

  const { data: contentPlanList, refetch: refetchPostList } =
    useGetSchedulersQuery(current_company?.id);
  const { data: postListByCompanyId, refetch: refetchPostListByCompanyId } =
    useGetPostListByCompanyIdQuery(current_company?.id);
  const { data: socialMediaList, refetch: refetchSocialMediaList } =
    useGetSocialMediaListByCurrentCompanyQuery();
  const [addToSchedulers, { isLoading: isAddingToSchedulers }] =
    useAddToSchedulersMutation();
  const [deteleFromScheduler] = useDeteleFromSchedulerMutation();
  const [editPostFromScheduler] = useEditPostFromSchedulerMutation();
  const [createPostQuery, { isLoading: isPostCreating }] =
    useCreatePostQueryMutation();
  const [createCustomPost, { isLoading: isCustomPostCreating }] =
    useCreateCustomPostMutation();
  const [createCustomReel, { isLoading: isCustomReelCreating }] =
    useCreateCustomReelMutation();
  const [createCustomStories, { isLoading: isCustomStoriesCreating }] =
    useCreateCustomStoriesMutation();

  const [getPostById, { data: post }] = useLazyGetPostByIdQuery();
  const [getReelById, { data: reel }] = useLazyGetReelByIdQuery();
  const [getReelMediaListById, { data: reelMediaList }] =
    useLazyGetReelMediaListByIdQuery();
  const [getStoriesById, { data: storie }] = useLazyGetStoriesByIdQuery();

  const [postNow, { isLoading: isPostNowLoading }] = usePostNowMutation();
  const [postReelNow, { isLoading: isPostReelNowLoading }] =
    usePostReelNowMutation();
  const [postStoriesNow, { isLoading: isPostStorieNowLoading }] =
    usePostStoriesNowMutation();

  const updatedReel = {
    reelMediaList,
    ...reel,
  };

  const handleShowContentPlanAddPostModal = () => {
    refetchPostListByCompanyId();
    setIsContentPlanAddPostModalOpen(true);
  };

  const handleShowContentPlanPostsListModal = () =>
    setIsContentPlanPostsListModalOpen(true);

  const handleShowContentPlanReelsModal = () =>
    setIsContentPlanReelsModalOpen(true);

  const handleShowContentPlanStorieModal = () =>
    setIsContentPlanStorieModalOpen(true);

  const handleShowContentPlanSocialMediaListModal = () =>
    setIsContentPlanSocialMediaListModalOpen(true);

  const handleShowContentPlanDeletePostModal = () => {
    setIsContentPlanDeletePostModalOpen(true);
  };

  const handleShowContentPlanEditPostModal = () => {
    setIsContentPlanEditPostModalOpen(true);
  };

  const handleSelectNewPost = (
    post?: TPostData,
    reel?: TReelData,
    storie?: TStoriesData
  ) => {
    if (post) {
      // @ts-ignore
      setSelectNewPost({ ...post, media: post.previouspostimage });
      setSelectedPostType(ContentPlanPostingType.POST);
    }
    if (reel) {
      // @ts-ignore
      setSelectNewPost({ ...reel, media: reel.previous_media });
      setSelectedPostType(ContentPlanPostingType.REELS);
    }
    if (storie) {
      setSelectNewPost(storie);
      setSelectedPostType(ContentPlanPostingType.STORIES);
    }
  };

  const handleSelectNewSocialMedias = (
    socialMedias: TSocialMediaByCurrentCompanyData[]
  ) => setSelectedNewSocialMedias(socialMedias);

  const handlePostNow = () => {
    if (selectNewPost?.id) {
      if (selectedPostType === ContentPlanPostingType.POST) {
        postNow({
          post_id: selectNewPost?.id,
          social_media_account_ids: selectedNewSocialMedias.map(
            (media) => media.id
          ),
          // @ts-ignore
          previous_post_image_ids: selectNewPost?.previouspostimage?.map(
            // @ts-ignore
            (media) => media.id
          ),
        })
          .unwrap()
          .then((res) => {
            setIsContentPlanSocialMediaListModalOpen(false);
            setIsContentPlanAddPostModalOpen(false);
            setSelectedNewSocialMedias([]);
            message.success(res.message);
          });
      }

      if (selectedPostType === ContentPlanPostingType.REELS) {
        postReelNow({
          reel: selectNewPost?.id,
          social_media_accounts: selectedNewSocialMedias.map(
            (media) => media.id
          ),
          reel_media: updatedReel?.reelMediaList?.map((media) => media.id),
        })
          .unwrap()
          .then((res) => {
            setIsContentPlanSocialMediaListModalOpen(false);
            setIsContentPlanAddPostModalOpen(false);
            setSelectedNewSocialMedias([]);
            message.success(res.message);
          });
      }

      if (selectedPostType === ContentPlanPostingType.STORIES) {
        postStoriesNow({
          story: selectNewPost?.id,
          social_media_accounts: selectedNewSocialMedias.map(
            (media) => media.id
          ),
        })
          .unwrap()
          .then((res) => {
            setIsContentPlanSocialMediaListModalOpen(false);
            setIsContentPlanAddPostModalOpen(false);
            setSelectedNewSocialMedias([]);
            message.success(res.message);
          });
      }
    }
  };

  const handleAddToSchedulers = (item: TAddToSchedulersRequest) => {
    addToSchedulers(item)
      .unwrap()
      .then(() => {
        refetchPostList();
        setIsContentPlanAddPostModalOpen(false);
        message.success(t("contentPlanPage.post_added"));
      })
      .catch((error) => {
        message.error(error.data.error);
      });
  };

  const handleDeleteFromScheduler = (scheduler_id: string) => {
    deteleFromScheduler(scheduler_id)
      .unwrap()
      .then((res) => {
        refetchPostList()
          .unwrap()
          .then(() => {
            dispatch(contentPlanActions.setSelectedPost(null));
            setSelectedEvents(null);
            message.success(res.message);
          });
      })
      .catch((error) => {
        message.error(error.data.error);
      });
  };

  const handleEditPostFromScheduler = (
    payload: TEditPostFromSchedulersRequest
  ) => {
    editPostFromScheduler(payload)
      .unwrap()
      .then((res) => {
        refetchPostList()
          .unwrap()
          .then(() => {
            dispatch(contentPlanActions.setSelectedPost(null));
            setSelectedEvents(null);
            message.success(res.message);
          });
      })
      .catch((error) => {
        message.error(error.data.error);
      });
  };

  const handleGeneratePost = (updatedData: TPostQueryCreateData) => {
    createPostQuery(updatedData)
      .unwrap()
      .then((response) => {
        getPostById(response.post_id)
          .unwrap()
          .then((responsePost) => {
            dispatch(postActions.setIsPostGenerated(true));
            dispatch(postActions.setGeneratedPost(responsePost));
            refetchPostListByCompanyId();
          });
      })
      .catch((error) => {
        message.error(error.data.error);
      });
  };

  const handleCreateCustomPost = (updatedData: TCreatePost) => {
    createCustomPost(updatedData)
      .unwrap()
      .then((response) => {
        getPostById(response.id)
          .unwrap()
          .then((responsePost) => {
            dispatch(postActions.setIsCustomCreated(true));
            dispatch(postActions.setCreatedCustomPost(responsePost));
          });
      });
  };

  const handleCreateCustomReel = (updatedData: TCreateReelRequest) => {
    createCustomReel(updatedData)
      .unwrap()
      .then((response) => {
        getReelById(response.reel_id)
          .unwrap()
          .then((responseStorie) => {
            getReelMediaListById(response.reel_id);
            dispatch(reelActions.setIsCustomReelCreated(true));
            dispatch(reelActions.setCreatedCustomReel(responseStorie));
          });
      });
  };

  const handleCreateCustomStories = (updatedData: TCreateStoriesRequest) => {
    createCustomStories(updatedData)
      .unwrap()
      .then((response) => {
        getStoriesById(response.storie_id)
          .unwrap()
          .then((responseStorie) => {
            getReelMediaListById(response.storie_id);
            dispatch(storiesActions.setIsCustomStoriesCreated(true));
            dispatch(storiesActions.setCreatedCustomStories(responseStorie));
          });
      });
  };

  const handleGetPostById = (id: string) => {
    getPostById(id);
  };

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
  };

  const handleClosePreviewBlockModal = () => {
    dispatch(contentPlanActions.setSelectedPost(null));
    setSelectedDatePreview(null);
    setSelectedEvents(null);
    setFormattedSelectedDate(null);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: t("contentPlanPage.calendar"),
      children: (
        <ContentPlanCalendar
          contentPlanList={contentPlanList}
          handleSelectEvent={handleSelectEvent}
          selectedDatePreview={selectedDatePreview}
          setSelectedDatePreview={setSelectedDatePreview}
          setSelectedEvents={setSelectedEvents}
          setFormattedSelectedDate={setFormattedSelectedDate}
        />
      ),
      icon: <CalendarOutlined />,
    },
    {
      key: "2",
      label: t("contentPlanPage.tile"),
      children: "Content of Tab Pane 2",
      icon: <AppstoreOutlined />,
      disabled: true,
    },
    {
      key: "3",
      label: t("contentPlanPage.list"),
      children: "Content of Tab Pane 2",
      icon: <UnorderedListOutlined />,
      disabled: true,
    },
  ];

  useEffect(() => {
    return () => {
      dispatch(contentPlanActions.setSelectedPost(null));
      dispatch(postActions.setIsPostGenerated(false));
      dispatch(postActions.setGeneratedPost(null));
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(contentPlanActions.setSelectedPost(null));
    refetchSocialMediaList();
  }, [current_company, dispatch, refetchSocialMediaList]);

  return (
    <>
      <Layout>
        <Content className="page-layout">
          <h1 className="main-title">
            {t("contentPlanPage.title")} - {current_company?.name}
          </h1>
          <Layout>
            <Content className={styles.content}>
              <div
                className={cn(
                  styles.calendar,
                  selectedPost === null && selectedDatePreview === null
                    ? styles.calendarIsFull
                    : ""
                )}
              >
                <Tabs
                  defaultActiveKey="1"
                  tabBarExtraContent={
                    <Button
                      type="primary"
                      icon={<PlusCircleOutlined />}
                      onClick={handleShowContentPlanAddPostModal}
                    >
                      {isMobile ? "" : t("contentPlanPage.add_content")}
                    </Button>
                  }
                  centered={!isMobile}
                  items={items}
                  style={{
                    overflowX: isMobile ? "auto" : "unset",
                    whiteSpace: "nowrap",
                  }}
                  size={isMobile ? "small" : "middle"}
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
                              className={cn(
                                styles.selectedPost,
                                selectedPost?.id === item.id
                                  ? styles.selectedPost__isActive
                                  : ""
                              )}
                              onClick={() => handleSelectEvent(item)}
                            >
                              <List.Item.Meta
                                className={styles.selectedPost__content}
                                title={
                                  <div className={styles.selectedPost__text}>
                                    <div className={styles.selectedPost__title}>
                                      {item.title}
                                    </div>
                                    <div className={styles.selectedPost__time}>
                                      {item.time}
                                    </div>
                                  </div>
                                }
                              />
                            </List.Item>
                          )}
                        />
                      ) : (
                        <p>{t("contentPlanPage.no_active_posts")}</p>
                      )}
                    </div>
                  ) : (
                    ""
                  )}
                  {selectedPost === null ? (
                    ""
                  ) : (
                    <SelectedPostPreview
                      selectedPost={selectedPost}
                      handleShowContentPlanDeletePostModal={
                        handleShowContentPlanDeletePostModal
                      }
                      handleShowContentPlanEditPostModal={
                        handleShowContentPlanEditPostModal
                      }
                    />
                  )}
                </div>
              ) : (
                ""
              )}
            </Content>
          </Layout>
        </Content>
        <VideoInstructionModal
          isModalVisible={isModalVisible}
          onOpen={openModal}
          onClose={closeModal}
          playerRef={playerRef}
          src="https://res.cloudinary.com/dwbv1fvgp/video/upload/v1736418349/content_plan_jwhudp.mov"
        />
      </Layout>
      <ContentPlanAddPostModal
        isModalOpen={isContentPlanAddPostModalOpen}
        setIsModalOpen={setIsContentPlanAddPostModalOpen}
        handleShowContentPlanPostsListModal={
          handleShowContentPlanPostsListModal
        }
        handleShowContentPlanReelsModal={handleShowContentPlanReelsModal}
        handleShowContentPlanStorieModal={handleShowContentPlanStorieModal}
        handleShowContentPlanSocialMediaListModal={
          handleShowContentPlanSocialMediaListModal
        }
        selectNewPost={selectNewPost}
        selectedNewSocialMedias={selectedNewSocialMedias}
        isAddingToSchedulers={isAddingToSchedulers}
        handleAddToSchedulers={handleAddToSchedulers}
        handleClearAddModalParams={handleClearAddModalParams}
        isPostNowLoading={isPostNowLoading}
        isPostReelNowLoading={isPostReelNowLoading}
        isPostStorieNowLoading={isPostStorieNowLoading}
        handlePostNow={handlePostNow}
        selectedPostType={selectedPostType}
      />
      <ContentPlanPostsListModal
        isModalOpen={isContentPlanPostsListModalOpen}
        setIsModalOpen={setIsContentPlanPostsListModalOpen}
        postListByCompanyId={postListByCompanyId}
        handleSelectNewPost={handleSelectNewPost}
        selectNewPost={selectNewPost}
        isPostCreating={isPostCreating}
        isCustomPostCreating={isCustomPostCreating}
        post={post}
        handleGeneratePost={handleGeneratePost}
        handleCreateCustomPost={handleCreateCustomPost}
        handleGetPostById={handleGetPostById}
      />
      <ContentPlanReelsModal
        isModalOpen={isContentPlanReelsModalOpen}
        setIsModalOpen={setIsContentPlanReelsModalOpen}
        handleSelectNewPost={handleSelectNewPost}
        isCustomReelCreating={isCustomReelCreating}
        // @ts-ignore
        reel={updatedReel}
        handleCreateCustomReel={handleCreateCustomReel}
      />
      <ContentPlanStoriesModal
        isModalOpen={isContentPlanStorieModalOpen}
        setIsModalOpen={setIsContentPlanStorieModalOpen}
        handleSelectNewPost={handleSelectNewPost}
        isCustomStoriesCreating={isCustomStoriesCreating}
        storie={storie}
        handleCreateCustomStories={handleCreateCustomStories}
      />
      <ContentPlanSocialMediaListModal
        isModalOpen={isContentPlanSocialMediaListModalOpen}
        setIsModalOpen={setIsContentPlanSocialMediaListModalOpen}
        socialMediaList={socialMediaList}
        handleSelectNewSocialMedias={handleSelectNewSocialMedias}
        selectedNewSocialMedias={selectedNewSocialMedias}
      />
      <ContentPlanDeletePost
        isModalOpen={isContentPlanDeletePostModalOpen}
        setIsModalOpen={setIsContentPlanDeletePostModalOpen}
        handleDeleteFromScheduler={handleDeleteFromScheduler}
        selectedPost={selectedPost}
      />
      <ContentPlanEditPost
        isModalOpen={isContentPlanEditPostModalOpen}
        setIsModalOpen={setIsContentPlanEditPostModalOpen}
        handleEditPostFromScheduler={handleEditPostFromScheduler}
        selectedPost={selectedPost}
      />
      {isSmallLaptop ? (
        <SelectedPreviewBlockModal
          selectedDatePreview={selectedDatePreview}
          selectedPost={selectedPost}
          formattedSelectedDate={formattedSelectedDate}
          selectedEvents={selectedEvents}
          handleSelectEvent={handleSelectEvent}
          isOpen={selectedDatePreview || selectedPost !== null ? true : false}
          handleCloseModal={handleClosePreviewBlockModal}
          handleShowContentPlanDeletePostModal={
            handleShowContentPlanDeletePostModal
          }
          handleShowContentPlanEditPostModal={
            handleShowContentPlanEditPostModal
          }
        />
      ) : (
        ""
      )}
    </>
  );
};
