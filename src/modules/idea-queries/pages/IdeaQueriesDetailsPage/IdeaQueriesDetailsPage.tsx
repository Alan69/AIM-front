import React, { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useGetIdeaQueriesByIdQuery } from "../../redux/api";

import { Layout, Typography, List, Button, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";

import styles from "./IdeaQueriesDetailsPage.module.scss";
import { useGetIdeasListQuery } from "modules/ideas/redux/api";

const { Title, Text } = Typography;
const { Content } = Layout;

export const IdeaQueriesDetailsPage = () => {
  const location = useLocation();

  const { id } = useParams<{ id: string }>();

  const {
    data: ideaQuery,
    isLoading,
    refetch,
  } = useGetIdeaQueriesByIdQuery(id || "");
  const { data: ideas, refetch: refetchIdeasList } = useGetIdeasListQuery(
    ideaQuery?.id || ""
  );

  const data =
    ideas?.flatMap((idea) =>
      idea.idea_text.map((idea_text_item) => ({
        key: idea.id,
        Idea: idea_text_item.Idea,
        Description: idea_text_item.Description,
      }))
    ) || [];

  useEffect(() => {
    refetch();
    refetchIdeasList();
  }, [refetch, refetchIdeasList, location.pathname]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <Layout>
      <Content className="page-layout">
        <h1 className="main-title">
          {(ideaQuery?.company?.name ? ideaQuery?.company?.name : "-") +
            " - " +
            (ideaQuery?.product?.name ? ideaQuery?.product?.name : "-")}
        </h1>
        <Layout>
          <Content>
            <div className={styles.postQueryDescr}>
              <div className={styles.postQueryDescr__title}>
                <Title level={4}>
                  Тип контента: {ideaQuery?.content_type?.name}
                </Title>
              </div>
              <div className={styles.postQueryDescr__title}>
                <Title level={4}>Тематика: {ideaQuery?.theme?.name}</Title>
              </div>
              <div className={styles.postQueryDescr__title}>
                <Title level={4}>Язык: {ideaQuery?.language?.name}</Title>
              </div>
              <div className={styles.postQueryDescr__title}>
                <Title level={4}>Описание: {ideaQuery?.description}</Title>
              </div>
            </div>
          </Content>
        </Layout>
        <Layout>
          <h2 className={styles.product__title}>Идеи:</h2>
          <Content>
            <div className={styles.postQueryDescr}>
              {!ideas?.length ? (
                <div style={{ paddingBottom: "12px" }}>
                  <Text>Идеи не найдены. Добавьте идеи.</Text>
                </div>
              ) : (
                <List
                  itemLayout="vertical"
                  dataSource={data}
                  renderItem={(item) => (
                    <List.Item key={item.key}>
                      <List.Item.Meta
                        title={
                          <div className={styles.titleBlock}>
                            <Title level={4}>{item.Idea}</Title>
                            <Button
                              className={styles.postContent__icon}
                              icon={<CopyOutlined />}
                              onClick={() => {
                                if (item.Idea) {
                                  navigator.clipboard.writeText(item.Idea).then(
                                    () => {
                                      message.success(
                                        "Заголовок скопирован в буфер обмена!"
                                      );
                                    },
                                    (err) => {
                                      message.error(
                                        "Ошибка при копировании заголовка."
                                      );
                                    }
                                  );
                                }
                              }}
                            />
                          </div>
                        }
                        description={<Text>{item.Description}</Text>}
                      />
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
