import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Layout, Table } from "antd";
import type { TableProps } from "antd";
import cn from "classnames";
import { useTypedSelector } from "hooks/useTypedSelector";
import { useTranslation } from "react-i18next";
import styles from "./IdeaQueriesListPage.module.scss";
import {
  TIdeaQueriesData,
  useGetIdeaQueriesListQuery,
} from "modules/idea-queries/redux/api";

import VideoInstructionModal from "modules/account/components/VideoInstructionModal/VideoInstructionModal";
import ReactPlayer from "react-player";

const { Content } = Layout;

export const IdeaQueriesListPage = () => {
  const navigate = useNavigate();
  const { current_company } = useTypedSelector((state) => state.auth);
  const { data: ideaQueriesList, refetch } = useGetIdeaQueriesListQuery();
  const { t } = useTranslation();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const playerRef = useRef<ReactPlayer | null>(null);

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => {
    setIsModalVisible(false);
    if (playerRef.current) {
      playerRef.current.getInternalPlayer().pause();
    }
  };

  const columns: TableProps<TIdeaQueriesData>["columns"] = [
    {
      title: t("ideaQueriesListPage.fields.product"),
      dataIndex: "product",
      key: "product",
      fixed: "left",
      render: (text, record) => (
        <Link to={`/idea-queries/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: t("ideaQueriesListPage.fields.content_type"),
      dataIndex: "content_type",
      key: "content_type",
      render: (text, record) => (
        <Link to={`/idea-queries/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: t("ideaQueriesListPage.fields.theme"),
      dataIndex: "theme",
      key: "theme",
      render: (text, record) => (
        <Link to={`/idea-queries/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: t("ideaQueriesListPage.fields.date_created"),
      dataIndex: "date",
      key: "date",
      render: (text, record) => (
        <Link to={`/idea-queries/${record.id}`}>{text}</Link>
      ),
    },
  ];

  const formatDate = (dateString: string | undefined) => {
    const date = new Date(dateString || "");
    return new Intl.DateTimeFormat(t("ideaQueriesListPage.locale"), {
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
          {t("ideaQueriesListPage.title", {
            company:
              current_company?.name || t("ideaQueriesListPage.default_company"),
          })}
          <Button
            color="default"
            className={styles.addBtn}
            onClick={() => navigate("/idea-queries/create")}
          >
            {t("ideaQueriesListPage.create_button")}
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
        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      />
    </Layout>
  );
};
