import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useUpdateCompanyMutation,
  useGetCompanyByIdQuery,
  useGetCompanyListQuery,
} from "../../redux/api";
import { useForm, Controller } from "react-hook-form";
import { Layout, Button, Form, Input } from "antd";
import { useTranslation } from "react-i18next";
import styles from "./CompanyUpdatePage.module.scss";
import { useTypedSelector } from "hooks/useTypedSelector";

type TUpdateCompanyForm = {
  id: number;
  name: string;
  scope: string;
  comment?: string;
};

const { Content } = Layout;

export const CompanyUpdatePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useTypedSelector((state) => state.auth);

  const { t } = useTranslation();
  const { data: company } = useGetCompanyByIdQuery(id || "");
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TUpdateCompanyForm>({
    defaultValues: {
      name: "",
      scope: "",
      comment: "",
    },
  });

  const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyMutation();
  const { refetch: refetchCompanyList } = useGetCompanyListQuery(
    user?.profile.id
  );

  const onSubmit = (payload: TUpdateCompanyForm) => {
    const updatedData = {
      ...payload,
      author: user?.profile.id,
    };

    if (company) {
      updateCompany({ ...updatedData, id: company.id })
        .unwrap()
        .then((response) => {
          navigate(`/company/${response.id}`);
          refetchCompanyList();
        });
    }
  };

  useEffect(() => {
    if (company) {
      reset({
        name: company.name,
        scope: company.scope,
        comment: company.comment || "",
      });
    }
  }, [company, reset]);

  return (
    <Layout>
      <Content className="page-layout">
        <h1 className="main-title">{t("company_update.title")}</h1>
        <Layout>
          <Content>
            <div className={styles.companyDescr}>
              <Form
                layout="vertical"
                onFinish={handleSubmit(onSubmit)}
                className={styles.form}
              >
                <Form.Item
                  label={t("company_update.fields.name")}
                  validateStatus={errors.name ? "error" : ""}
                  help={errors.name && t("company_update.errors.required")}
                >
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => <Input {...field} />}
                  />
                </Form.Item>

                <Form.Item
                  label={t("company_update.fields.scope")}
                  validateStatus={errors.scope ? "error" : ""}
                  help={errors.scope && t("company_update.errors.required")}
                >
                  <Controller
                    name="scope"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => <Input {...field} />}
                  />
                </Form.Item>

                <Form.Item label={t("company_update.fields.description")}>
                  <Controller
                    name="comment"
                    control={control}
                    render={({ field }) => <Input.TextArea {...field} />}
                  />
                </Form.Item>
                <Form.Item>
                  <div className={styles.buttons}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isUpdating}
                    >
                      {t("company_update.buttons.save")}
                    </Button>
                    <Button
                      type="default"
                      onClick={() => {
                        navigate(`/company/${company?.id}`);
                      }}
                      loading={isUpdating}
                    >
                      {t("company_update.buttons.cancel")}
                    </Button>
                  </div>
                </Form.Item>
              </Form>
            </div>
          </Content>
        </Layout>
      </Content>
    </Layout>
  );
};
