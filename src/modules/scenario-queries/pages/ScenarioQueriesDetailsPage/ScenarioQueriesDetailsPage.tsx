import React, { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { Layout, Typography, List, Button, message, Tooltip } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import styles from "./ScenarioQueriesDetailsPage.module.scss";
import {
  useCreateScenarioQueriesReplayMutation,
  useGetScenarioQueriesByIdQuery,
} from "modules/scenario-queries/redux/api";
import { useGetScenariosListQuery } from "modules/scenarios/redux/api";

const { Title, Text } = Typography;
const { Content } = Layout;

export const ScenarioQueriesDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();

  const {
    data: scenarioQuery,
    isLoading,
    refetch,
  } = useGetScenarioQueriesByIdQuery(id || "");
  const { data: scenarios, refetch: refetchScenariosList } =
    useGetScenariosListQuery(scenarioQuery?.id || "");
  const [
    createScenarioQueriesReplay,
    { isLoading: isScenarioQueriesRecreating },
  ] = useCreateScenarioQueriesReplayMutation();

  const data =
    scenarios?.map((item) => ({
      key: item.id.toString(),
      topic: item.topic,
      main_text: item.main_text,
      short_description: item.short_description,
      hashtags: item.hashtags,
    })) || [];

  const formatMainText = (text: string) => {
    return text.split("\n").map((line, index) => (
      <p key={index} style={{ margin: 0, marginLeft: 16 }}>
        {line}
      </p>
    ));
  };

  const handleCreateScenarioQueriesReplay = () => {
    const updatedData = {
      id: scenarioQuery?.id || "",
      latency: scenarioQuery?.latency || "",
      description: scenarioQuery?.description || "",
      company: scenarioQuery?.company?.id || "",
      product: scenarioQuery?.product?.id || "",
      target_audience: scenarioQuery?.target_audience || "",
      scenario_type: scenarioQuery?.scenario_type || "",
      scenario_theme: scenarioQuery?.scenario_theme?.id || "",
      language: scenarioQuery?.language?.id || "",
    };

    // @ts-ignore
    createScenarioQueriesReplay(updatedData)
      .unwrap()
      .then((response) => {
        navigate(`/scenario-queries/${response.id}`);
        refetch();
        refetchScenariosList();
      })
      .catch((error) => {
        message.error(error.data.error);
      });
  };

  useEffect(() => {
    refetch();
    refetchScenariosList();
  }, [refetch, refetchScenariosList, location.pathname]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <Layout>
      <Content className="page-layout">
        <h1 className="main-title">
          {(scenarioQuery?.company?.name ? scenarioQuery?.company?.name : "-") +
            " - " +
            (scenarioQuery?.product?.name ? scenarioQuery?.product?.name : "-")}
        </h1>
        <Layout>
          <Content>
            <div className={styles.postQueryDescr}>
              <div className={styles.postQueryDescr__title}>
                <Title level={4}>
                  Вид контента: {scenarioQuery?.scenario_type?.name}
                </Title>
              </div>
              <div className={styles.postQueryDescr__title}>
                <Title level={4}>
                  Тематика сценария: {scenarioQuery?.scenario_theme?.name}
                </Title>
              </div>
              <div className={styles.postQueryDescr__title}>
                <Title level={4}>Язык: {scenarioQuery?.language?.name}</Title>
              </div>
              <div className={styles.postQueryDescr__title}>
                <Title level={4}>Описание: {scenarioQuery?.description}</Title>
              </div>
              <div className={styles.postQueryDescr__title}>
                <Title level={4}>Длительность: {scenarioQuery?.latency}</Title>
              </div>
              <Button
                type="primary"
                disabled={isLoading}
                loading={isScenarioQueriesRecreating}
                onClick={handleCreateScenarioQueriesReplay}
              >
                Повторить запрос
              </Button>
            </div>
          </Content>
        </Layout>
        <Layout>
          <h2 className={styles.product__title}>Сценарии:</h2>
          <Content>
            <div className={styles.postQueryDescr}>
              {!scenarios?.length ? (
                <div style={{ paddingBottom: "12px" }}>
                  <Text>Сценарии не найдены. Добавьте сценарий.</Text>
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
                            <Title level={3}>{item.topic}</Title>
                            <Tooltip title="Скопировать">
                              <Button
                                className={styles.postContent__icon}
                                icon={<CopyOutlined />}
                                onClick={() => {
                                  if (
                                    item.topic ||
                                    item.short_description ||
                                    item.main_text ||
                                    item.hashtags
                                  ) {
                                    const textToCopy = [
                                      item.topic,
                                      item.short_description,
                                      item.main_text,
                                      item.hashtags,
                                    ]
                                      .filter(Boolean)
                                      .join("\n\n");

                                    navigator.clipboard
                                      .writeText(textToCopy)
                                      .then(
                                        () => {
                                          message.success(
                                            "Содержимое скопировано в буфер обмена!"
                                          );
                                        },
                                        (err) => {
                                          message.error(
                                            "Ошибка при копировании содержимого."
                                          );
                                        }
                                      );
                                  }
                                }}
                              />
                            </Tooltip>
                          </div>
                        }
                        description={
                          <div>
                            <div style={{ marginBottom: 8 }}>
                              <Title level={5}>Краткое описание:</Title>
                              <Text>{" " + item.short_description}</Text>
                            </div>
                            <div style={{ marginBottom: 8 }}>
                              <Title level={5}>Основной текст:</Title>
                              <Text>
                                <div>{formatMainText(item.main_text)}</div>
                              </Text>
                            </div>
                            <div>
                              <Text type="secondary">{item.hashtags}</Text>
                            </div>
                          </div>
                        }
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
