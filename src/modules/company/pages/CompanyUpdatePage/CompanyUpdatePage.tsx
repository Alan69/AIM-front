import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { useUpdateCompanyMutation, useGetCompanyByIdQuery, useGetCompanyListQuery } from '../../redux/api';
import { useForm, Controller } from 'react-hook-form';
import { Layout, Button, Form, Input } from 'antd';
import styles from './CompanyUpdatePage.module.scss';
import { useTypedSelector } from 'hooks/useTypedSelector';

type TUpdateCompanyForm = {
  id: number;
  name: string;
  scope: string;
  comment?: string;
};

export const CompanyUpdatePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useTypedSelector((state) => state.auth);

  const { data: company } = useGetCompanyByIdQuery(id || '');
  const navigate = useNavigate()
  const { Content } = Layout;
  const { control, handleSubmit, reset, formState: { errors } } = useForm<TUpdateCompanyForm>({
    defaultValues: {
      name: '',
      scope: '',
      comment: '',
    }
  });

  const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyMutation();
  const { refetch: refetchCompanyList } = useGetCompanyListQuery();

  const onSubmit = (payload: TUpdateCompanyForm) => {
    const updatedData = {
      ...payload,
      author: user?.profile.id,
    };

    if (company) {
      updateCompany({ ...updatedData, id: company.id }).unwrap().then((response) => {
        navigate(`/company/${response.id}`);
      });
    }
    // refetchCompanyList();
  };

  useEffect(() => {
    if (company) {
      reset({
        name: company.name,
        scope: company.scope,
        comment: company.comment || '',
      });
    }
  }, [company, reset]);

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
                      style={{ color: '#faad14', borderColor: '#faad14' }}
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
