import React, { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  useCreateIdeaQueriesReplayMutation,
  useGetIdeaQueriesByIdQuery,
} from "../../redux/api";

import { Layout, Typography, List, Button, message, Tooltip } from "antd";
import { CopyOutlined } from "@ant-design/icons";

import styles from "./IdeaQueriesDetailsPage.module.scss";
import { useGetIdeasListQuery } from "modules/ideas/redux/api";

const { Title, Text } = Typography;
const { Content } = Layout;

export const IdeaQueriesDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();

  const {
    data: ideaQuery,
    isLoading,
    refetch,
  } = useGetIdeaQueriesByIdQuery(id || "");
  const { data: ideas, refetch: refetchIdeasList } = useGetIdeasListQuery(
    ideaQuery?.id || ""
  );
  const [createIdeaQueriesReplay, { isLoading: isIdeaQueriesRecreating }] =
    useCreateIdeaQueriesReplayMutation();

  const data =
    ideas?.flatMap((idea) =>
      idea.idea_text.map((idea_text_item) => ({
        key: idea.id,
        Idea: idea_text_item.Idea,
        Description: idea_text_item.Description,
      }))
    ) || [];

  const handleCreateIdeaQueriesReplay = () => {
    const updatedData = {
      id: ideaQuery?.id || "",
      company: ideaQuery?.company?.id || "",
      product: ideaQuery?.product?.id || "",
      target_audience: ideaQuery?.target_audience || "",
      content_type: ideaQuery?.content_type || "",
      theme: ideaQuery?.theme?.id || "",
      language: ideaQuery?.language?.id || "",
      description: ideaQuery?.description || "",
    };

    // @ts-ignore
    createIdeaQueriesReplay(updatedData)
      .unwrap()
      .then((response) => {
        navigate(`/idea-queries/${response.id}`);
        refetch();
        refetchIdeasList();
      })
      .catch((error) => {
        message.error(error.data.error);
      });
  };

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
              <Button
                type="primary"
                disabled={isLoading}
                loading={isIdeaQueriesRecreating}
                onClick={handleCreateIdeaQueriesReplay}
              >
                Повторить запрос
              </Button>
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
                            <Tooltip title="Скопировать">
                              <Button
                                className={styles.postContent__icon}
                                icon={<CopyOutlined />}
                                onClick={() => {
                                  if (item.Idea && item.Description) {
                                    const textToCopy = `${item.Idea}\n\n${item.Description}`;
                                    navigator.clipboard
                                      .writeText(textToCopy)
                                      .then(
                                        () => {
                                          message.success(
                                            "Заголовок и описание скопированы в буфер обмена!"
                                          );
                                        },
                                        (err) => {
                                          message.error(
                                            "Ошибка при копировании заголовка и описания."
                                          );
                                        }
                                      );
                                  } else if (item.Idea) {
                                    navigator.clipboard
                                      .writeText(item.Idea)
                                      .then(
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
                            </Tooltip>
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
