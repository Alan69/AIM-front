import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useCreateCompanyMutation, useGetCompanyListQuery } from '../../redux/api';
import { useForm, Controller } from 'react-hook-form';
import { Layout, Button, Form, Input } from 'antd';
import styles from './CompanyCreatePage.module.scss';
import { useTypedSelector } from 'hooks/useTypedSelector';

type TCreateCompanyForm = {
  name: string;
  scope: string;
  comment?: string;
};

export const CompanyCreatePage = () => {
  const navigate = useNavigate()
  const { user } = useTypedSelector((state) => state.auth);
  const { Content } = Layout;
  const { control, handleSubmit, formState: { errors } } = useForm<TCreateCompanyForm>();
  const [createCompany, { isLoading: isCreating }] = useCreateCompanyMutation();
  const { refetch: refetchCompanyList } = useGetCompanyListQuery();

  const onSubmit = (payload: TCreateCompanyForm) => {
    const updatedData = {
      ...payload,
      author: user?.profile.id,
    };

    createCompany(updatedData).unwrap().then((response) => {
      navigate(`/company/${response.id}`)
      // refetchCompanyList();
    })
  };

  return (
    <Layout>
      <Content style={{ padding: '24px', minHeight: '100vh' }}>
        <h1>Добавление компании</h1>
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
                  <Button type="primary" htmlType="submit" loading={isCreating}>
                    Сохранить
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Content>
        </Layout>
      </Content>
    </Layout>
  )
}
