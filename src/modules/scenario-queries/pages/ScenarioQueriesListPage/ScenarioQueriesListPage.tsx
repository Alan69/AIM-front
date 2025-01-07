import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Layout, Table, Modal } from "antd";
import type { TableProps } from "antd";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { useTypedSelector } from "hooks/useTypedSelector";
import styles from "./ScenarioQueriesListPage.module.scss";
import {
  TScenarioQueriesData,
  useGetScenarioQueriesListQuery,
} from "modules/scenario-queries/redux/api";
import ReactPlayer from "react-player";
import questionMark from "assets/questionMark.svg";

const { Content } = Layout;

export const ScenarioQueriesListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { current_company } = useTypedSelector((state) => state.auth);
  const { data: scenarioQueriesList, refetch } =
    useGetScenarioQueriesListQuery();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const columns: TableProps<TScenarioQueriesData>["columns"] = [
    {
      title: t("scenarioQueriesListPage.columns.product"),
      dataIndex: "product",
      key: "product",
      fixed: "left",
      render: (text, record) => (
        <Link to={`/scenario-queries/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: t("scenarioQueriesListPage.columns.scenario_type"),
      dataIndex: "scenario_type",
      key: "scenario_type",
      render: (text, record) => (
        <Link to={`/scenario-queries/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: t("scenarioQueriesListPage.columns.scenario_theme"),
      dataIndex: "scenario_theme",
      key: "scenario_theme",
      render: (text, record) => (
        <Link to={`/scenario-queries/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: t("scenarioQueriesListPage.columns.date"),
      dataIndex: "date",
      key: "date",
      render: (text, record) => (
        <Link to={`/scenario-queries/${record.id}`}>{text}</Link>
      ),
    },
  ];

  const formatDate = (dateString: string | undefined) => {
    const date = new Date(dateString ? dateString : "");
    return new Intl.DateTimeFormat(t("scenarioQueriesListPage.locale"), {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const data = scenarioQueriesList?.map((item) => ({
    id: item.id,
    product: item?.product?.name,
    scenario_type: item?.scenario_type?.name,
    scenario_theme: item?.scenario_theme?.name,
    date: formatDate(item?.time_create),
  }));
  const handleModalOpen = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    refetch();
  }, [refetch, current_company]);

  return (
    <Layout>
      <Content className="page-layout">
        <h1 className={cn("main-title", styles.title)}>
          {t("scenarioQueriesListPage.title")} - {current_company?.name}
          <Button
            color="default"
            className={styles.addBtn}
            onClick={() => navigate("/scenario-queries/create")}
          >
            {t("scenarioQueriesListPage.create_button")}
          </Button>
        </h1>
        <Table
          // @ts-ignore
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ x: "max-content" }}
        />
      </Content>

      {/* <button
        type="button"
        className="ant-btn css-dev-only-do-not-override-qk3teg ant-btn-circle ant-btn-default ant-btn-lg ant-btn-icon-only ChatButtonWithForm_messageButton__i7-0i"
        onClick={handleModalOpen}
      >
        <span className="ant-btn-icon">
          <span
            role="img"
            aria-label="message"
            className="anticon anticon-message ChatButtonWithForm_iconMessage__xIciZ"
          >
            <img
              className={styles.icon}
              src={questionMark}
              alt="questionMark"
            />
          </span>
        </span>
      </button>
      <Modal
        title={t("scenarioQueriesListPage.modal.title")}
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={1300}
      >
        <ReactPlayer
          url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          controls
          width="100%"
          height="100%"
          playing={true}
        />
      </Modal> */}
    </Layout>
  );
};
