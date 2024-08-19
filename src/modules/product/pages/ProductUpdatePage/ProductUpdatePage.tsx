import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { useUpdateProductMutation, useGetProductByIdQuery } from '../../redux/api';
import { useForm, Controller } from 'react-hook-form';
import { Layout, Button, Form, Input } from 'antd';
import styles from './ProductUpdatePage.module.scss';
import { useGetCompanyByIdQuery } from '../../../company/redux/api';

type TUpdateProductForm = {
  id: number;
  name: string;
  scope: string;
  comment?: string;
};

export const ProductUpdatePage = () => {
  const { Content } = Layout;
  const { id, companyId } = useParams<{ id: string, companyId: string }>();
  const { data: company } = useGetCompanyByIdQuery(companyId || '');
  const { data: product } = useGetProductByIdQuery(id || '');
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
      updateProduct({ ...payload, id: product.id, companyId: Number(companyId) }).unwrap().then(() => {
        navigate(`/company/${company?.id}`);
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

  return (
    <Layout>
      <Content style={{ padding: '24px', minHeight: '100vh' }}>
        <h1>Редактирование данных</h1>
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
                  />
                </Form.Item>

                <Form.Item label="Описание">
                  <Controller
                    name="comment"
                    control={control}
                    render={({ field }) => <Input.TextArea {...field} />}
                  />
                </Form.Item>
                <Form.Item>
                  <div className={styles.buttons}>
                    <Button type="primary" htmlType="submit" loading={isUpdating}>
                      Сохранить
                    </Button>
                    <Button
                      type="default"
                      onClick={() => {
                        navigate(`/company/${company?.id}`)
                      }}
                      loading={isUpdating}>
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
