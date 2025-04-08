import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDeleteVideoMediaMutation, useGetVideoByIdQuery } from "../../redux/api";
import { Layout, Button, message } from "antd";
import styles from "./VideoDeletePage.module.scss";
import Title from "antd/es/typography/Title";
import { useGetCompanyListQuery } from "modules/company/redux/api";
import { useTypedSelector } from "hooks/useTypedSelector";
import { useTranslation } from "react-i18next";

const { Content } = Layout;

export const VideoDeletePage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useTypedSelector((state) => state.auth);

  const { data: video } = useGetVideoByIdQuery(id || "");
  const [deleteVideoMedia, { isLoading: isUpdating }] = useDeleteVideoMediaMutation();
  const { refetch: refetchCompanyList } = useGetCompanyListQuery(
    user?.profile.id
  );

  const handleDeleteVideo = () => {
    if (video) {
      deleteVideoMedia(video?.id)
        .unwrap()
        .then((response) => {
          navigate(`/video-query/${video?.video_query}`);
          refetchCompanyList()
            .unwrap()
            .then(() => {
              message.success(t("videoDeletePage.success"));
            });
        });
    }
  };

  return (
    <Layout>
      <Content className="page-layout">
        <h1 className="main-title">{t("videoDeletePage.title")}</h1>
        <Layout>
          <Content>
            <div className={styles.companyDescr}>
              <Title level={4}>
                {t("videoDeletePage.confirmation_text", {
                  videoTitle: video?.title,
                })}
              </Title>
              <div className={styles.buttons}>
                <Button
                  type="primary"
                  danger
                  loading={isUpdating}
                  onClick={handleDeleteVideo}
                >
                  {t("videoDeletePage.buttons.delete")}
                </Button>
                <Button
                  type="default"
                  onClick={() => {
                    navigate(`/video-query/${video?.video_query}`);
                  }}
                  loading={isUpdating}
                >
                  {t("videoDeletePage.buttons.cancel")}
                </Button>
              </div>
            </div>
          </Content>
        </Layout>
      </Content>
    </Layout>
  );
};
