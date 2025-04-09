import React, { useState } from "react";
import { Modal, Button, Divider, Tabs, TabsProps } from "antd";
import { AppstoreAddOutlined, UnorderedListOutlined } from "@ant-design/icons";

import "moment/locale/ru";
import { TCreatePost, TPostData } from "modules/post/redux/api";
import { PostCreateForm } from "../PostCreateForm/PostCreateForm";
import { useTypedSelector } from "hooks/useTypedSelector";
import { TPostQueryCreateData } from "modules/post-query/redux/api";
import { ContentPlanPostList } from "../ContentPlanPostList/ContentPlanPostList";
import { useIsMobile } from "hooks/media";
import { useTranslation } from "react-i18next";
import { TReelData } from "modules/reel/redux/api";
import { TStoriesData } from "modules/stories/redux/api";

type TProps = {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  postListByCompanyId: TPostData[] | undefined;
  handleSelectNewPost: (post: TPostData) => void;
  selectNewPost: TPostData | TReelData | TStoriesData | null;
  isPostCreating: boolean;
  isCustomPostCreating: boolean;
  post: TPostData | undefined;
  handleGeneratePost: (updatedData: TPostQueryCreateData) => void;
  handleCreateCustomPost: (updatedData: TCreatePost) => void;
  handleGetPostById: (id: string) => void;
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
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const [expandedKeys, setExpandedKeys] = useState<Record<number, boolean>>({});
  const [selectCurrentPost, setSelectCurrentPost] = useState<TPostData | null>(
    selectNewPost && "img_prompt" in selectNewPost ? selectNewPost : null
  );
  const [activeTabKey, setActiveTabKey] = useState<string>("2");
  const { generatedPost, createdCustomPost } = useTypedSelector(
    (state) => state.post
  );

  const toggleExpand = (index: number) => {
    setExpandedKeys((prevKeys) => ({
      ...prevKeys,
      [index]: !prevKeys[index],
    }));
  };

  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: t("contentPlanPage.content_plan_posts_list_modal.create_post"),
      children: (
        <PostCreateForm
          post={post}
          isCustomPostCreating={isCustomPostCreating}
          handleCreateCustomPost={handleCreateCustomPost}
        />
      ),
      icon: <AppstoreAddOutlined />,
      disabled: isCustomPostCreating,
    },
    {
      key: "2",
      label: t("contentPlanPage.content_plan_posts_list_modal.favorite_posts"),
      children: (
        <ContentPlanPostList
          postListByCompanyId={postListByCompanyId}
          selectCurrentPost={selectCurrentPost}
          handleSelectNewPost={handleSelectNewPost}
          setSelectCurrentPost={setSelectCurrentPost}
          expandedKeys={expandedKeys}
          toggleExpand={toggleExpand}
          setIsModalOpen={setIsModalOpen}
        />
      ),
      icon: <UnorderedListOutlined />,
      disabled: isPostCreating,
    },
  ];

  return (
    <Modal
      title={t("contentPlanPage.content_plan_posts_list_modal.select_post")}
      open={isModalOpen}
      onOk={() => setIsModalOpen(false)}
      onCancel={() => setIsModalOpen(false)}
      onClose={() => setIsModalOpen(false)}
      width={600}
      bodyStyle={{
        maxHeight: "70vh",
        overflowY: "auto",
      }}
      footer={[
        <Button
          key="schedule"
          type="default"
          onClick={() => {
            activeTabKey === "1" &&
              createdCustomPost &&
              handleSelectNewPost(createdCustomPost);
            activeTabKey === "2" &&
              generatedPost &&
              handleSelectNewPost(generatedPost);
            activeTabKey === "3" &&
              selectCurrentPost &&
              handleSelectNewPost(selectCurrentPost);
            setIsModalOpen(false);
          }}
          style={{
            borderRadius: "16px",
            width: "100%",
          }}
          disabled={
            (activeTabKey === "1" && !createdCustomPost) ||
            (activeTabKey === "2" && !generatedPost) ||
            (activeTabKey === "3" && !selectCurrentPost)
          }
        >
          {t("contentPlanPage.content_plan_posts_list_modal.select")}
        </Button>,
      ]}
    >
      <Divider />
      <Tabs
        defaultActiveKey="2"
        onChange={handleTabChange}
        centered={!isMobile}
        items={items}
        style={{ overflowX: isMobile ? "auto" : "unset", whiteSpace: "nowrap" }}
      />

      <Divider />
    </Modal>
  );
};
