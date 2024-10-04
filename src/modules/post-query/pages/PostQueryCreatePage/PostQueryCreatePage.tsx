import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Layout, Button, Form, Input, Select, message } from 'antd';
import { useGetPostTypesListQuery } from '../../../../redux/api/postTypes/postTypesApi';
import { useGetTextStylesListQuery } from '../../../../redux/api/textStyles/textStylesApi';
import { useGetLanguagesListQuery } from '../../../../redux/api/languages/languagesApi';
import { useLazyGetProductListByCompanyIdQuery } from 'modules/product/redux/api';
import { TPostQuerCreateData, useCreatePostQueryMutation } from 'modules/post-query/redux/api';
import { useTypedSelector } from 'hooks/useTypedSelector';
import { useNavigate } from 'react-router-dom';
import styles from './PostQueryCreatePage.module.scss'

const { Content } = Layout;

export const PostQueryCreatePage = () => {
  const navigate = useNavigate();
  const { current_company } = useTypedSelector((state) => state.auth);
  const [selectedCompany, setSelectedCompany] = useState<string | undefined>();

  const [createPostQuery, { isLoading: isPostCreating }] = useCreatePostQueryMutation();
  const [getProductListByCompanyId, { data: productList, isLoading: isProductListLoading }] = useLazyGetProductListByCompanyIdQuery();
  const { data: postTypesList, isLoading: isPostTypesListLoading } = useGetPostTypesListQuery();
  const { data: textStylesList, isLoading: isTextStylesListLoading } = useGetTextStylesListQuery();
  const { data: languagesList, isLoading: isLanguagesListLoading } = useGetLanguagesListQuery();

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<TPostQuerCreateData>({
    defaultValues: {
      content: '',
      company: '',
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

  const onSubmit = (data: TPostQuerCreateData) => {
    const updatedData = {
      ...data,
      company: current_company?.id,
    };
    createPostQuery(updatedData).unwrap().then((response) => {
      navigate(`/post/${response.post_id}`);
    }).catch((error) => {
      message.error(error.data.error)
    });
  };

  return (
    <Layout>
      <Content className='page-layout'>
        <h1 className='main-title'>Запрос</h1>
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
            {!current_company?.id ? <div className={styles.noContent}>(Если поле пустое, вы можете выбрать или добавить текущую компания в меню слева)</div> : ''}
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
            <Button type="primary" htmlType="submit" loading={isPostCreating}>
              Отправить запрос
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
};