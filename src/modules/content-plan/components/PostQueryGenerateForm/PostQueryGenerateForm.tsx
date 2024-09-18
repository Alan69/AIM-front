import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button, Form, Input, Select, Image, Typography, Checkbox } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useGetPostTypesListQuery } from '../../../../redux/api/postTypes/postTypesApi';
import { useGetTextStylesListQuery } from '../../../../redux/api/textStyles/textStylesApi';
import { useGetLanguagesListQuery } from '../../../../redux/api/languages/languagesApi';
import { useLazyGetProductListByCompanyIdQuery } from 'modules/product/redux/api';
import { TPostQuerCreateData, useCreatePostQueryMutation } from 'modules/post-query/redux/api';
import { useTypedSelector } from 'hooks/useTypedSelector';
import styles from './PostQueryGenerateForm.module.scss';
import { useLazyGetPostByIdQuery } from 'modules/post/redux/api';
import { useDispatch } from 'react-redux';
import { postActions } from 'modules/post/redux/slices/post.slice';

const { Title, Text } = Typography;

export const PostQueryGenerateForm = () => {
  const dispatch = useDispatch();
  const { current_company } = useTypedSelector((state) => state.auth);
  const { isPostCreated } = useTypedSelector((state) => state.post);
  const [selectedCompany, setSelectedCompany] = useState<string | undefined>();

  const [createPost, { isLoading: isPostCreating }] = useCreatePostQueryMutation();
  const [getProductListByCompanyId, { data: productList, isLoading: isProductListLoading }] = useLazyGetProductListByCompanyIdQuery();
  const [getPostById, { data: post, isLoading: isPostLoading }] = useLazyGetPostByIdQuery();
  const { data: postTypesList, isLoading: isPostTypesListLoading } = useGetPostTypesListQuery();
  const { data: textStylesList, isLoading: isTextStylesListLoading } = useGetTextStylesListQuery();
  const { data: languagesList, isLoading: isLanguagesListLoading } = useGetLanguagesListQuery();

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<TPostQuerCreateData>({
    defaultValues: {
      content: '',
      company: current_company?.id,
      product: '',
      post_type: '',
      text_style: '',
      lang: ''
    }
  });

  useEffect(() => {
    if (current_company) {
      setValue('company', current_company.id);
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

      if (!main_text || !title || !hashtags || picture?.includes('no_img')) {
        interval = setInterval(() => {
          getPostById(id);
        }, 5000);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [post, getPostById]);

  const onSubmit = (data: TPostQuerCreateData) => {
    const updatedData = {
      ...data,
      company: current_company?.id,
    };

    createPost(updatedData).unwrap().then((response) => {
      getPostById(response.id).unwrap().then(() => {
        dispatch(postActions.setPostCreated(true));
      })
    });
  };

  return (
    <>
      {isPostCreated ?
        <div className={styles.postDescr}>
          <div className={styles.container}>
            <div className={styles.mainBlock}>
              <div className={styles.postHeader}>
                <div className={styles.pictureBlock}>
                  {post?.picture?.includes('no_img') ?
                    <LoadingOutlined className={styles.loader} />
                    :
                    <Image
                      src={post?.picture}
                      className={styles.picture}
                      alt="Post Image"
                    />
                  }
                </div>
              </div>
              <div className={styles.postContent}>
                <Title level={3}>{post?.title}</Title>
                <Text>{post?.main_text}</Text>

                <div className={styles.postHashtags}>
                  <Text>{post?.hashtags}</Text>
                </div>
              </div>
              <div className={styles.postLike}>
                <Text>Лайк</Text>
                <Checkbox checked={post?.like}></Checkbox>
              </div>
            </div>
          </div>
        </div> :
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item label="Компания" validateStatus={errors.company ? 'error' : ''} help={errors.company && 'Заполните это поле.'}>
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
                  <Select.Option key={current_company?.id} value={current_company?.id}>
                    {current_company?.name}
                  </Select.Option>
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item label="Продукт" validateStatus={errors.product ? 'error' : ''} help={errors.product && 'Заполните это поле.'}>
            <Controller
              name="product"
              control={control}
              rules={{ required: true }}
              disabled={isProductListLoading}
              render={({ field }) => (
                <Select {...field} loading={isProductListLoading} disabled={isPostCreating}>
                  {productList?.map((product) => (
                    <Select.Option key={product.id} value={product.id}>
                      {product.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item label="Тип поста" validateStatus={errors.post_type ? 'error' : ''} help={errors.post_type && 'Заполните это поле.'}>
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

          <Form.Item label="Стилистика" validateStatus={errors.text_style ? 'error' : ''} help={errors.text_style && 'Заполните это поле.'}>
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

          <Form.Item label="Язык" validateStatus={errors.lang ? 'error' : ''} help={errors.lang && 'Заполните это поле.'}>
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
                      const aIsStarred = a.name.startsWith('*');
                      const bIsStarred = b.name.startsWith('*');
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

          <Form.Item label="Описание" validateStatus={errors.content ? 'error' : ''} help={errors.content && 'Заполните это поле.'}>
            <Controller
              name="content"
              control={control}
              rules={{ required: true }}
              render={({ field }) => <Input.TextArea rows={4} {...field} disabled={isPostCreating} />}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isPostCreating} block>
              Отправить запрос
            </Button>
          </Form.Item>
        </Form>
      }
    </>
  );
};