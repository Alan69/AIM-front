import React, { ReactNode, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  useCreatePostQueryReplayMutation,
  useGetPostQueriesByIdQuery,
} from "../../redux/api";

import { Layout, Table, TableProps, Typography, Button, message } from "antd";
import { EditOutlined, DeleteOutlined, HeartTwoTone } from "@ant-design/icons";
import styles from "./PostQueryDetailsPage.module.scss";
import cn from "classnames";
import { TPostData, useGetPostListQuery } from "modules/post/redux/api";
import { useIsMobile } from "hooks/media";
import { useTranslation } from "react-i18next";

interface DataType {
  key: string;
  post_name: string;
  post_like: ReactNode;
  time_create?: string;
  post_actions?: ReactNode;
}

const { Title, Text } = Typography;
const { Content } = Layout;

export const PostQueryDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isMobile = useIsMobile();

  const { id } = useParams<{ id: string }>();

  const {
    data: postQuery,
    isLoading,
    refetch,
  } = useGetPostQueriesByIdQuery(id || "");
  const { data: posts, refetch: refetchPostList } = useGetPostListQuery(
    postQuery?.id || ""
  );
  const [createPostQueryReplay, { isLoading: isPostRecreating }] =
    useCreatePostQueryReplayMutation();

  const columns: TableProps<DataType>["columns"] = [
    {
      title: t("postQueryDetailsPage.table.title"),
      dataIndex: "post_name",
      key: "post_name",
      render: (text, record) => (
        <Link to={`/post/${id}/${record.key}`}>{text}</Link>
      ),
      fixed: "left",
      width: isMobile ? 180 : "auto",
    },
    {
      title: t("postQueryDetailsPage.table.favorite"),
      dataIndex: "post_like",
      key: "post_like",
    },
    {
      title: t("postQueryDetailsPage.table.created_date"),
      dataIndex: "time_create",
      key: "time_create",
      render: (text, record) => (
        <Link to={`/post/${id}/${record.key}`}>{text}</Link>
      ),
    },
    {
      title: t("postQueryDetailsPage.table.actions"),
      dataIndex: "post_actions",
      key: "post_actions",
    },
  ];

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) {
      return t("postQueryDetailsPage.errors.invalid_date");
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return t("postQueryDetailsPage.errors.invalid_date");
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
    posts?.map((post: TPostData) => ({
      key: post.id.toString(),
      post_name: post.title,
      post_like: (
        <HeartTwoTone
          height={24}
          width={24}
          className={cn(
            styles.iconHeart,
            post?.like ? styles.iconHeart__active : ""
          )}
        />
      ),
      time_create: formatDate(post.time_create),
      post_actions: (
        <div className={styles.postQueryDescr__icons}>
          <Link to={`/post/${postQuery?.id}/${post?.id}/update`}>
            <EditOutlined />
          </Link>
          <Link to={`/post/${postQuery?.id}/${post?.id}/delete`}>
            <DeleteOutlined />
          </Link>
        </div>
      ),
    })) || [];

  const handleCreatePostQueryReplay = () => {
    const updatedData = {
      id: postQuery?.id || "",
      company: postQuery?.company?.id || "",
      product: postQuery?.product?.id || "",
      content: postQuery?.content || "",
      post_type: postQuery?.post_type?.id || "",
      text_style: postQuery?.text_style?.id || "",
      lang: postQuery?.lang?.id || "",
    };
    createPostQueryReplay(updatedData)
      .unwrap()
      .then((response) => {
        navigate(`/post/${response.id}`);
      })
      .catch((error) => {
        message.error(error.data.error);
      });
  };

  useEffect(() => {
    refetch();
    refetchPostList();
  }, [refetch, refetchPostList, location.pathname]);

  if (isLoading) return <div>{t("common.loading")}</div>;

  return (
    <Layout>
      <Content className="page-layout">
        <h1 className="main-title">
          {postQuery?.company?.name || "-"} - {postQuery?.product?.name || "-"}
        </h1>
        <Layout>
          <Content>
            <div className={styles.postQueryDescr}>
              <div className={styles.postQueryDescr__title}>
                <Title level={4}>
                  {t("postQueryDetailsPage.fields.post_type")}:
                  {postQuery?.post_type?.name}
                </Title>
              </div>
              <div className={styles.postQueryDescr__title}>
                <Title level={4}>
                  {t("postQueryDetailsPage.fields.text_style")}:
                  {postQuery?.text_style?.name}
                </Title>
              </div>
              <div className={styles.postQueryDescr__title}>
                <Title level={4}>
                  {t("postQueryDetailsPage.fields.lang")}:
                  {postQuery?.lang?.name}
                </Title>
              </div>
              <div className={styles.postQueryDescr__title}>
                <Title level={4}>
                  {t("postQueryDetailsPage.fields.content")}:
                  {postQuery?.content}
                </Title>
              </div>
              <Button
                type="primary"
                disabled={isLoading}
                loading={isPostRecreating}
                onClick={handleCreatePostQueryReplay}
              >
                {t("postQueryDetailsPage.buttons.recreate_request")}
              </Button>
            </div>
          </Content>
        </Layout>
        <Layout>
          <h2 className={styles.product__title}>
            {t("postQueryDetailsPage.posts_title")}
          </h2>
          <Content>
            <div className={styles.postQueryDescr}>
              {!posts?.length ? (
                <div style={{ paddingBottom: "12px" }}>
                  <Text>{t("postQueryDetailsPage.errors.no_posts")}</Text>
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
