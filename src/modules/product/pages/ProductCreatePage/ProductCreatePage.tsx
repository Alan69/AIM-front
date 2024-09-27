import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateProductMutation, useGetProductListByCompanyIdQuery } from '../../redux/api';
import { useForm, Controller } from 'react-hook-form';
import { Layout, Button, Form, Input } from 'antd';
import styles from './ProductCreatePage.module.scss';
import { useTypedSelector } from 'hooks/useTypedSelector';

type TCreateProductForm = {
  name: string;
  scope: string;
  comment?: string;
  company: string
};

const { Content } = Layout;

export const ProductCreatePage = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const { user } = useTypedSelector((state) => state.auth);

  const navigate = useNavigate()
  const { control, handleSubmit, formState: { errors } } = useForm<TCreateProductForm>();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const { refetch: refetchProductList } = useGetProductListByCompanyIdQuery(companyId || '');

  const onSubmit = (payload: TCreateProductForm) => {
    const updatedData = {
      ...payload,
      author: user?.profile.id,
      companyId: companyId ? companyId : ''
    };

    createProduct(updatedData).unwrap().then(() => {
      navigate(`/company/${companyId}`);
      refetchProductList();
    })
  };

  useEffect(() => {
    refetchProductList();
  }, [refetchProductList])

  return (
    <Layout>
      <Content style={{ padding: '24px', minHeight: 'calc(100vh - 70px)' }}>
        <h1>Добавление продукта</h1>
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
                  label="Назначение"
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
                  <div className={styles.postActions}>
                    <Button type="primary" htmlType="submit" loading={isCreating}>
                      Сохранить
                    </Button>
                    <Button
                      htmlType="button"
                      style={{ color: '#faad14', borderColor: '#faad14' }}
                      onClick={() => navigate(-1)}
                    >
                      Отменить
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
