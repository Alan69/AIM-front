import React from "react";
import { Modal, Button, Divider } from "antd";

import "moment/locale/ru";
import { TPostData } from "modules/post/redux/api";
import { useTypedSelector } from "hooks/useTypedSelector";
import { useTranslation } from "react-i18next";
import { ReelsCreateForm } from "../ReelsCreateForm/ReelsCreateForm";
import { TCreateReelRequest, TReelData } from "modules/reel/redux/api";

type TProps = {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleSelectNewPost: (post?: TPostData, reel?: TReelData) => void;
  isCustomReelCreating: boolean;
  reel: TReelData | undefined;
  handleCreateCustomReel: (updatedData: TCreateReelRequest) => void;
};

export const ContentPlanReelsModal = ({
  isModalOpen,
  setIsModalOpen,
  handleSelectNewPost,
  isCustomReelCreating,
  reel,
  handleCreateCustomReel,
}: TProps) => {
  const { t } = useTranslation();

  const { createdCustomReel } = useTypedSelector((state) => state.reel);

  return (
    <Modal
      title={t("contentPlanPage.content_plan_reels_modal.select_reel")}
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
            createdCustomReel &&
              handleSelectNewPost(undefined, createdCustomReel);
            setIsModalOpen(false);
          }}
          style={{
            borderRadius: "16px",
            width: "100%",
          }}
          disabled={createdCustomReel === null}
        >
          {t("contentPlanPage.content_plan_reels_modal.select")}
        </Button>,
      ]}
    >
      <Divider />

      <ReelsCreateForm
        reel={reel}
        isCustomReelCreating={isCustomReelCreating}
        handleCreateCustomReel={handleCreateCustomReel}
      />

      <Divider />
    </Modal>
  );
};
