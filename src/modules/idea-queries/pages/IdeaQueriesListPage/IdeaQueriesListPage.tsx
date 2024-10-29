import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Layout, Table } from "antd";
import type { TableProps } from "antd";
import cn from "classnames";
import { useTypedSelector } from "hooks/useTypedSelector";
import styles from "./IdeaQueriesListPage.module.scss";
import {
  TIdeaQueriesData,
  useGetIdeaQueriesListQuery,
} from "modules/idea-queries/redux/api";

const { Content } = Layout;

export const IdeaQueriesListPage = () => {
  const navigate = useNavigate();
  const { current_company } = useTypedSelector((state) => state.auth);
  const { data: ideaQueriesList, refetch } = useGetIdeaQueriesListQuery();

  const columns: TableProps<TIdeaQueriesData>["columns"] = [
    {
      title: "Продукт",
      dataIndex: "product",
      key: "product",
      fixed: "left",
      render: (text, record) => (
        <Link to={`/idea-queries/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: "Тип контента",
      dataIndex: "content_type",
      key: "content_type",
      render: (text, record) => (
        <Link to={`/idea-queries/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: "Тематика",
      dataIndex: "theme",
      key: "theme",
      render: (text, record) => (
        <Link to={`/idea-queries/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: "Дата cоздания",
      dataIndex: "date",
      key: "date",
      render: (text, record) => (
        <Link to={`/idea-queries/${record.id}`}>{text}</Link>
      ),
    },
  ];

  const formatDate = (dateString: string | undefined) => {
    const date = new Date(dateString ? dateString : "");
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const data = ideaQueriesList?.map((item) => ({
    id: item.id,
    product: item?.product?.name,
    content_type: item?.content_type?.name,
    theme: item?.theme?.name,
    date: formatDate(item?.time_create),
  }));

  useEffect(() => {
    refetch();
  }, [refetch, current_company]);

  return (
    <Layout>
      <Content className="page-layout">
        <h1 className={cn("main-title", styles.title)}>
          История создания идеи - {current_company?.name}
          <Button
            color="default"
            className={styles.addBtn}
            onClick={() => navigate("/idea-queries/create")}
          >
            Создать
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
