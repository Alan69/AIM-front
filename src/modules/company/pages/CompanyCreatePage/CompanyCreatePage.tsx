import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useCreateCompanyMutation, useGetCompanyListQuery, useUpdateCurrentCompanyMutation } from '../../redux/api';
import { useForm, Controller } from 'react-hook-form';
import { Layout, Button, Form, Input, message } from 'antd';
import styles from './CompanyCreatePage.module.scss';
import { useTypedSelector } from 'hooks/useTypedSelector';
import { useLazyGetAuthUserQuery } from 'modules/auth/redux/api';

type TCreateCompanyForm = {
  name: string;
  scope: string;
  comment?: string;
};

const { Content } = Layout;

export const CompanyCreatePage = () => {
  const navigate = useNavigate()
  const { user } = useTypedSelector((state) => state.auth);
  const { control, handleSubmit, formState: { errors } } = useForm<TCreateCompanyForm>();
  const [createCompany, { isLoading: isCreating }] = useCreateCompanyMutation();
  const { refetch: refetchCompanyList } = useGetCompanyListQuery(user?.profile.id);
  const [updateCurrentCompany] = useUpdateCurrentCompanyMutation();
  const [getAuthUser] = useLazyGetAuthUserQuery();

  const onSubmit = (payload: TCreateCompanyForm) => {
    const updatedData = {
      ...payload,
      author: user?.profile.id,
    };

    createCompany(updatedData).unwrap().then((response) => {
      updateCurrentCompany(response.id).unwrap().then(() => {
        navigate(`/company/${response.id}`);
        refetchCompanyList();
        getAuthUser();
      });
    }).catch((error) => {
      error.data.error && message.error(error.data.error)
      error.data.comment[0] && message.error(error.data.comment[0])
    })
  };

  return (
    <Layout>
      <Content className='page-layout'>
        <h1 className='main-title'>Добавление компании</h1>
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
