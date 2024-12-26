import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetProductByIdQuery,
  useDeleteProductMutation,
} from "../../redux/api";
import { Layout, Button } from "antd";
import { useTranslation } from "react-i18next";
import styles from "./ProductDeletePage.module.scss";
import { useGetCompanyByIdQuery } from "../../../company/redux/api";
import Title from "antd/es/typography/Title";

const { Content } = Layout;

export const ProductDeletePage = () => {
  const { id, companyId } = useParams<{ id: string; companyId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: company } = useGetCompanyByIdQuery(companyId || "");
  const { data: product } = useGetProductByIdQuery(id || "");
  const [deleteCompany, { isLoading: isUpdating }] = useDeleteProductMutation();

  const handleDeleteProduct = () => {
    if (company) {
      deleteCompany(product?.id ? product?.id : "")
        .unwrap()
        .then(() => {
          navigate(`/company/${company?.id}`);
        });
    }
  };

  return (
    <Layout>
      <Content className="page-layout">
        <h1 className="main-title">{t("productDeletePage.title")}</h1>
        <Layout>
          <Content>
            <div className={styles.companyDescr}>
              <Title level={4}>
                {t("productDeletePage.confirmation", { name: product?.name })}
              </Title>
              <div className={styles.buttons}>
                <Button
                  type="primary"
                  danger
                  loading={isUpdating}
                  onClick={handleDeleteProduct}
                >
                  {t("productDeletePage.buttons.delete")}
                </Button>
                <Button
                  type="default"
                  onClick={() => {
                    navigate(`/company/${company?.id}`);
                  }}
                  loading={isUpdating}
                >
                  {t("productDeletePage.buttons.cancel")}
                </Button>
              </div>
            </div>
          </Content>
        </Layout>
      </Content>
    </Layout>
  );
};
