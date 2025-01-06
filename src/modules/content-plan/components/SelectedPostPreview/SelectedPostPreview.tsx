import React from "react";
import { Layout, Typography, Image, Carousel, Button } from "antd";
import { HeartTwoTone } from "@ant-design/icons";
import cn from "classnames";
import styles from "./SelectedPostPreview.module.scss";
import { useTypedSelector } from "hooks/useTypedSelector";
import avatar from "assets/avatar.png";
import { useTranslation } from "react-i18next";
import { TPostData } from "modules/post/redux/api";
import { TReelData } from "modules/reel/redux/api";
import { TStoriesData } from "modules/stories/redux/api";

type TProps = {
  selectedPost: TPostData | TReelData | TStoriesData | undefined;
  handleShowContentPlanDeletePostModal?: () => void;
  handleShowContentPlanEditPostModal?: () => void;
};

const { Content } = Layout;
const { Title, Text } = Typography;

export const SelectedPostPreview = ({
  selectedPost,
  handleShowContentPlanDeletePostModal,
  handleShowContentPlanEditPostModal,
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
          arrows={selectedPost.media.length === 1 ? false : true}
          dots={selectedPost.media.length === 1 ? false : true}
          className={"mediaSlider"}
        >
          {selectedPost.media.map((mediaItem, index) => {
            if (typeof mediaItem.media !== "string") {
              return null;
            }

            const isVideo =
              mediaItem.media.endsWith(".mp4") ||
              mediaItem.media.endsWith(".webm");

            return (
              <div key={index} className="mediaItem">
                {isVideo ? (
                  <video className="media" controls src={mediaItem.media} />
                ) : (
                  <Image
                    src={mediaItem.media}
                    className="media"
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
    <Layout>
      <Content>
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

            <div className={styles.postLike}>
              <HeartTwoTone
                height={24}
                width={24}
                className={cn(
                  styles.iconHeart,
                  selectedPost && "like" in selectedPost && selectedPost.like
                    ? styles.iconHeart__active
                    : ""
                )}
              />
              <Text>
                {t("contentPlanPage.selected_post_preview.add_to_favorites")}
              </Text>
            </div>
          </div>
          <div className={styles.buttons}>
            <Button onClick={handleShowContentPlanEditPostModal} block>
              {t("contentPlanPage.selected_post_preview.edit_post")}
            </Button>

            <Button danger onClick={handleShowContentPlanDeletePostModal} block>
              {t("contentPlanPage.selected_post_preview.delete_post")}
            </Button>
          </div>
        </div>
      </Content>
    </Layout>
  );
};
