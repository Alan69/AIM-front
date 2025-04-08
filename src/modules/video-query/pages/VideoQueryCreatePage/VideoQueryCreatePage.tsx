import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { Layout, Button, Form, Input, Select, Switch, message } from "antd";
import { useTypedSelector } from "hooks/useTypedSelector";
import {
  TVideoQueryCreateData,
  useCreateVideoQueryMutation,
} from "modules/video-query/redux/api";
import { useGetVideoTypesListQuery } from "../../../../redux/api/videoTypes/videoTypesApi";
import { useGetTextStylesListQuery } from "../../../../redux/api/textStyles/textStylesApi";
import { useGetLanguagesListQuery } from "../../../../redux/api/languages/languagesApi";
import { useLazyGetProductListByCompanyIdQuery } from "modules/product/redux/api";
import { useTranslation } from "react-i18next";
import styles from "./VideoQueryCreatePage.module.scss";

const { Content } = Layout;

export const VideoQueryCreatePage = () => {
  const navigate = useNavigate();
  const { current_company } = useTypedSelector((state) => state.auth);
  const { t } = useTranslation();

  const [createVideoQuery, { isLoading: isVideoCreating }] =
    useCreateVideoQueryMutation();
  const [
    getProductListByCompanyId,
    { data: productList, isLoading: isProductListLoading },
  ] = useLazyGetProductListByCompanyIdQuery();
  const { data: videoTypesList, isLoading: isVideoTypesListLoading } =
    useGetVideoTypesListQuery();
  const { data: textStylesList, isLoading: isTextStylesListLoading } =
    useGetTextStylesListQuery();
  const { data: languagesList, isLoading: isLanguagesListLoading } =
    useGetLanguagesListQuery();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TVideoQueryCreateData>({
    defaultValues: {
      content: "",
      company: "",
      product: "",
      post_type: "",
      text_style: "",
      lang: "",
      with_image: false,
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

  const onSubmit = (data: TVideoQueryCreateData) => {
    console.log('Form data before submission:', data);
    
    if (!current_company?.id) {
      message.error("Company is required");
      return;
    }
    
    const updatedData: TVideoQueryCreateData = {
      ...data,
      company: current_company.id,
      with_image: data.with_image,
    };
    
    console.log('Updated data for submission:', updatedData);
    createVideoQuery(updatedData)
      .unwrap()
      .then((response) => {
        if (response.error_message) {
          message.warning(response.error_message);
        }
        navigate(`/video/${response.video_id}`);
      })
      .catch((error) => {
        message.error(error.data.error);
      });
  };

  return (
    <Layout>
      <Content className="page-layout">
        <h1 className="main-title">{t("videoQueryCreatePage.title")}</h1>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label={t("videoQueryCreatePage.fields.company")}
            validateStatus={errors.company ? "error" : ""}
            help={errors.company && t("videoQueryCreatePage.errors.required")}
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
                {t("videoQueryCreatePage.no_company")}
              </div>
            )}
          </Form.Item>

          <Form.Item label={t("videoQueryCreatePage.fields.product")}>
            <Controller
              name="product"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  loading={isProductListLoading}
                  disabled={isVideoCreating}
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
                {t("videoQueryCreatePage.fields.video_type")}{" "}
                <span className={styles.redStar}>*</span>
              </span>
            }
            validateStatus={errors.post_type ? "error" : ""}
            help={errors.post_type && t("videoQueryCreatePage.errors.required")}
          >
            <Controller
              name="post_type"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select {...field} disabled={isVideoCreating || isVideoTypesListLoading}>
                  {videoTypesList?.map((videoType) => (
                    <Select.Option key={videoType.id} value={videoType.id}>
                      {videoType.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item
            label={
              <span>
                {t("videoQueryCreatePage.fields.text_style")}{" "}
                <span className={styles.redStar}>*</span>
              </span>
            }
            validateStatus={errors.text_style ? "error" : ""}
            help={errors.text_style && t("videoQueryCreatePage.errors.required")}
          >
            <Controller
              name="text_style"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select {...field} disabled={isVideoCreating || isTextStylesListLoading}>
                  {textStylesList?.map((textStyle) => (
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
                {t("videoQueryCreatePage.fields.lang")}{" "}
                <span className={styles.redStar}>*</span>
              </span>
            }
            validateStatus={errors.lang ? "error" : ""}
            help={errors.lang && t("videoQueryCreatePage.errors.required")}
          >
            <Controller
              name="lang"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select {...field} disabled={isVideoCreating || isLanguagesListLoading}>
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
            label={"Создать обложку"}
            tooltip={"Включить/выключить генерацию обложки"}
            className={styles.withThumbnailSwitch}
          >
            <Controller
              name="with_image"
              control={control}
              defaultValue={false}
              render={({ field: { value, onChange } }) => (
                <Switch 
                  checked={value}
                  onChange={onChange}
                  disabled={isVideoCreating}
                  checkedChildren={"Да"}
                  unCheckedChildren={"Нет"}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={
              <span>
                {t("videoQueryCreatePage.fields.content")}{" "}
                <span className={styles.redStar}>*</span>
              </span>
            }
            validateStatus={errors.content ? "error" : ""}
            help={errors.content && t("videoQueryCreatePage.errors.required")}
          >
            <Controller
              name="content"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input.TextArea rows={4} {...field} disabled={isVideoCreating} />
              )}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isVideoCreating}>
              {t("videoQueryCreatePage.submit_button")}
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
}; 