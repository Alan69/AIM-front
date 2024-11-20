import React from "react";
import { TPostSerializer } from "modules/content-plan/types";
import { Layout, Typography, Image, Collapse } from "antd";
import { HeartTwoTone } from "@ant-design/icons";
import cn from "classnames";
import styles from "./SelectedPostPreview.module.scss";
import { useTypedSelector } from "hooks/useTypedSelector";
import avatar from "assets/avatar.png";
import { useTranslation } from "react-i18next";

type TProps = {
  selectedPost: TPostSerializer | null | undefined;
};

const { Content } = Layout;
const { Title, Text } = Typography;
const { Panel } = Collapse;

export const SelectedPostPreview = ({ selectedPost }: TProps) => {
  const { t } = useTranslation();
  const { user } = useTypedSelector((state) => state.auth);
  const profileImage = user?.profile.picture
    ? `${user.profile.picture}`
    : avatar;

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
              <div className={styles.pictureBlock}>
                <Image
                  // width={200}
                  src={selectedPost?.picture}
                  className={styles.picture}
                  alt={t("content_plan.selected_post_preview.image_alt")}
                />
              </div>

              {/* <Collapse className={styles.postDescription}>
                    <Panel header="Описание" key="1">
                      <Text>{selectedPost?.img_prompt}</Text>
                    </Panel>
                  </Collapse> */}
            </div>

            <div className={styles.postContent}>
              <Title level={3}>{selectedPost?.title}</Title>
              <Text>{selectedPost?.main_text}</Text>

              <div className={styles.postHashtags}>
                <Text>{selectedPost?.hashtags}</Text>
              </div>
            </div>

            <div className={styles.postLike}>
              <HeartTwoTone
                height={24}
                width={24}
                className={cn(
                  styles.iconHeart,
                  selectedPost?.like ? styles.iconHeart__active : ""
                )}
              />
              <Text>
                {t("content_plan.selected_post_preview.add_to_favorites")}
              </Text>{" "}
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
};
