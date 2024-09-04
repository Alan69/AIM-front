import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Layout, Button, Form, Input, Select } from 'antd';
import { useGetCompanyListQuery } from 'modules/company/redux/api';
import { useGetPostTypesListQuery } from '../../../../redux/api/postTypes/postTypesApi';
import { useGetTextStylesListQuery } from '../../../../redux/api/textStyles/textStylesApi';
import { useGetLanguagesListQuery } from '../../../../redux/api/languages/languagesApi';
import { useLazyGetProductListByCompanyIdQuery } from 'modules/product/redux/api';
import { TPostQueryData, useCreatePostQueryMutation } from 'modules/post-query/redux/api';
import { useTypedSelector } from 'hooks/useTypedSelector';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { postActions } from 'modules/post/redux/slices/post.slice';

const { Content } = Layout;

export const PostQueryCreatePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useTypedSelector((state) => state.auth);
  const [selectedCompany, setSelectedCompany] = useState();
  const { data: companyList, isLoading: isCompanyListLoading } = useGetCompanyListQuery()
  const [getProductListByCompanyId, { data: productList, isLoading: isProductListLoading }] = useLazyGetProductListByCompanyIdQuery();
  const { data: postTypesList, isLoading: isPostTypesListLoading } = useGetPostTypesListQuery()
  const { data: textStylesList, isLoading: isTextStylesListLoading } = useGetTextStylesListQuery()
  const { data: languagesList, isLoading: isLanguagesListLoading } = useGetLanguagesListQuery()
  const [createPost, { isLoading: isPostCreating }] = useCreatePostQueryMutation()
  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<TPostQueryData>({
    defaultValues: {
      content: '',
      company: null,
      product: null,
      post_type: null,
      text_style: null,
      lang: null,
      author: ''
    }
  });

  useEffect(() => {
    reset({
      content: '',
      company: null,
      product: null,
      post_type: null,
      text_style: null,
      author: ''
    });
  }, [reset]);

  useEffect(() => {
    if (selectedCompany) {
      getProductListByCompanyId(selectedCompany);
    }
  }, [selectedCompany, getProductListByCompanyId]);

  const onSubmit = (data: TPostQueryData) => {
    if (user) {
      const updatedData = {
        ...data,
        author: user?.profile.id,
      };
      createPost(updatedData).unwrap().then((response) => {
        // dispatch(postActions.setPostCreated(true));
        navigate(`/post/${response.post_id}`);
      });
    }
  };

  return (
    <Layout>
      <Content style={{ padding: '24px', minHeight: 'calc(100vh - 70px)' }}>
        <h1>Запрос</h1>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item label="Компания" validateStatus={errors.company ? 'error' : ''} help={errors.company && 'Заполните это поле.'}>
            <Controller
              name="company"
              control={control}
              rules={{ required: true }}
              disabled={isCompanyListLoading}
              render={({ field }) => (
                <Select
                  {...field}
                  loading={isCompanyListLoading}
                  disabled={isPostCreating}
                  onChange={(value) => {
                    field.onChange(value);
                    // @ts-ignore
                    setSelectedCompany(value);
                    setValue('product', null);
                  }}
                >
                  {companyList?.map((company) => (
                    <Select.Option key={company.id} value={company.id}>
                      {company.name}
                    </Select.Option>
                  ))}
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
                  {languagesList?.map((language) => (
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
            <Button type="primary" htmlType="submit" loading={isPostCreating}>
              Отправить запрос
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
};