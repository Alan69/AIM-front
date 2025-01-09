import React, { useEffect, useRef, useState } from "react";
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
import VideoInstructionModal from "modules/account/components/VideoInstructionModal/VideoInstructionModal";
import ReactPlayer from "react-player";

const { Content } = Layout;

export const ScenarioQueriesListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { current_company } = useTypedSelector((state) => state.auth);
  const { data: scenarioQueriesList, refetch } =
    useGetScenarioQueriesListQuery();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const playerRef = useRef<ReactPlayer | null>(null);

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => {
    setIsModalVisible(false);
    if (playerRef.current) {
      playerRef.current.getInternalPlayer().pause();
    }
  };

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
      <VideoInstructionModal
        isModalVisible={isModalVisible}
        onOpen={openModal}
        onClose={closeModal}
        playerRef={playerRef}
        src="https://res.cloudinary.com/dwbv1fvgp/video/upload/v1736418376/ideas_and_scenarios_mnaqfi.mov"
      />
    </Layout>
  );
};
