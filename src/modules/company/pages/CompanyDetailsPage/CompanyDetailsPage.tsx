import React, { ReactNode, useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useGetCompanyByIdQuery } from "../../redux/api";

import {
  Button,
  Layout,
  Table,
  TableProps,
  Tooltip,
  Typography,
  Modal,
  message,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import styles from "./CompanyDetailsPage.module.scss";
import {
  TProductData,
  useGetProductListByCompanyIdQuery,
} from "../../../product/redux/api";
import {
  TSocialMediaByCurrentCompanyData,
  useGetSocialMediaListByCurrentCompanyQuery,
  useRemovePlatformMutation,
} from "modules/social-media/redux/api";
import { useTypedSelector } from "hooks/useTypedSelector";
import { useGetCurrentTargetAudienceQuery } from "modules/target-audience/redux/api";
import { useTranslation } from "react-i18next";
import VideoInstructionModal from "modules/account/components/VideoInstructionModal/VideoInstructionModal";

import ReactPlayer from "react-player";
interface DataType {
  key: string;
  product_name: string;
  product_assignment: string;
  product_action?: ReactNode;
}
const { Title, Text } = Typography;
const { Content } = Layout;

export const CompanyDetailsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { current_company } = useTypedSelector((state) => state.auth);

  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const playerRef = useRef<ReactPlayer | null>(null);

  const openVideoModal = () => setIsVideoModalVisible(true);
  const closeVideoModal = () => {
    setIsVideoModalVisible(false);
    if (playerRef.current) {
      playerRef.current.getInternalPlayer().pause();
    }
  };

  const {
    data: company,
    isLoading,
    refetch,
  } = useGetCompanyByIdQuery(id || "");
  const { data: productListByCompanyId, refetch: refetchProductList } =
    useGetProductListByCompanyIdQuery(company?.id || "");
  const { data: socialMediaList, refetch: refetchSocialMediaList } =
    useGetSocialMediaListByCurrentCompanyQuery();
  const { data: targetAudience, refetch: refetchTargetAudience } =
    useGetCurrentTargetAudienceQuery();
  const [removePlatform, { isLoading: isRemoving }] =
    useRemovePlatformMutation();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPlatform, setSelectedPlatform] =
    useState<TSocialMediaByCurrentCompanyData | null>(null);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const showRemovePlatformModal = (item: TSocialMediaByCurrentCompanyData) => {
    setSelectedPlatform(item);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedPlatform(null);
  };

  const handleRemovePlatform = async () => {
    if (selectedPlatform) {
      try {
        await removePlatform(selectedPlatform.id).unwrap();
        message.success(t("companyDetailsPage.messages.platform_removed"));
        refetchSocialMediaList();
      } catch (error) {
        message.error(t("companyDetailsPage.messages.error_removing_platform"));
      }
    }
    setIsModalVisible(false);
    setSelectedPlatform(null);
  };

  const columns: TableProps<DataType>["columns"] = [
    {
      title: t("companyDetailsPage.fields.products"),
      dataIndex: "product_name",
      key: "product_name",
      render: (text) => <div>{text}</div>,
      fixed: "left",
    },
    {
      title: t("companyDetailsPage.fields.description"),
      dataIndex: "product_assignment",
      key: "product_assignment",
    },
    {
      title: t("companyDetailsPage.fields.actions"),
      dataIndex: "product_action",
      key: "product_action",
    },
  ];

  const data: DataType[] =
    productListByCompanyId?.map((product: TProductData) => ({
      key: product.id.toString(),
      product_name: product.name,
      product_assignment: product.scope,
      product_action: (
        <div className={styles.companyDescr__icons}>
          <Link to={`/product/${company?.id}/${product?.id}/update`}>
            <EditOutlined />
          </Link>
          <Link to={`/product/${company?.id}/${product?.id}/delete`}>
            <DeleteOutlined />
          </Link>
        </div>
      ),
    })) || [];

  const newSocialMediaList =
    socialMediaList?.map((item: TSocialMediaByCurrentCompanyData) => ({
      key: item.username,
      platform: item.platform.name,
      username: item.username,
      platform_action: (
        <Button
          type="link"
          shape="circle"
          icon={
            <DeleteOutlined
              onClick={() => showRemovePlatformModal(item)}
              style={{ cursor: "pointer" }}
            />
          }
        />
      ),
    })) || [];

  const socialMediaListColumns: TableProps<TSocialMediaByCurrentCompanyData>["columns"] =
    [
      {
        title: t("companyDetailsPage.fields.social_media"),
        dataIndex: "platform",
        key: "platform",
        fixed: "left",
      },
      {
        title: t("companyDetailsPage.fields.description"),
        dataIndex: "username",
        key: "username",
      },
      {
        title: t("companyDetailsPage.fields.actions"),
        dataIndex: "platform_action",
        key: "platform_action",
      },
    ];

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    refetchSocialMediaList();
    refetchTargetAudience();
    refetchProductList();
  }, [company, refetchSocialMediaList, refetchTargetAudience, refetchProductList]);

  useEffect(() => {
    navigate(`/company/${current_company?.id}`);
  }, [current_company, navigate]);

  if (isLoading) return <div>Loading...</div>;

  const renderTargetAudienceText = () => {
    const targetText = targetAudience?.text || "";
    const textLines = targetText.split("\n");

    if (textLines.length > 5) {
      return (
        <div>
          {isExpanded
            ? targetText.split("\n").map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  <br />
                </React.Fragment>
              ))
            : textLines.slice(0, 9).map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  <br />
                </React.Fragment>
              ))}

          <Button type="link" onClick={handleToggleExpand}>
            {isExpanded
              ? t("companyDetailsPage.buttons.hide")
              : t("companyDetailsPage.buttons.show_more")}
          </Button>
        </div>
      );
    }

    return <Text>{targetText}</Text>;
  };

  return (
    <>
      <Layout>
        <Content className="page-layout">
          <h1 className="main-title">
            {t("companyDetailsPage.title", { name: company?.name })}
          </h1>
          <Layout>
            <Content>
              <div className={styles.companyDescr}>
                <div className={styles.companyDescr__title}>
                  <Title level={4}>
                    {t("companyDetailsPage.fields.scope")}:{" "}
                    <span className={styles.companyDescr__title__value}>
                      {company?.scope}
                    </span>
                  </Title>
                  <div className={styles.companyDescr__icons}>
                    <Link to={`/company/${company?.id}/update`}>
                      <EditOutlined />
                    </Link>
                    <Link to={`/company/${company?.id}/delete`}>
                      <DeleteOutlined />
                    </Link>
                  </div>
                </div>
                <Title level={5}>
                  {t("companyDetailsPage.fields.description")}:{" "}
                  {company?.comment}
                </Title>
              </div>
            </Content>
          </Layout>
          <Layout>
            <h2 className={styles.product__title}>
              {t("companyDetailsPage.fields.target_audience")}
              <Tooltip
                title={t("companyDetailsPage.actions.add_target_audience")}
              >
                <Button
                  type="primary"
                  shape="circle"
                  className={styles.addButton}
                  icon={<PlusCircleOutlined className={styles.addIcon} />}
                  onClick={() => navigate("/target-audience/create")}
                />
              </Tooltip>
            </h2>
            <Content>
              <div
                className={styles.companyDescr}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                {targetAudience?.text ? (
                  renderTargetAudienceText()
                ) : (
                  <Text>
                    {t("companyDetailsPage.placeholders.no_target_audience")}
                  </Text>
                )}
                {targetAudience?.text ? (
                  <Link to={`/target-audience/${targetAudience?.id}/update`}>
                    <EditOutlined />
                  </Link>
                ) : (
                  ""
                )}
              </div>
            </Content>
          </Layout>
          <Layout>
            <h2 className={styles.product__title}>
              {t("companyDetailsPage.fields.products")}
              <Tooltip title={t("companyDetailsPage.actions.add_product")}>
                <Button
                  type="primary"
                  shape="circle"
                  className={styles.addButton}
                  icon={<PlusCircleOutlined />}
                  onClick={() => navigate(`/product/${company?.id}/create`)}
                />
              </Tooltip>
            </h2>
            <Content>
              <div className={styles.companyDescr}>
                {!productListByCompanyId?.length ? (
                  <div style={{ paddingBottom: "12px" }}>
                    <Text>
                      {t("companyDetailsPage.placeholders.no_products")}
                    </Text>
                  </div>
                ) : (
                  ""
                )}
                <Table
                  columns={columns}
                  dataSource={data}
                  pagination={false}
                  scroll={{ x: "max-content" }}
                />
              </div>
            </Content>
          </Layout>
          <Layout>
            <h2 className={styles.product__title}>
              {t("companyDetailsPage.fields.social_media")}
              <Tooltip title={t("companyDetailsPage.actions.add_social_media")}>
                <Button
                  type="primary"
                  shape="circle"
                  className={styles.addButton}
                  icon={<PlusCircleOutlined />}
                  onClick={() => navigate(`/social-media/${company?.id}/add`)}
                />
              </Tooltip>
            </h2>
            <Content>
              <div className={styles.companyDescr}>
                {!productListByCompanyId?.length ? (
                  <div style={{ paddingBottom: "12px" }}>
                    <Text>
                      {t("companyDetailsPage.placeholders.no_social_media")}
                    </Text>
                  </div>
                ) : (
                  ""
                )}
                <Table
                  // @ts-ignore
                  columns={socialMediaListColumns}
                  dataSource={newSocialMediaList}
                  pagination={false}
                  scroll={{ x: "max-content" }}
                />
              </div>
            </Content>
          </Layout>
        </Content>
        <VideoInstructionModal
          isModalVisible={isVideoModalVisible}
          onOpen={openVideoModal}
          onClose={closeVideoModal}
          playerRef={playerRef}
          src="https://res.cloudinary.com/dwbv1fvgp/video/upload/v1736418262/company_mkwfm8.mov"
        />
      </Layout>
      <Modal
        title={t("companyDetailsPage.modals.confirm_deletion")}
        visible={isModalVisible}
        onOk={handleRemovePlatform}
        onCancel={handleModalCancel}
        confirmLoading={isRemoving}
      >
        <Text>
          {t("companyDetailsPage.modals.confirm_delete_message", {
            platform: selectedPlatform?.platform.name,
            username: selectedPlatform?.username,
          })}
        </Text>
      </Modal>
    </>
  );
};
