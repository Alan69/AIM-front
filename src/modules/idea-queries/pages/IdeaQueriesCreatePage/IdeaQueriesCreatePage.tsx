import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { Layout, Button, Form, Input, Select, message } from "antd";
import { useTypedSelector } from "hooks/useTypedSelector";
import { useTranslation } from "react-i18next";
import { useGetContentTypesListQuery } from "../../../../redux/api/contentTypes/contentTypesApi";
import { useGetThemesListQuery } from "../../../../redux/api/themes/themesApi";
import { useGetLanguagesListQuery } from "../../../../redux/api/languages/languagesApi";
import { useLazyGetProductListByCompanyIdQuery } from "modules/product/redux/api";
import styles from "./IdeaQueriesCreatePage.module.scss";
import {
  TIdeaQueriesCreateData,
  useCreateIdeaQueriesMutation,
} from "modules/idea-queries/redux/api";
import { useGetCurrentTargetAudienceQuery } from "modules/target-audience/redux/api";

const { Content } = Layout;

export const IdeaQueriesCreatePage = () => {
  const navigate = useNavigate();
  const { current_company } = useTypedSelector((state) => state.auth);
  const { t } = useTranslation();

  const [createIdeaQueries, { isLoading: isIdeaCreating }] =
    useCreateIdeaQueriesMutation();
  const [
    getProductListByCompanyId,
    { data: productList, isLoading: isProductListLoading },
  ] = useLazyGetProductListByCompanyIdQuery();
  const { data: contentTypesList, isLoading: isContentTypesListLoading } =
    useGetContentTypesListQuery();
  const { data: targetAudience } = useGetCurrentTargetAudienceQuery();
  const { data: themesList, isLoading: isThemesListLoading } =
    useGetThemesListQuery();
  const { data: languagesList, isLoading: isLanguagesListLoading } =
    useGetLanguagesListQuery();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TIdeaQueriesCreateData>({
    defaultValues: {
      company: "",
      product: "",
      target_audience: targetAudience?.id,
      content_type: "",
      theme: "",
      language: "",
      description: "",
    },
  });

  useEffect(() => {
    if (current_company) {
      setValue("company", current_company.id);
    }
  }, [current_company, setValue]);

  useEffect(() => {
    if (current_company) {
      getProductListByCompanyId(current_company.id);
      setValue("product", "");
    }
  }, [current_company, getProductListByCompanyId]);

  const onSubmit = (data: TIdeaQueriesCreateData) => {
    const updatedData = {
      ...data,
      company: current_company?.id,
      target_audience: targetAudience?.id || "",
    };
    createIdeaQueries(updatedData)
      .unwrap()
      .then((response) => {
        navigate(`/idea-queries/${response.id}`);
      })
      .catch((error) => {
        message.error(error.data.error);
      });
  };

  return (
    <Layout>
      <Content className="page-layout">
        <h1 className="main-title">{t("ideaQueriesCreatePage.title")}</h1>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label={t("ideaQueriesCreatePage.fields.company")}
            validateStatus={errors.company ? "error" : ""}
            help={
              errors.company && t("ideaQueriesCreatePage.validation.required")
            }
          >
            <Controller
              name="company"
              control={control}
              rules={{ required: true }}
              disabled
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value || current_company?.id}
                  disabled
                >
                  <Select.Option
                    key={current_company?.id}
                    value={current_company?.id}
                  >
                    {current_company?.name}
                  </Select.Option>
                </Select>
              )}
            />
            {!current_company?.id ? (
              <div className={styles.noContent}>
                {t("ideaQueriesCreatePage.hints.no_company")}
              </div>
            ) : null}
          </Form.Item>

          <Form.Item label={t("ideaQueriesCreatePage.fields.product")}>
            <Controller
              name="product"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  loading={isProductListLoading}
                  disabled={isIdeaCreating}
                  allowClear
                >
                  {productList?.map((product) => (
                    <Select.Option key={product.id} value={product.id}>
                      {product.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item
            label={
              <span>
                {t("ideaQueriesCreatePage.fields.content_type")}{" "}
                <span className={styles.redStar}>*</span>
              </span>
            }
            validateStatus={errors.content_type ? "error" : ""}
            help={
              errors.content_type &&
              t("ideaQueriesCreatePage.validation.required")
            }
          >
            <Controller
              name="content_type"
              control={control}
              rules={{ required: true }}
              disabled={isContentTypesListLoading}
              render={({ field }) => (
                <Select {...field} disabled={isIdeaCreating}>
                  {contentTypesList?.map((postType) => (
                    <Select.Option key={postType.id} value={postType.id}>
                      {postType.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item
            label={
              <span>
                {t("ideaQueriesCreatePage.fields.theme")}{" "}
                <span className={styles.redStar}>*</span>
              </span>
            }
            validateStatus={errors.theme ? "error" : ""}
            help={
              errors.theme && t("ideaQueriesCreatePage.validation.required")
            }
          >
            <Controller
              name="theme"
              control={control}
              rules={{ required: true }}
              disabled={isThemesListLoading}
              render={({ field }) => (
                <Select {...field} disabled={isIdeaCreating}>
                  {themesList?.map((textStyle) => (
                    <Select.Option key={textStyle.id} value={textStyle.id}>
                      {textStyle.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item
            label={
              <span>
                {t("ideaQueriesCreatePage.fields.language")}{" "}
                <span className={styles.redStar}>*</span>
              </span>
            }
            validateStatus={errors.language ? "error" : ""}
            help={
              errors.language && t("ideaQueriesCreatePage.validation.required")
            }
          >
            <Controller
              name="language"
              control={control}
              rules={{ required: true }}
              disabled={isLanguagesListLoading}
              render={({ field }) => (
                <Select {...field} disabled={isIdeaCreating}>
                  {languagesList
                    ?.slice()
                    ?.sort((a, b) => {
                      const aIsStarred = a.name.startsWith("*");
                      const bIsStarred = b.name.startsWith("*");
                      if (aIsStarred && !bIsStarred) return -1;
                      if (!aIsStarred && bIsStarred) return 1;
                      return a.name.localeCompare(b.name);
                    })
                    .map((language) => (
                      <Select.Option key={language.id} value={language.id}>
                        {language.name}
                      </Select.Option>
                    ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item
            label={
              <span>
                {t("ideaQueriesCreatePage.fields.description")}{" "}
                <span className={styles.redStar}>*</span>
              </span>
            }
            validateStatus={errors.description ? "error" : ""}
            help={
              errors.description &&
              t("ideaQueriesCreatePage.validation.required")
            }
          >
            <Controller
              name="description"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input.TextArea rows={4} {...field} disabled={isIdeaCreating} />
              )}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isIdeaCreating}>
              {t("ideaQueriesCreatePage.buttons.submit")}
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
};
