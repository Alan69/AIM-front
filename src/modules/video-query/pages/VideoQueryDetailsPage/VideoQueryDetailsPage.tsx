import React, { ReactNode, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  useCreateVideoQueryReplayMutation,
  useGetVideoQueriesByIdQuery,
} from "../../redux/api";

import { Layout, Table, TableProps, Typography, Button, message } from "antd";
import { EditOutlined, DeleteOutlined, HeartTwoTone } from "@ant-design/icons";
import styles from "./VideoQueryDetailsPage.module.scss";
import cn from "classnames";
import { TVideoData, useGetVideoListQuery } from "modules/video/redux/api";
import { useIsMobile } from "hooks/media";
import { useTranslation } from "react-i18next";

interface DataType {
  key: string;
  video_name: string;
  video_like: ReactNode;
  time_create?: string;
  video_actions?: ReactNode;
}

const { Title, Text } = Typography;
const { Content } = Layout;

export const VideoQueryDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isMobile = useIsMobile();

  const { id } = useParams<{ id: string }>();

  const {
    data: videoQuery,
    isLoading,
    refetch,
  } = useGetVideoQueriesByIdQuery(id || "");
  const { data: videos, refetch: refetchVideoList } = useGetVideoListQuery(
    videoQuery?.id || ""
  );
  const [createVideoQueryReplay, { isLoading: isVideoRecreating }] =
    useCreateVideoQueryReplayMutation();

  const columns: TableProps<DataType>["columns"] = [
    {
      title: t("videoQueryDetailsPage.table.title"),
      dataIndex: "video_name",
      key: "video_name",
      render: (text, record) => (
        <Link to={`/video/${id}/${record.key}`}>{text}</Link>
      ),
      fixed: "left",
      width: isMobile ? 180 : "auto",
    },
    {
      title: t("videoQueryDetailsPage.table.favorite"),
      dataIndex: "video_like",
      key: "video_like",
    },
    {
      title: t("videoQueryDetailsPage.table.created_date"),
      dataIndex: "time_create",
      key: "time_create",
      render: (text, record) => (
        <Link to={`/video/${id}/${record.key}`}>{text}</Link>
      ),
    },
    {
      title: t("videoQueryDetailsPage.table.actions"),
      dataIndex: "video_actions",
      key: "video_actions",
    },
  ];

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) {
      return t("videoQueryDetailsPage.errors.invalid_date");
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return t("videoQueryDetailsPage.errors.invalid_date");
    }

    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const data: DataType[] =
    videos?.map((video: TVideoData) => ({
      key: video.id.toString(),
      video_name: video.title,
      video_like: (
        <HeartTwoTone
          height={24}
          width={24}
          className={cn(
            styles.iconHeart,
            video?.like ? styles.iconHeart__active : ""
          )}
        />
      ),
      time_create: formatDate(video.time_create),
      video_actions: (
        <div className={styles.videoQueryDescr__icons}>
          <Link to={`/video/${videoQuery?.id}/${video?.id}/update`}>
            <EditOutlined />
          </Link>
          <Link to={`/video/${videoQuery?.id}/${video?.id}/delete`}>
            <DeleteOutlined />
          </Link>
        </div>
      ),
    })) || [];

  const handleCreateVideoQueryReplay = () => {
    const updatedData = {
      id: videoQuery?.id || "",
      company: videoQuery?.company?.id || "",
      product: videoQuery?.product?.id || "",
      content: videoQuery?.content || "",
      post_type: videoQuery?.post_type?.id || "",
      text_style: videoQuery?.text_style?.id || "",
      lang: videoQuery?.lang?.id || "",
    };
    createVideoQueryReplay(updatedData)
      .unwrap()
      .then((response) => {
        navigate(`/video/${response.id}`);
      })
      .catch((error) => {
        message.error(error.data.error);
      });
  };

  useEffect(() => {
    refetch();
    refetchVideoList();
  }, [refetch, refetchVideoList, location.pathname]);

  if (isLoading) return <div>{t("common.loading")}</div>;

  return (
    <Layout>
      <Content className="page-layout">
        <h1 className="main-title">
          {videoQuery?.company?.name || "-"} - {videoQuery?.product?.name || "-"}
        </h1>
        <Layout>
          <Content>
            <div className={styles.videoQueryDescr}>
              <div className={styles.videoQueryDescr__title}>
                <Title level={4}>
                  {t("videoQueryDetailsPage.fields.video_type")}:
                  {videoQuery?.post_type?.name}
                </Title>
              </div>
              <div className={styles.videoQueryDescr__title}>
                <Title level={4}>
                  {t("videoQueryDetailsPage.fields.text_style")}:
                  {videoQuery?.text_style?.name}
                </Title>
              </div>
              <div className={styles.videoQueryDescr__title}>
                <Title level={4}>
                  {t("videoQueryDetailsPage.fields.lang")}:
                  {videoQuery?.lang?.name}
                </Title>
              </div>
              <div className={styles.videoQueryDescr__title}>
                <Title level={4}>
                  {t("videoQueryDetailsPage.fields.content")}:
                  {videoQuery?.content}
                </Title>
              </div>
              <Button
                type="primary"
                disabled={isLoading}
                loading={isVideoRecreating}
                onClick={handleCreateVideoQueryReplay}
              >
                {t("videoQueryDetailsPage.buttons.recreate_request")}
              </Button>
            </div>
          </Content>
        </Layout>
        <Layout>
          <h2 className={styles.product__title}>
            {t("videoQueryDetailsPage.videos_title")}
          </h2>
          <Content>
            <div className={styles.videoQueryDescr}>
              {!videos?.length ? (
                <div style={{ paddingBottom: "12px" }}>
                  <Text>{t("videoQueryDetailsPage.errors.no_videos")}</Text>
                </div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={data}
                  pagination={false}
                  scroll={{ x: "max-content" }}
                />
              )}
            </div>
          </Content>
        </Layout>
      </Content>
    </Layout>
  );
}; 