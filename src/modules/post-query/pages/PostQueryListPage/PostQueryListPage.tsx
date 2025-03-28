import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Layout, Table, Spin } from "antd";
import type { TableProps } from "antd";
import cn from "classnames";
import { TPostQueryData, useGetPostQueriesListQuery } from "../../redux/api";
import { useTypedSelector } from "hooks/useTypedSelector";
import { useTranslation } from "react-i18next";
import styles from "./PostQueryListPage.module.scss";
import VideoInstructionModal from "modules/account/components/VideoInstructionModal/VideoInstructionModal";
import ReactPlayer from "react-player";

const { Content } = Layout;

export const PostQueryListPage = () => {
  const navigate = useNavigate();
  const { current_company } = useTypedSelector((state) => state.auth);
  const {
    data: postQueriesList,
    refetch,
    isLoading,
  } = useGetPostQueriesListQuery(); // isLoading показывает состояние запроса
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

  const columns: TableProps<TPostQueryData>["columns"] = [
    {
      title: t("postQueriesListPage.fields.product"),
      dataIndex: "product",
      key: "product",
      fixed: "left",
      render: (text, record) => (
        <Link to={`/post-query/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: t("postQueriesListPage.fields.post_type"),
      dataIndex: "post_type",
      key: "post_type",
      render: (text, record) => (
        <Link to={`/post-query/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: t("postQueriesListPage.fields.text_style"),
      dataIndex: "text_style",
      key: "text_style",
      render: (text, record) => (
        <Link to={`/post-query/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: t("postQueriesListPage.fields.date"),
      dataIndex: "date",
      key: "date",
      render: (text, record) => (
        <Link to={`/post-query/${record.id}`}>{text}</Link>
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

  const data = postQueriesList?.map((item) => ({
    id: item.id,
    product: item?.product?.name,
    post_type: item?.post_type?.name,
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
          {t("postQueriesListPage.title", { company: current_company?.name })}
          <Button
            color="default"
            className={styles.addBtn}
            onClick={() => navigate("/post-query/create")}
          >
            {t("postQueriesListPage.create_button")}
          </Button>
        </h1>
        {/* Добавим лоадер Spin вокруг таблицы */}
        <Spin spinning={isLoading} tip={t("loading")}>
          <Table
            // @ts-ignore
            columns={columns}
            dataSource={data}
            pagination={false}
            scroll={{ x: "max-content" }}
            loading={isLoading} // Передаём состояние загрузки
          />
        </Spin>
      </Content>
      <VideoInstructionModal
        isModalVisible={isModalVisible}
        onOpen={openModal}
        onClose={closeModal}
        playerRef={playerRef}
        src="https://api.aimmagic.com/media/posts.mov"
      />
    </Layout>
  );
};
