import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetCompanyByIdQuery,
  useGetCompanyListQuery,
  useDeleteCompanyMutation,
} from "../../redux/api";
import { Layout, Button } from "antd";
import { useTranslation } from "react-i18next";
import styles from "./CompanyDeletePage.module.scss";
import Title from "antd/es/typography/Title";
import { useTypedSelector } from "hooks/useTypedSelector";

const { Content } = Layout;

export const CompanyDeletePage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { user } = useTypedSelector((state) => state.auth);

  const navigate = useNavigate();
  const { data: company } = useGetCompanyByIdQuery(id || "");
  const [deleteCompany, { isLoading: isUpdating }] = useDeleteCompanyMutation();
  const { refetch: refetchCompanyList } = useGetCompanyListQuery(
    user?.profile.id
  );

  const handleDeleteCompany = () => {
    if (company) {
      deleteCompany(company?.id)
        .unwrap()
        .then(() => {
          navigate(`/company/create`);
          refetchCompanyList();
        });
    }
  };

  return (
    <Layout>
      <Content className="page-layout">
        <h1 className="main-title">{t("company_delete.title")}</h1>
        <Layout>
          <Content>
            <div className={styles.companyDescr}>
              <Title level={4}>
                {t("company_delete.confirm", { name: company?.name })}
              </Title>
              <div className={styles.buttons}>
                <Button
                  type="primary"
                  danger
                  loading={isUpdating}
                  onClick={handleDeleteCompany}
                >
                  {t("company_delete.buttons.delete")}
                </Button>
                <Button
                  type="default"
                  onClick={() => {
                    navigate(`/company/${company?.id}`);
                  }}
                  loading={isUpdating}
                >
                  {t("company_delete.buttons.cancel")}
                </Button>
              </div>
            </div>
          </Content>
        </Layout>
      </Content>
    </Layout>
  );
};
