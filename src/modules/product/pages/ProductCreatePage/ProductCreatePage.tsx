import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCreateProductMutation,
  useGetProductListByCompanyIdQuery,
} from "../../redux/api";
import { useForm, Controller } from "react-hook-form";
import { Layout, Button, Form, Input } from "antd";
import { useTranslation } from "react-i18next";
import styles from "./ProductCreatePage.module.scss";
import { useTypedSelector } from "hooks/useTypedSelector";

type TCreateProductForm = {
  name: string;
  scope: string;
  comment?: string;
  company: string;
};

const { Content } = Layout;

export const ProductCreatePage = () => {
  const { t } = useTranslation();
  const { companyId } = useParams<{ companyId: string }>();
  const { user } = useTypedSelector((state) => state.auth);

  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TCreateProductForm>();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const { refetch: refetchProductList } = useGetProductListByCompanyIdQuery(
    companyId || ""
  );

  const onSubmit = (payload: TCreateProductForm) => {
    const updatedData = {
      ...payload,
      author: user?.profile.id,
      companyId: companyId ? companyId : "",
    };

    createProduct(updatedData)
      .unwrap()
      .then(() => {
        navigate(`/company/${companyId}`);
        refetchProductList();
      });
  };

  useEffect(() => {
    refetchProductList();
  }, [refetchProductList]);

  return (
    <Layout>
      <Content className="page-layout">
        <h1 className="main-title">{t("product_create.title")}</h1>
        <Layout>
          <Content>
            <div className={styles.companyDescr}>
              <Form
                layout="vertical"
                onFinish={handleSubmit(onSubmit)}
                className={styles.form}
              >
                <Form.Item
                  label={t("product_create.fields.name")}
                  validateStatus={errors.name ? "error" : ""}
                  help={errors.name && t("product_create.errors.required")}
                >
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => <Input {...field} />}
                  />
                </Form.Item>

                <Form.Item
                  label={t("product_create.fields.scope")}
                  validateStatus={errors.scope ? "error" : ""}
                  help={errors.scope && t("product_create.errors.required")}
                >
                  <Controller
                    name="scope"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => <Input {...field} />}
                  />
                </Form.Item>

                <Form.Item label={t("product_create.fields.comment")}>
                  <Controller
                    name="comment"
                    control={control}
                    render={({ field }) => <Input.TextArea {...field} />}
                  />
                </Form.Item>

                <Form.Item>
                  <div className={styles.postActions}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isCreating}
                    >
                      {t("product_create.buttons.save")}
                    </Button>
                    <Button
                      htmlType="button"
                      type="default"
                      onClick={() => navigate(-1)}
                    >
                      {t("product_create.buttons.cancel")}
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
