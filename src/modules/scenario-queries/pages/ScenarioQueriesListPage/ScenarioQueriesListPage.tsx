import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Layout, Table } from "antd";
import type { TableProps } from "antd";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { useTypedSelector } from "hooks/useTypedSelector";
import styles from "./ScenarioQueriesListPage.module.scss";
import {
  TScenarioQueriesData,
  useGetScenarioQueriesListQuery,
} from "modules/scenario-queries/redux/api";

const { Content } = Layout;

export const ScenarioQueriesListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { current_company } = useTypedSelector((state) => state.auth);
  const { data: scenarioQueriesList, refetch } =
    useGetScenarioQueriesListQuery();

  const columns: TableProps<TScenarioQueriesData>["columns"] = [
    {
      title: t("scenario_queries_list.columns.product"),
      dataIndex: "product",
      key: "product",
      fixed: "left",
      render: (text, record) => (
        <Link to={`/scenario-queries/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: t("scenario_queries_list.columns.scenario_type"),
      dataIndex: "scenario_type",
      key: "scenario_type",
      render: (text, record) => (
        <Link to={`/scenario-queries/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: t("scenario_queries_list.columns.scenario_theme"),
      dataIndex: "scenario_theme",
      key: "scenario_theme",
      render: (text, record) => (
        <Link to={`/scenario-queries/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: t("scenario_queries_list.columns.date"),
      dataIndex: "date",
      key: "date",
      render: (text, record) => (
        <Link to={`/scenario-queries/${record.id}`}>{text}</Link>
      ),
    },
  ];

  const formatDate = (dateString: string | undefined) => {
    const date = new Date(dateString ? dateString : "");
    return new Intl.DateTimeFormat(t("date.locale"), {
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
          {t("scenario_queries_list.title")} - {current_company?.name}
          <Button
            color="default"
            className={styles.addBtn}
            onClick={() => navigate("/scenario-queries/create")}
          >
            {t("scenario_queries_list.create_button")}
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
    </Layout>
  );
};
