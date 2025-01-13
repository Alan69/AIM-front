import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Form, Input, Select, Image, Typography } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useGetPostTypesListQuery } from "../../../../redux/api/postTypes/postTypesApi";
import { useGetTextStylesListQuery } from "../../../../redux/api/textStyles/textStylesApi";
import { useGetLanguagesListQuery } from "../../../../redux/api/languages/languagesApi";
import { useLazyGetProductListByCompanyIdQuery } from "modules/product/redux/api";
import { TPostQueryCreateData } from "modules/post-query/redux/api";
import { useTypedSelector } from "hooks/useTypedSelector";
import { useTranslation } from "react-i18next";
import styles from "./PostQueryGenerateForm.module.scss";
import { TPostData } from "modules/post/redux/api";

const { Title, Text } = Typography;

type TProps = {
  post: TPostData | undefined;
  isPostCreating: boolean;
  handleGeneratePost: (updatedData: TPostQueryCreateData) => void;
  handleGetPostById: (id: string) => void;
};

export const PostQueryGenerateForm = ({
  post,
  isPostCreating,
  handleGeneratePost,
  handleGetPostById,
}: TProps) => {
  const { t } = useTranslation();
  const { current_company } = useTypedSelector((state) => state.auth);
  const { isPostGenerated } = useTypedSelector((state) => state.post);
  const [selectedCompany, setSelectedCompany] = useState<string | undefined>();

  const [
    getProductListByCompanyId,
    { data: productList, isLoading: isProductListLoading },
  ] = useLazyGetProductListByCompanyIdQuery();
  const { data: postTypesList, isLoading: isPostTypesListLoading } =
    useGetPostTypesListQuery();
  const { data: textStylesList, isLoading: isTextStylesListLoading } =
    useGetTextStylesListQuery();
  const { data: languagesList, isLoading: isLanguagesListLoading } =
    useGetLanguagesListQuery();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TPostQueryCreateData>({
    defaultValues: {
      content: "",
      company: current_company?.id,
      product: "",
      post_type: "",
      text_style: "",
      lang: "",
    },
  });

  useEffect(() => {
    if (current_company) {
      setValue("company", current_company.id);
      setSelectedCompany(current_company.id);
    }
  }, [current_company, setValue]);

  useEffect(() => {
    if (selectedCompany) {
      getProductListByCompanyId(selectedCompany);
    }
  }, [selectedCompany, getProductListByCompanyId]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (post) {
      const { main_text, title, hashtags, picture, id } = post;

      if (!main_text || !title || !hashtags || picture?.includes("no_img")) {
        interval = setInterval(() => {
          handleGetPostById(id);
        }, 5000);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [post, handleGetPostById]);

  const onSubmit = (data: TPostQueryCreateData) => {
    const updatedData = {
      ...data,
      company: current_company?.id,
    };

    handleGeneratePost(updatedData);
  };

  return (
    <>
      {isPostGenerated ? (
        <div className={styles.postDescr}>
          <div className={styles.container}>
            <div className={styles.mainBlock}>
              <div className={styles.postHeader}>
                <div className={styles.pictureBlock}>
                  {post?.picture?.includes("no_img") ? (
                    <LoadingOutlined className={styles.loader} />
                  ) : (
                    <Image
                      src={post?.picture}
                      className={styles.picture}
                      alt={t(
                        "contentPlanPage.post_query_generate_form.post_image_alt"
                      )}
                    />
                  )}
                </div>
              </div>
              <div className={styles.postContent}>
                <Title level={3}>{post?.title}</Title>
                <Text>{post?.main_text}</Text>

                <div className={styles.postHashtags}>
                  <Text>{post?.hashtags}</Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          asd
          <Form.Item
            label={t("contentPlanPage.post_query_generate_form.company")}
            validateStatus={errors.company ? "error" : ""}
            help={
              errors.company &&
              t("contentPlanPage.post_query_generate_form.field_required")
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
                  value={field.value || selectedCompany}
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
          </Form.Item>
          <Form.Item
            label={
              <span>
                {t("contentPlanPage.post_query_generate_form.product")}{" "}
                <span className={styles.redStar}>*</span>
              </span>
            }
            validateStatus={errors.product ? "error" : ""}
            help={
              errors.product &&
              t("contentPlanPage.post_query_generate_form.field_required")
            }
          >
            <Controller
              name="product"
              control={control}
              rules={{ required: true }}
              disabled={isProductListLoading}
              render={({ field }) => (
                <Select
                  {...field}
                  loading={isProductListLoading}
                  disabled={isPostCreating}
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
                {t("contentPlanPage.post_query_generate_form.post_type")}{" "}
                <span className={styles.redStar}>*</span>
              </span>
            }
            validateStatus={errors.post_type ? "error" : ""}
            help={
              errors.post_type &&
              t("contentPlanPage.post_query_generate_form.field_required")
            }
          >
            <Controller
              name="post_type"
              control={control}
              rules={{ required: true }}
              disabled={isPostTypesListLoading}
              render={({ field }) => (
                <Select {...field} disabled={isPostCreating}>
                  {postTypesList?.map((postType) => (
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
                {t("contentPlanPage.post_query_generate_form.text_style")}{" "}
                <span className={styles.redStar}>*</span>
              </span>
            }
            validateStatus={errors.text_style ? "error" : ""}
            help={
              errors.text_style &&
              t("contentPlanPage.post_query_generate_form.field_required")
            }
          >
            <Controller
              name="text_style"
              control={control}
              rules={{ required: true }}
              disabled={isTextStylesListLoading}
              render={({ field }) => (
                <Select {...field} disabled={isPostCreating}>
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
                {t("contentPlanPage.post_query_generate_form.lang")}{" "}
                <span className={styles.redStar}>*</span>
              </span>
            }
            validateStatus={errors.lang ? "error" : ""}
            help={
              errors.lang &&
              t("contentPlanPage.post_query_generate_form.field_required")
            }
          >
            <Controller
              name="lang"
              control={control}
              rules={{ required: true }}
              disabled={isLanguagesListLoading}
              render={({ field }) => (
                <Select {...field} disabled={isPostCreating}>
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
                {t("contentPlanPage.post_query_generate_form.content")}{" "}
                <span className={styles.redStar}>*</span>
              </span>
            }
            validateStatus={errors.content ? "error" : ""}
            help={
              errors.content &&
              t("contentPlanPage.post_query_generate_form.field_required")
            }
          >
            <Controller
              name="content"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input.TextArea rows={4} {...field} disabled={isPostCreating} />
              )}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isPostCreating}
              block
            >
              {t("contentPlanPage.post_query_generate_form.submit_request")}{" "}
            </Button>
          </Form.Item>
        </Form>
      )}
    </>
  );
};
