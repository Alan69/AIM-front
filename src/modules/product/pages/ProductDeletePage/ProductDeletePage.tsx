import React from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { useGetProductByIdQuery, useDeleteProductMutation } from '../../redux/api';
import { Layout, Button } from 'antd';
import styles from './ProductDeletePage.module.scss';
import { useGetCompanyByIdQuery } from '../../../company/redux/api';
import Title from 'antd/es/typography/Title';

export const ProductDeletePage = () => {
  const { id, companyId } = useParams<{ id: string, companyId: string }>();
  const navigate = useNavigate();

  const { data: company } = useGetCompanyByIdQuery(companyId || '');
  const { data: product } = useGetProductByIdQuery(id || '');
  const [deleteCompany, { isLoading: isUpdating }] = useDeleteProductMutation();

  const { Content } = Layout;

  const handleDeleteProduct = () => {
    if (company) {
      deleteCompany(product?.id ? product?.id : '').unwrap().then(() => {
        navigate(`/company/${company?.id}`);
      });
    }
  };

  return (
    <Layout>
      <Content style={{ padding: '24px', minHeight: 'calc(100vh - 70px)' }}>
        <h1>Удаление продукта</h1>
        <Layout>
          <Content>
            <div className={styles.companyDescr}>
              <Title level={4} >Вы подтверждаете удаление продукта "{product?.name}"?</Title>
              <div className={styles.buttons}>
                <Button
                  type="primary"
                  danger
                  loading={isUpdating}
                  onClick={handleDeleteProduct}
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
