import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Layout, Table, Spin } from "antd";
import type { TableProps } from "antd";
import cn from "classnames";
import { TVideoQueryData, useGetVideoQueriesListQuery } from "../../redux/api";
import { useTypedSelector } from "hooks/useTypedSelector";
import { useTranslation } from "react-i18next";
import styles from "./VideoQueryListPage.module.scss";

const { Content } = Layout;

export const VideoQueryListPage = () => {
  const navigate = useNavigate();
  const { current_company } = useTypedSelector((state) => state.auth);
  const {
    data: videoQueriesList,
    refetch,
    isLoading,
  } = useGetVideoQueriesListQuery(); 
  const { t } = useTranslation();

  const columns: TableProps<TVideoQueryData>["columns"] = [
    {
      title: t("videoQueriesListPage.fields.product"),
      dataIndex: "product",
      key: "product",
      fixed: "left",
      render: (text, record) => (
        <Link to={`/video-query/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: t("videoQueriesListPage.fields.video_type"),
      dataIndex: "video_type",
      key: "video_type",
      render: (text, record) => (
        <Link to={`/video-query/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: t("videoQueriesListPage.fields.text_style"),
      dataIndex: "text_style",
      key: "text_style",
      render: (text, record) => (
        <Link to={`/video-query/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: t("videoQueriesListPage.fields.date"),
      dataIndex: "date",
      key: "date",
      render: (text, record) => (
        <Link to={`/video-query/${record.id}`}>{text}</Link>
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

  const data = videoQueriesList?.map((item) => ({
    id: item.id,
    product: item?.product?.name,
    video_type: item?.post_type?.name,
    text_style: item?.text_style?.name,
    date: formatDate(item?.time_create),
  }));

  useEffect(() => {
    refetch();
  }, [refetch, current_company]);

  return (
    <Layout>
      <Content className="page-layout">
        <h1 className={cn("main-title", styles.title)}>
          {t("videoQueriesListPage.title", { company: current_company?.name })}
          <Button
            color="default"
            className={styles.addBtn}
            onClick={() => navigate("/video-query/create")}
          >
            {t("videoQueriesListPage.create_button")}
          </Button>
        </h1>
        <Spin spinning={isLoading} tip={t("loading")}>
          <Table
            // @ts-ignore
            columns={columns}
            dataSource={data}
            pagination={false}
            scroll={{ x: "max-content" }}
            loading={isLoading}
          />
        </Spin>
      </Content>
    </Layout>
  );
}; 