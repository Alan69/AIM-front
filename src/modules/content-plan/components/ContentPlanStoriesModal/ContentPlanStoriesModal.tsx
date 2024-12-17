import React from "react";
import { Modal, Button, Divider } from "antd";

import "moment/locale/ru";
import { TPostData } from "modules/post/redux/api";
import { useTypedSelector } from "hooks/useTypedSelector";
import { useTranslation } from "react-i18next";
import { TReelData } from "modules/reel/redux/api";
import { TCreateStoriesRequest, TStoriesData } from "modules/stories/redux/api";
import { StoriesCreateForm } from "../StoriesCreateForm/StoriesCreateForm";

type TProps = {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleSelectNewPost: (
    post?: TPostData,
    reel?: TReelData,
    storie?: TStoriesData
  ) => void;
  isCustomStoriesCreating: boolean;
  storie: TStoriesData | undefined;
  handleCreateCustomStories: (updatedData: TCreateStoriesRequest) => void;
};

export const ContentPlanStoriesModal = ({
  isModalOpen,
  setIsModalOpen,
  handleSelectNewPost,
  isCustomStoriesCreating,
  storie,
  handleCreateCustomStories,
}: TProps) => {
  const { t } = useTranslation();

  const { createdCustomStories } = useTypedSelector((state) => state.storie);

  return (
    <Modal
      title={t("content_plan.content_plan_stories_modal.select_stories")}
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
            createdCustomStories &&
              handleSelectNewPost(undefined, undefined, createdCustomStories);
            setIsModalOpen(false);
          }}
          style={{
            borderRadius: "16px",
            width: "100%",
          }}
          disabled={createdCustomStories === null}
        >
          {t("content_plan.content_plan_stories_modal.select")}
        </Button>,
      ]}
    >
      <Divider />

      <StoriesCreateForm
        storie={storie}
        isCustomStoriesCreating={isCustomStoriesCreating}
        handleCreateCustomStories={handleCreateCustomStories}
      />

      <Divider />
    </Modal>
  );
};
