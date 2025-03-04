import React, { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { Layout, Typography, List, Button, message, Tooltip } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import styles from "./ArticleQueriesDetailsPage.module.scss";
import {
  useCreateArticleQueriesReplayMutation,
  useGetArticleQueriesByIdQuery,
} from "modules/article-queries/redux/api";
import { useGetArticlesListQuery } from "modules/articles/redux/api";
import { useTranslation } from "react-i18next";
import moment from "moment";

const { Title, Text } = Typography;
const { Content } = Layout;

export const ArticleQueriesDetailsPage = () => {
  const { t } = useTranslation();

  const location = useLocation();
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();

  const {
    data: articleQuery,
    isLoading,
  } = useGetArticleQueriesByIdQuery(id || "", {
    refetchOnMountOrArgChange: true
  });
  const { data: articles } = useGetArticlesListQuery(
    articleQuery?.id || "", 
    { 
      skip: !articleQuery?.id,
      refetchOnMountOrArgChange: true
    }
  );
  const [
    createArticleQueriesReplay,
    { isLoading: isArticleQueriesRecreating },
  ] = useCreateArticleQueriesReplayMutation();

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success(t("articleQueriesDetailsPage.actions.copied_message"));
  };

  const handleCreateArticleQueriesReplay = () => {
    if (!articleQuery || !articleQuery.id) {
      message.error("Invalid article query");
      return;
    }
    
    try {
      const updatedData = {
        id: articleQuery.id,
        text: articleQuery.text || "",
        company: articleQuery.company?.id || "",
        product: articleQuery.product?.id || "",
        type: articleQuery.type?.id || "",
        style: articleQuery.style?.id || "",
        word_length: articleQuery.word_length?.id || "",
        language: articleQuery.language?.id || "",
      };

      createArticleQueriesReplay(updatedData)
        .unwrap()
        .then((response) => {
          if (response && response.id) {
            navigate(`/article-queries/${response.id}`);
            message.success("Article generation started successfully");
          } else {
            message.error("Failed to generate article: Invalid response");
          }
        })
        .catch((error) => {
          console.error("Article generation error:", error);
          message.error(error.data?.error || "Failed to generate article");
        });
    } catch (error) {
      console.error("Article generation error:", error);
      message.error("Failed to generate article: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  useEffect(() => {
    // No need to manually refetch
    // The queries will automatically refetch when needed
  }, [location.pathname]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <Layout>
      <Content className="page-layout">
        <h1 className="main-title">
          {t("articleQueriesDetailsPage.title")}
        </h1>
        <Layout>
          <Content>
            <div className={styles.postQueryDescr}>
              <div className={styles.postQueryDescr__title}>
                <Title level={4}>
                  {t("articleQueriesDetailsPage.details_section.company")}: {articleQuery?.company?.name}
                </Title>
              </div>
              <div className={styles.postQueryDescr__title}>
                <Title level={4}>
                  {t("articleQueriesDetailsPage.details_section.product")}: {articleQuery?.product?.name}
                </Title>
              </div>
              <div className={styles.postQueryDescr__title}>
                <Title level={4}>
                  {t("articleQueriesDetailsPage.details_section.article_type")}: {articleQuery?.type?.name}
                </Title>
              </div>
              <div className={styles.postQueryDescr__title}>
                <Title level={4}>
                  {t("articleQueriesDetailsPage.details_section.article_style")}: {articleQuery?.style?.name}
                </Title>
              </div>
              <div className={styles.postQueryDescr__title}>
                <Title level={4}>
                  {t("articleQueriesDetailsPage.details_section.word_length")}: {articleQuery?.word_length?.name}
                </Title>
              </div>
              <div className={styles.postQueryDescr__title}>
                <Title level={4}>
                  {t("articleQueriesDetailsPage.details_section.language")}: {articleQuery?.language?.name}
                </Title>
              </div>
              <div className={styles.postQueryDescr__title}>
                <Title level={4}>
                  {t("articleQueriesDetailsPage.details_section.text")}: {articleQuery?.text}
                </Title>
              </div>
              <div className={styles.postQueryDescr__title}>
                <Title level={4}>
                  {t("articleQueriesDetailsPage.details_section.created_at")}: {articleQuery?.created_at
                    ? moment(articleQuery.created_at).format("LLL")
                    : ""}
                </Title>
              </div>
              <Button
                type="primary"
                disabled={isLoading}
                loading={isArticleQueriesRecreating}
                onClick={handleCreateArticleQueriesReplay}
              >
                {t("articleQueriesDetailsPage.actions.replay_button")}
              </Button>
            </div>
          </Content>
        </Layout>
        <Layout>
          <h2 className={styles.product__title}>
            {t("articleQueriesDetailsPage.articles_section.title")}
          </h2>
          <Content>
            <div className={styles.postQueryDescr}>
              {!articles?.length ? (
                <div style={{ paddingBottom: "12px" }}>
                  <Text>
                    {t(
                      "articleQueriesDetailsPage.articles_section.not_found"
                    )}
                  </Text>
                </div>
              ) : (
                <List
                  itemLayout="vertical"
                  dataSource={articles}
                  renderItem={(article) => (
                    <List.Item
                      key={article.id}
                      className={styles.articleItem}
                      extra={
                        <Tooltip
                          title={t("articleQueriesDetailsPage.actions.copy_button")}
                        >
                          <Button
                            icon={<CopyOutlined />}
                            onClick={() =>
                              handleCopyToClipboard(
                                `${article.title}\n\n${article.text}`
                              )
                            }
                          />
                        </Tooltip>
                      }
                    >
                      <List.Item.Meta
                        title={
                          <div className={styles.titleBlock}>
                            <Title level={3}>{article.title}</Title>
                          </div>
                        }
                        description={null}
                      />
                      <div className={styles.articleText}>
                        {article.text.split("\n").map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </div>
          </Content>
        </Layout>
      </Content>
    </Layout>
  );
}; 