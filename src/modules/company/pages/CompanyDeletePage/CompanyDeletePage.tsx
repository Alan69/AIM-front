import React from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { useGetCompanyByIdQuery, useGetCompanyListQuery, useDeleteCompanyMutation } from '../../redux/api';
import { Layout, Button } from 'antd';
import styles from './CompanyDeletePage.module.scss';
import Title from 'antd/es/typography/Title';

export const CompanyDeletePage = () => {
  const { Content } = Layout;

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate()
  const { data: company } = useGetCompanyByIdQuery(id || '');

  const [deleteCompany, { isLoading: isUpdating }] = useDeleteCompanyMutation();
  const { refetch: refetchCompanyList } = useGetCompanyListQuery();

  const handleDeleteCompany = () => {
    if (company) {
      deleteCompany(company?.id).unwrap().then(() => {
        navigate(`/company/create`);
        refetchCompanyList();
      });
    }
  };

  return (
    <Layout>
      <Content style={{ padding: '24px', minHeight: 'calc(100vh - 70px)' }}>
        <h1>Удаление компании</h1>
        <Layout>
          <Content>
            <div className={styles.companyDescr}>
              <Title level={4} >Вы подтверждаете удаление компании "{company?.name}"?</Title>
              <div className={styles.buttons}>
                <Button
                  type="primary"
                  danger
                  loading={isUpdating}
                  onClick={handleDeleteCompany}
                >
                  Удалить
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
            </div>
          </Content>
        </Layout>
      </Content>
    </Layout>
  )
}
