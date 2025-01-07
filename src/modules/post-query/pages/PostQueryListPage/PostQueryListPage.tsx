import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Layout, Table, Spin, Modal } from "antd";
import type { TableProps } from "antd";
import cn from "classnames";
import { TPostQueryData, useGetPostQueriesListQuery } from "../../redux/api";
import { useTypedSelector } from "hooks/useTypedSelector";
import { useTranslation } from "react-i18next";
import styles from "./PostQueryListPage.module.scss";
import ReactPlayer from "react-player";
import questionMark from "assets/questionMark.svg";

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
      <button
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
        title={t("postQueriesListPage.modal.title")}
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
      </Modal>
    </Layout>
  );
};
