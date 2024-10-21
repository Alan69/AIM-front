import React, { ReactNode, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useGetCompanyByIdQuery } from "../../redux/api";

import { Button, Layout, Table, TableProps, Tooltip, Typography } from "antd";
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
} from "modules/social-media/redux/api";
import { useTypedSelector } from "hooks/useTypedSelector";
import { useGetCurrentTargetAudienceQuery } from "modules/target-audience/redux/api";

interface DataType {
  key: string;
  product_name: string;
  product_assignment: string;
  product_action?: ReactNode;
}
const { Title, Text } = Typography;
const { Content } = Layout;

export const CompanyDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { current_company } = useTypedSelector((state) => state.auth);

  const {
    data: company,
    isLoading,
    refetch,
  } = useGetCompanyByIdQuery(id || "");
  const { data: productListByCompanyId } = useGetProductListByCompanyIdQuery(
    company?.id || ""
  );
  const { data: socialMediaList, refetch: refetchSocialMediaList } =
    useGetSocialMediaListByCurrentCompanyQuery();
  const { data: targetAudience, refetch: refetchTargetAudience } =
    useGetCurrentTargetAudienceQuery();

  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "Название",
      dataIndex: "product_name",
      key: "product_name",
      render: (text) => <div>{text}</div>,
      fixed: "left",
    },
    {
      title: "Назначение",
      dataIndex: "product_assignment",
      key: "product_assignment",
    },
    {
      title: "Действия",
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
    })) || [];

  const socialMediaListColumns: TableProps<TSocialMediaByCurrentCompanyData>["columns"] =
    [
      {
        title: "Название социальной сети",
        dataIndex: "platform",
        key: "platform",
        fixed: "left",
      },
      {
        title: "Имя пользователя",
        dataIndex: "username",
        key: "username",
      },
    ];

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    refetchSocialMediaList();
    refetchTargetAudience();
  }, [company]);

  useEffect(() => {
    navigate(`/company/${current_company?.id}`);
  }, [current_company]);

  if (isLoading) return <div>Loading...</div>;

  const renderTargetAudienceText = () => {
    const targetText = targetAudience?.text || "";
    const textLines = targetText.split("\n");

    if (textLines.length > 5) {
      return (
        <>
          <Text>
            {isExpanded ? targetText : textLines.slice(0, 5).join("\n")}
          </Text>
          <Button type="link" onClick={handleToggleExpand}>
            {isExpanded ? "Скрыть" : "Показать больше"}
          </Button>
        </>
      );
    }

    return <Text>{targetText}</Text>;
  };

  return (
    <Layout>
      <Content className="page-layout">
        <h1 className="main-title">Компания: {company?.name}</h1>
        <Layout>
          <Content>
            <div className={styles.companyDescr}>
              <div className={styles.companyDescr__title}>
                <Title level={4}>
                  Сфера деятельности:{" "}
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
              <Title level={5}>Описание: {company?.comment}</Title>
            </div>
          </Content>
        </Layout>
        <Layout>
          <h2 className={styles.product__title}>
            Целевая аудитория
            <Tooltip title="Добавить целевую аудиторию">
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
            <div className={styles.companyDescr}>
              {targetAudience?.text ? (
                renderTargetAudienceText()
              ) : (
                <Text>
                  На данный момент отсутствуют целевые аудитории. Вы можете
                  добавить новую целевую аудиторию.
                </Text>
              )}
            </div>
          </Content>
        </Layout>
        <Layout>
          <h2 className={styles.product__title}>
            Продукты
            <Tooltip title="Добавить продукт">
              <Button
                type="primary"
                shape="circle"
                className={styles.addButton}
                icon={<PlusCircleOutlined className={styles.addIcon} />}
                onClick={() => navigate(`/product/${company?.id}/create`)}
              />
            </Tooltip>
          </h2>
          <Content>
            <div className={styles.companyDescr}>
              {!productListByCompanyId?.length ? (
                <div style={{ paddingBottom: "12px" }}>
                  <Text>
                    На данный момент отсутствуют продукты или бренды. Вы можете
                    добавить новый продукт или бренд.
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
            Социальные сети
            <Tooltip title="Добавить социальную сеть">
              <Button
                type="primary"
                shape="circle"
                className={styles.addButton}
                icon={<PlusCircleOutlined className={styles.addIcon} />}
                onClick={() => navigate(`/social-media/${company?.id}/add`)}
              />
            </Tooltip>
          </h2>
          <Content>
            <div className={styles.companyDescr}>
              {!productListByCompanyId?.length ? (
                <div style={{ paddingBottom: "12px" }}>
                  <Text>
                    На данный момент отсутствуют социальные сети. Вы можете
                    добавить новую социальную сеть.
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
    </Layout>
  );
};
