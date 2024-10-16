import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { useUpdateProductMutation, useGetProductByIdQuery, useGetProductListByCompanyIdQuery } from '../../redux/api';
import { useForm, Controller } from 'react-hook-form';
import { Layout, Button, Form, Input } from 'antd';
import styles from './ProductUpdatePage.module.scss';
import { useGetCompanyByIdQuery } from '../../../company/redux/api';
import { useTypedSelector } from 'hooks/useTypedSelector';

type TUpdateProductForm = {
  id: number;
  name: string;
  scope: string;
  comment?: string;
};

const { Content } = Layout;

export const ProductUpdatePage = () => {
  const { user } = useTypedSelector((state) => state.auth);

  const { id, companyId } = useParams<{ id: string, companyId: string }>();
  const { data: company } = useGetCompanyByIdQuery(companyId || '');
  const { data: product, isLoading, isFetching, refetch: refetchProduct } = useGetProductByIdQuery(id || '');
  const { refetch: refetchProductList } = useGetProductListByCompanyIdQuery(company?.id || '');

  const navigate = useNavigate()
  const { control, handleSubmit, reset, formState: { errors } } = useForm<TUpdateProductForm>({
    defaultValues: {
      name: '',
      scope: '',
      comment: '',
    }
  });

  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const onSubmit = (payload: TUpdateProductForm) => {
    if (product) {
      const updatedData = {
        ...payload,
        id: product.id,
        companyId: companyId ? companyId : '',
        author: user?.profile.id,
      };

      updateProduct(updatedData).unwrap().then(() => {
        navigate(`/company/${company?.id}`);
        refetchProductList();
        refetchProduct();
      });
    }
  };

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        scope: product.scope,
        comment: product.comment || '',
      });
    }
  }, [product, reset]);

  useEffect(() => {
    refetchProductList();
    refetchProduct();
  }, [refetchProductList, refetchProduct])

  return (
    <Layout>
      <Content className='page-layout'>
        <h1 className='main-title'>Редактирование данных</h1>
        <Layout>
          <Content>
            <div className={styles.companyDescr}>
              <Form
                layout="vertical"
                onFinish={handleSubmit(onSubmit)}
                className={styles.form}
              >
                <Form.Item
                  label="Название"
                  validateStatus={errors.name ? 'error' : ''}
                  help={errors.name && 'Заполните это поле.'}
                >
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => <Input {...field} />}
                    disabled={isLoading || isFetching || isUpdating}
                  />
                </Form.Item>

                <Form.Item
                  label="Сфера деятельности"
                  validateStatus={errors.scope ? 'error' : ''}
                  help={errors.scope && 'Заполните это поле.'}
                >
                  <Controller
                    name="scope"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => <Input {...field} />}
                    disabled={isLoading || isFetching || isUpdating}
                  />
                </Form.Item>

                <Form.Item label="Описание">
                  <Controller
                    name="comment"
                    control={control}
                    render={({ field }) => <Input.TextArea {...field} />}
                    disabled={isLoading || isFetching || isUpdating}
                  />
                </Form.Item>
                <Form.Item>
                  <div className={styles.buttons}>
                    <Button type="primary" htmlType="submit" disabled={isLoading || isFetching} loading={isUpdating}>
                      Сохранить
                    </Button>
                    <Button
                      type="default"
                      style={{ color: '#faad14', borderColor: '#faad14' }}
                      disabled={isLoading || isFetching}
                      loading={isUpdating}
                      onClick={() => {
                        navigate(`/company/${company?.id}`)
                      }}
                    >
                      Отмена
                    </Button>
                  </div>
                </Form.Item>
              </Form>
            </div>
          </Content>
        </Layout>
      </Content>
    </Layout>
  )
}
