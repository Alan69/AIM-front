import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDeletePostMutation, useGetPostByIdQuery } from "../../redux/api";
import { Layout, Button, message } from "antd";
import styles from "./PostDeletePage.module.scss";
import Title from "antd/es/typography/Title";
import { useGetCompanyListQuery } from "modules/company/redux/api";
import { useTypedSelector } from "hooks/useTypedSelector";
import { useTranslation } from "react-i18next";

const { Content } = Layout;

export const PostDeletePage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useTypedSelector((state) => state.auth);

  const { data: post } = useGetPostByIdQuery(id || "");
  const [deletePost, { isLoading: isUpdating }] = useDeletePostMutation();
  const { refetch: refetchCompanyList } = useGetCompanyListQuery(
    user?.profile.id
  );

  const handleDeletePost = () => {
    if (post) {
      deletePost(post?.id)
        .unwrap()
        .then((response) => {
          navigate(`/post-query/${post?.post_query}`);
          refetchCompanyList()
            .unwrap()
            .then(() => {
              message.success(t("post_delete.success"));
            });
        });
    }
  };

  return (
    <Layout>
      <Content className="page-layout">
        <h1 className="main-title">{t("post_delete.title")}</h1>
        <Layout>
          <Content>
            <div className={styles.companyDescr}>
              <Title level={4}>
                {t("post_delete.confirmation_text", { postTitle: post?.title })}
              </Title>
              <div className={styles.buttons}>
                <Button
                  type="primary"
                  danger
                  loading={isUpdating}
                  onClick={handleDeletePost}
                >
                  {t("post_delete.buttons.delete")}
                </Button>
                <Button
                  type="default"
                  onClick={() => {
                    navigate(`/post-query/${post?.post_query}`);
                  }}
                  loading={isUpdating}
                >
                  {t("post_delete.buttons.cancel")}
                </Button>
              </div>
            </div>
          </Content>
        </Layout>
      </Content>
    </Layout>
  );
};
