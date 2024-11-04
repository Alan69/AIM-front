import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { Layout, Button, Form, Input, Select, message } from "antd";
import { useTypedSelector } from "hooks/useTypedSelector";
import { useGetContentTypesListQuery } from "../../../../redux/api/contentTypes/contentTypesApi";
import { useGetThemesListQuery } from "../../../../redux/api/themes/themesApi";
import { useGetLanguagesListQuery } from "../../../../redux/api/languages/languagesApi";
import { useLazyGetProductListByCompanyIdQuery } from "modules/product/redux/api";
import styles from "./IdeaQueriesCreatePage.module.scss";
import {
  TIdeaQueriesCreateData,
  useCreateIdeaQueriesMutation,
} from "modules/idea-queries/redux/api";
import {
  useGetCurrentTargetAudienceQuery,
  useGetTargetAudienceListQuery,
} from "modules/target-audience/redux/api";

const { Content } = Layout;

export const IdeaQueriesCreatePage = () => {
  const navigate = useNavigate();
  const { current_company } = useTypedSelector((state) => state.auth);

  const [createIdeaQueries, { isLoading: isIdeaCreating }] =
    useCreateIdeaQueriesMutation();
  const [
    getProductListByCompanyId,
    { data: productList, isLoading: isProductListLoading },
  ] = useLazyGetProductListByCompanyIdQuery();
  const { data: contentTypesList, isLoading: isContentTypesListLoading } =
    useGetContentTypesListQuery();
  // const { data: targetAudienceList, isLoading: isTargetAudienceListLoading } =
  //   useGetTargetAudienceListQuery();
  const { data: targetAudience, isLoading: isTargetAudienceLoading } =
    useGetCurrentTargetAudienceQuery();
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
        <h1 className="main-title">Создать идею</h1>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label="Компания"
            validateStatus={errors.company ? "error" : ""}
            help={errors.company && "Заполните это поле."}
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
                (Если поле пустое, вы можете выбрать или добавить текущую
                компанию в меню слева)
              </div>
            ) : (
              ""
            )}
          </Form.Item>

          <Form.Item label="Продукт">
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

          {/* <Form.Item label="Целевая аудитория">
            <Controller
              name="target_audience"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  loading={isTargetAudienceListLoading}
                  disabled={isIdeaCreating}
                  allowClear
                >
                  {targetAudienceList?.map((target_audience) => (
                    <Select.Option
                      key={target_audience.id}
                      value={target_audience.id}
                    >
                      {target_audience.prompt}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item> */}

          <Form.Item
            label="Вид контента"
            validateStatus={errors.content_type ? "error" : ""}
            help={errors.content_type && "Заполните это поле."}
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
            label="Тематика"
            validateStatus={errors.theme ? "error" : ""}
            help={errors.theme && "Заполните это поле."}
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
            label="Язык"
            validateStatus={errors.language ? "error" : ""}
            help={errors.language && "Заполните это поле."}
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
            label="Описание"
            validateStatus={errors.description ? "error" : ""}
            help={errors.description && "Заполните это поле."}
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
              Отправить запрос
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
};
