import React from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateCompanyMutation,
  useGetCompanyListQuery,
  useUpdateCurrentCompanyMutation,
} from "../../redux/api";
import { useForm, Controller } from "react-hook-form";
import { Layout, Button, Form, Input, message } from "antd";
import styles from "./CompanyCreatePage.module.scss";
import { useTypedSelector } from "hooks/useTypedSelector";
import { useLazyGetAuthUserQuery } from "modules/auth/redux/api";
import { useTranslation } from "react-i18next";

type TCreateCompanyForm = {
  name: string;
  scope: string;
  comment?: string;
};

const { Content } = Layout;

export const CompanyCreatePage = () => {
  const navigate = useNavigate();
  const { user } = useTypedSelector((state) => state.auth);
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TCreateCompanyForm>();
  const [createCompany, { isLoading: isCreating }] = useCreateCompanyMutation();
  const { refetch: refetchCompanyList } = useGetCompanyListQuery(
    user?.profile.id
  );
  const [updateCurrentCompany] = useUpdateCurrentCompanyMutation();
  const [getAuthUser] = useLazyGetAuthUserQuery();

  const onSubmit = (payload: TCreateCompanyForm) => {
    const updatedData = {
      ...payload,
      author: user?.profile.id,
    };

    createCompany(updatedData)
      .unwrap()
      .then((response) => {
        updateCurrentCompany(response.id)
          .unwrap()
          .then(() => {
            navigate(`/company/${response.id}`);
            refetchCompanyList();
            getAuthUser();
            message.success(t("companyCreatePage.success_message"));
          });
      })
      .catch((error) => {
        message.error(error.data.error || t("companyCreatePage.error_message"));
      });
  };

  return (
    <Layout>
      <Content className="page-layout">
        <h1 className="main-title">{t("companyCreatePage.title")}</h1>
        <Layout>
          <Content>
            <div className={styles.companyDescr}>
              <Form
                layout="vertical"
                onFinish={handleSubmit(onSubmit)}
                className={styles.form}
              >
                <Form.Item
                  label={t("companyCreatePage.form.name.label")}
                  validateStatus={errors.name ? "error" : ""}
                  help={errors.name && t("companyCreatePage.form.name.error")}
                >
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => <Input {...field} />}
                  />
                </Form.Item>

                <Form.Item
                  label={t("companyCreatePage.form.scope.label")}
                  validateStatus={errors.scope ? "error" : ""}
                  help={errors.scope && t("companyCreatePage.form.scope.error")}
                >
                  <Controller
                    name="scope"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => <Input {...field} />}
                  />
                </Form.Item>

                <Form.Item label={t("companyCreatePage.form.comment.label")}>
                  <Controller
                    name="comment"
                    control={control}
                    render={({ field }) => <Input.TextArea {...field} />}
                  />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={isCreating}>
                    {t("companyCreatePage.form.submit")}
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Content>
        </Layout>
      </Content>
    </Layout>
  );
};
