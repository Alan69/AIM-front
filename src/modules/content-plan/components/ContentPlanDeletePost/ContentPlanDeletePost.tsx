import React from "react";
import { Modal, Button, Divider, Typography, Image, Carousel } from "antd";
import { useTranslation } from "react-i18next";
import { TPostData } from "modules/post/redux/api";
import { TReelData } from "modules/reel/redux/api";
import { TStoriesData } from "modules/stories/redux/api";
import styles from "./ContentPlanDeletePost.module.scss";
import "../../../../Custom-slider.scss";
import { useTypedSelector } from "hooks/useTypedSelector";
import avatar from "assets/avatar.png";

const { Title, Text } = Typography;

type TProps = {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleDeleteFromScheduler: (scheduler_id: string) => void;
  selectedPost: TPostData | TReelData | TStoriesData | null | undefined;
};

export const ContentPlanDeletePost = ({
  isModalOpen,
  setIsModalOpen,
  handleDeleteFromScheduler,
  selectedPost,
}: TProps) => {
  const { t } = useTranslation();
  const { user } = useTypedSelector((state) => state.auth);
  const profileImage = user?.profile.picture
    ? `${user.profile.picture}`
    : avatar;

  const renderMediaSlider = () => {
    if (
      selectedPost &&
      "media" in selectedPost &&
      selectedPost.media &&
      Array.isArray(selectedPost.media)
    ) {
      return (
        <Carousel
          arrows={selectedPost.media.length > 1}
          dots={selectedPost.media.length > 1}
          className="mediaSlider"
        >
          {selectedPost.media.map((mediaItem, index) => {
            if (typeof mediaItem.media !== "string") {
              return null;
            }

            const isVideo =
              mediaItem.media.endsWith(".mp4") ||
              mediaItem.media.endsWith(".webm");

            return (
              <div key={index} className={styles.mediaItem}>
                {isVideo ? (
                  <video className="" controls src={mediaItem.media} />
                ) : (
                  <Image
                    src={mediaItem.media}
                    className=""
                    alt={t("contentPlanPage.selected_post_preview.image_alt")}
                  />
                )}
              </div>
            );
          })}
        </Carousel>
      );
    }
    return null;
  };

  return (
    <Modal
      title={
        t("contentPlanPage.content_plan_delete_post_modal.delete") +
        ` "${
          selectedPost && "title" in selectedPost
            ? selectedPost.title
            : undefined
        }" ` +
        t("contentPlanPage.content_plan_delete_post_modal.from")
      }
      open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      footer={[
        <Button
          key="cancel"
          onClick={() => setIsModalOpen(false)}
          style={{ borderRadius: "16px" }}
        >
          {t("contentPlanPage.content_plan_delete_post_modal.cancel")}
        </Button>,
        <Button
          key="delete"
          type="primary"
          danger
          onClick={() => {
            if (selectedPost?.id) handleDeleteFromScheduler(selectedPost.id);
            setIsModalOpen(false);
          }}
          style={{ borderRadius: "16px" }}
        >
          {t("contentPlanPage.content_plan_delete_post_modal.confirm")}
        </Button>,
      ]}
      width={600}
      bodyStyle={{
        maxHeight: "70vh",
        overflowY: "auto",
      }}
    >
      <Divider />

      <div className={styles.postDescr}>
        <div className={styles.container}>
          <div className={styles.postHeader}>
            <div className={styles.userInfo}>
              <img
                src={profileImage}
                alt={user ? user.profile.user.first_name : "-"}
                className={styles.avatar}
              />
              <div className={styles.details}>
                <div className={styles.name}>
                  {user ? user.profile.user.first_name : "-"}
                </div>
              </div>
            </div>

            <div className={styles.pictureBlock}>{renderMediaSlider()}</div>
          </div>

          <div className={styles.postContent}>
            <Title level={3}>
              {selectedPost && "title" in selectedPost
                ? selectedPost.title
                : undefined}
            </Title>
            <Text>
              {selectedPost && "main_text" in selectedPost
                ? selectedPost.main_text
                : undefined}
            </Text>

            <div className={styles.postHashtags}>
              <Text>
                {selectedPost && "hashtags" in selectedPost
                  ? selectedPost.hashtags
                  : undefined}
              </Text>
            </div>
          </div>

          <Divider />
        </div>
      </div>
    </Modal>
  );
};
