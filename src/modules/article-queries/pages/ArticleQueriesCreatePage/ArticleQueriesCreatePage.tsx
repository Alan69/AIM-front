import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { Layout, Button, Form, Input, Select, message } from "antd";
import { useTranslation } from "react-i18next";
import { useTypedSelector } from "hooks/useTypedSelector";
import { useGetLanguagesListQuery } from "../../../../redux/api/languages/languagesApi";
import { useLazyGetProductListByCompanyIdQuery } from "modules/product/redux/api";
import {
  TArticleQueriesCreateData,
  useCreateArticleQueriesMutation,
  useGetArticleTypesListQuery,
  useGetArticleStylesListQuery,
  useGetArticleWordLengthsListQuery
} from "modules/article-queries/redux/api";
import styles from "./ArticleQueriesCreatePage.module.scss";

const { Content } = Layout;

export const ArticleQueriesCreatePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { current_company } = useTypedSelector((state) => state.auth);

  const [createArticleQueries, { isLoading: isArticleCreating }] =
    useCreateArticleQueriesMutation();
  const [
    getProductListByCompanyId,
    { data: productList, isLoading: isProductListLoading },
  ] = useLazyGetProductListByCompanyIdQuery();
  const { data: articleTypesList, isLoading: isArticleTypesListLoading } =
    useGetArticleTypesListQuery();
  const { data: articleStylesList, isLoading: isArticleStylesListLoading } =
    useGetArticleStylesListQuery();
  const { data: articleWordLengthsList, isLoading: isArticleWordLengthsListLoading } =
    useGetArticleWordLengthsListQuery();
  const { data: languagesList, isLoading: isLanguagesListLoading } =
    useGetLanguagesListQuery();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TArticleQueriesCreateData>({
    defaultValues: {
      text: "",
      company: "",
      product: "",
      type: "",
      style: "",
      word_length: "",
      language: "",
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
  }, [current_company, getProductListByCompanyId, setValue]);

  const onSubmit = (data: TArticleQueriesCreateData) => {
    if (!current_company?.id) {
      message.error("Company is required");
      return;
    }
    
    const updatedData = {
      ...data,
      company: current_company.id,
    };
    
    createArticleQueries(updatedData)
      .unwrap()
      .then((response) => {
        navigate(`/article-queries/${response.id}`);
      })
      .catch((error) => {
        message.error(error.data.error);
      });
  };

  return (
    <Layout>
      <Content className="page-layout">
        <h1 className="main-title">{t("articleQueriesCreatePage.title")}</h1>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label={t("articleQueriesCreatePage.company")}
            validateStatus={errors.company ? "error" : ""}
            help={
              errors.company && t("articleQueriesCreatePage.errors.required")
            }
          >
            <Controller
              name="company"
              control={control}
              rules={{ required: true }}
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
            {!current_company?.id && (
              <div className={styles.noContent}>
                {t("articleQueriesCreatePage.no_company")}
              </div>
            )}
          </Form.Item>

          <Form.Item
            label={
              <span>
                {t("articleQueriesCreatePage.product")}{" "}
                <span className={styles.redStar}>*</span>
              </span>
            }
            validateStatus={errors.product ? "error" : ""}
            help={
              errors.product && t("articleQueriesCreatePage.errors.required")
            }
          >
            <Controller
              name="product"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  {...field}
                  loading={isProductListLoading}
                  disabled={isArticleCreating}
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
                {t("articleQueriesCreatePage.article_type")}{" "}
                <span className={styles.redStar}>*</span>
              </span>
            }
            validateStatus={errors.type ? "error" : ""}
            help={
              errors.type &&
              t("articleQueriesCreatePage.errors.required")
            }
          >
            <Controller
              name="type"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select {...field} disabled={isArticleCreating || isArticleTypesListLoading}>
                  {articleTypesList?.map((type) => (
                    <Select.Option key={type.id} value={type.id}>
                      {type.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item
            label={
              <span>
                {t("articleQueriesCreatePage.article_style")}{" "}
                <span className={styles.redStar}>*</span>
              </span>
            }
            validateStatus={errors.style ? "error" : ""}
            help={
              errors.style &&
              t("articleQueriesCreatePage.errors.required")
            }
          >
            <Controller
              name="style"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select {...field} disabled={isArticleCreating || isArticleStylesListLoading}>
                  {articleStylesList?.map((style) => (
                    <Select.Option key={style.id} value={style.id}>
                      {style.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item
            label={
              <span>
                {t("articleQueriesCreatePage.word_length")}{" "}
                <span className={styles.redStar}>*</span>
              </span>
            }
            validateStatus={errors.word_length ? "error" : ""}
            help={
              errors.word_length &&
              t("articleQueriesCreatePage.errors.required")
            }
          >
            <Controller
              name="word_length"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select {...field} disabled={isArticleCreating || isArticleWordLengthsListLoading}>
                  {articleWordLengthsList?.map((length) => (
                    <Select.Option key={length.id} value={length.id}>
                      {length.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item
            label={
              <span>
                {t("articleQueriesCreatePage.language")}{" "}
                <span className={styles.redStar}>*</span>
              </span>
            }
            validateStatus={errors.language ? "error" : ""}
            help={
              errors.language && t("articleQueriesCreatePage.errors.required")
            }
          >
            <Controller
              name="language"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select {...field} disabled={isArticleCreating || isLanguagesListLoading}>
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
                {t("articleQueriesCreatePage.text")}{" "}
                <span className={styles.redStar}>*</span>
              </span>
            }
            validateStatus={errors.text ? "error" : ""}
            help={
              errors.text &&
              t("articleQueriesCreatePage.errors.required")
            }
          >
            <Controller
              name="text"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input.TextArea
                  rows={4}
                  {...field}
                  disabled={isArticleCreating}
                />
              )}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isArticleCreating}
            >
              {t("articleQueriesCreatePage.submit_button")}
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
}; 