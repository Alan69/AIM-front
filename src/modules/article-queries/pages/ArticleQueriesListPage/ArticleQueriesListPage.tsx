import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Layout, Table } from "antd";
import type { TableProps } from "antd";
import { useTranslation } from "react-i18next";
import styles from "./ArticleQueriesListPage.module.scss";
import {
  TArticleQueriesData,
  useGetArticleQueriesListQuery,
} from "modules/article-queries/redux/api";
import moment from "moment";

const { Content } = Layout;

export const ArticleQueriesListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: articleQueriesList, refetch } =
    useGetArticleQueriesListQuery();

  useEffect(() => {
    refetch();
  }, [refetch]);

  const columns: TableProps<TArticleQueriesData>["columns"] = [
    {
      title: t("articleQueriesListPage.columns.product"),
      dataIndex: ["product", "name"],
      key: "product",
      render: (_, record) => (
        <Link to={`/article-queries/${record.id}`}>
          {record.product?.name || "-"}
        </Link>
      ),
    },
    {
      title: t("articleQueriesListPage.columns.article_type"),
      dataIndex: ["type", "name"],
      key: "type",
      render: (_, record) => (
        <Link to={`/article-queries/${record.id}`}>
          {record.type?.name || "-"}
        </Link>
      ),
    },
    {
      title: t("articleQueriesListPage.columns.article_style"),
      dataIndex: ["style", "name"],
      key: "style",
      render: (_, record) => (
        <Link to={`/article-queries/${record.id}`}>
          {record.style?.name || "-"}
        </Link>
      ),
    },
    {
      title: t("articleQueriesListPage.columns.date"),
      dataIndex: "created_at",
      key: "created_at",
      defaultSortOrder: 'descend',
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      render: (date, record) => (
        <Link to={`/article-queries/${record.id}`}>
          {moment(date).locale(t("articleQueriesListPage.locale")).format("LLL")}
        </Link>
      ),
    },
  ];

  return (
    <Layout>
      <Content className="page-layout">
        <div className={styles.header}>
          <h1 className="main-title">{t("articleQueriesListPage.title")}</h1>
          <Button
            type="primary"
            onClick={() => navigate("/article-queries/create")}
          >
            {t("articleQueriesListPage.create_button")}
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={articleQueriesList}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          className={styles.table}
        />
      </Content>
    </Layout>
  );
}; 