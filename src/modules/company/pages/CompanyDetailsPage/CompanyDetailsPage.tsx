import React, { ReactNode, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useGetCompanyByIdQuery } from '../../redux/api';

import { Button, Layout, Table, TableProps, Tooltip, Typography, Modal, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import styles from './CompanyDetailsPage.module.scss';
import { TProductData, useGetProductListByCompanyIdQuery } from '../../../product/redux/api';
import {
  TSocialMediaByCurrentCompanyData,
  useGetSocialMediaListByCurrentCompanyQuery,
  useRemovePlatformMutation,
} from 'modules/social-media/redux/api';
import { useTypedSelector } from 'hooks/useTypedSelector';
import { useGetCurrentTargetAudienceQuery } from 'modules/target-audience/redux/api';
import { useTranslation } from 'react-i18next';

interface DataType {
  key: string;
  product_name: string;
  product_assignment: string;
  product_action?: ReactNode;
}
const { Title, Text } = Typography;
const { Content } = Layout;

export const CompanyDetailsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { current_company } = useTypedSelector((state) => state.auth);

  const { data: company, isLoading, refetch } = useGetCompanyByIdQuery(id || '');
  const { data: productListByCompanyId, refetch: refetchProductList } =
    useGetProductListByCompanyIdQuery(company?.id || '');
  const { data: socialMediaList, refetch: refetchSocialMediaList } =
    useGetSocialMediaListByCurrentCompanyQuery();
  const { data: targetAudience, refetch: refetchTargetAudience } =
    useGetCurrentTargetAudienceQuery();
  const [removePlatform, { isLoading: isRemoving }] = useRemovePlatformMutation();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<TSocialMediaByCurrentCompanyData | null>(
    null,
  );

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const showRemovePlatformModal = (item: TSocialMediaByCurrentCompanyData) => {
    setSelectedPlatform(item);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedPlatform(null);
  };

  const handleRemovePlatform = async () => {
    if (selectedPlatform) {
      try {
        await removePlatform(selectedPlatform.id).unwrap();
        message.success(t('company_details.messages.platform_removed'));
        refetchSocialMediaList();
      } catch (error) {
        message.error(t('company_details.messages.error_removing_platform'));
      }
    }
    setIsModalVisible(false);
    setSelectedPlatform(null);
  };

  const columns: TableProps<DataType>['columns'] = [
    {
      title: t('company_details.fields.products'),
      dataIndex: 'product_name',
      key: 'product_name',
      render: (text) => <div>{text}</div>,
      fixed: 'left',
    },
    {
      title: t('company_details.fields.description'),
      dataIndex: 'product_assignment',
      key: 'product_assignment',
    },
    {
      title: t('company_details.fields.actions'),
      dataIndex: 'product_action',
      key: 'product_action',
    },
  ];

  const data: DataType[] =
    productListByCompanyId?.map((product: TProductData) => ({
      key: product.id.toString(),
      product_name: product.name,
      product_assignment: product.scope,
      product_action: (
        <div className={styles.companyDescr__icons}>
          <Link to={`/product/${company?.id}/${product?.id}/update`}>
            <EditOutlined />
          </Link>
          <Link to={`/product/${company?.id}/${product?.id}/delete`}>
            <DeleteOutlined />
          </Link>
        </div>
      ),
    })) || [];

  const newSocialMediaList =
    socialMediaList?.map((item: TSocialMediaByCurrentCompanyData) => ({
      key: item.username,
      platform: item.platform.name,
      username: item.username,
      platform_action: (
        <Button
          type="link"
          shape="circle"
          icon={
            <DeleteOutlined
              onClick={() => showRemovePlatformModal(item)}
              style={{ cursor: 'pointer' }}
            />
          }
        />
      ),
    })) || [];

  const socialMediaListColumns: TableProps<TSocialMediaByCurrentCompanyData>['columns'] = [
    {
      title: t('company_details.fields.social_media'),
      dataIndex: 'platform',
      key: 'platform',
      fixed: 'left',
    },
    {
      title: t('company_details.fields.description'),
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: t('company_details.fields.actions'),
      dataIndex: 'platform_action',
      key: 'platform_action',
    },
  ];

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    refetchSocialMediaList();
    refetchTargetAudience();
    refetchProductList();
  }, [company]);

  useEffect(() => {
    navigate(`/company/${current_company?.id}`);
  }, [current_company]);

  if (isLoading) return <div>Loading...</div>;

  const renderTargetAudienceText = () => {
    const targetText = targetAudience?.text || '';
    const textLines = targetText.split('\n');

    if (textLines.length > 5) {
      return (
        <div>
          <Text>{isExpanded ? targetText : textLines.slice(0, 5).join('\n')}</Text>
          <Button type="link" onClick={handleToggleExpand}>
            {isExpanded
              ? t('company_details.buttons.hide')
              : t('company_details.buttons.show_more')}
          </Button>
        </div>
      );
    }

    return <Text>{targetText}</Text>;
  };

  return (
    <>
      <Layout>
        <Content className="page-layout">
          <h1 className="main-title">{t('company_details.title', { name: company?.name })}</h1>
          <Layout>
            <Content>
              <div className={styles.companyDescr}>
                <div className={styles.companyDescr__title}>
                  <Title level={4}>
                    {t('company_details.fields.scope')}:{' '}
                    <span className={styles.companyDescr__title__value}>{company?.scope}</span>
                  </Title>
                  <div className={styles.companyDescr__icons}>
                    <Link to={`/company/${company?.id}/update`}>
                      <EditOutlined />
                    </Link>
                    <Link to={`/company/${company?.id}/delete`}>
                      <DeleteOutlined />
                    </Link>
                  </div>
                </div>
                <Title level={5}>
                  {t('company_details.fields.description')}: {company?.comment}
                </Title>
              </div>
            </Content>
          </Layout>
          <Layout>
            <h2 className={styles.product__title}>
              {t('company_details.fields.target_audience')}
              <Tooltip title={t('company_details.actions.add_target_audience')}>
                <Button
                  type="primary"
                  shape="circle"
                  className={styles.addButton}
                  icon={<PlusCircleOutlined className={styles.addIcon} />}
                  onClick={() => navigate('/target-audience/create')}
                />
              </Tooltip>
            </h2>
            <Content>
              <div
                className={styles.companyDescr}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}>
                {targetAudience?.text ? (
                  renderTargetAudienceText()
                ) : (
                  <Text>{t('company_details.placeholders.no_target_audience')}</Text>
                )}
                {targetAudience?.text ? (
                  <Link to={`/target-audience/${targetAudience?.id}/update`}>
                    <EditOutlined />
                  </Link>
                ) : (
                  ''
                )}
              </div>
            </Content>
          </Layout>
          <Layout>
            <h2 className={styles.product__title}>
              {t('company_details.fields.products')}
              <Tooltip title={t('company_details.actions.add_product')}>
                <Button
                  type="primary"
                  shape="circle"
                  className={styles.addButton}
                  icon={<PlusCircleOutlined />}
                  onClick={() => navigate(`/product/${company?.id}/create`)}
                />
              </Tooltip>
            </h2>
            <Content>
              <div className={styles.companyDescr}>
                {!productListByCompanyId?.length ? (
                  <div style={{ paddingBottom: '12px' }}>
                    <Text>{t('company_details.placeholders.no_products')}</Text>
                  </div>
                ) : (
                  ''
                )}
                <Table
                  columns={columns}
                  dataSource={data}
                  pagination={false}
                  scroll={{ x: 'max-content' }}
                />
              </div>
            </Content>
          </Layout>
          <Layout>
            <h2 className={styles.product__title}>
              {t('company_details.fields.social_media')}
              <Tooltip title={t('company_details.actions.add_social_media')}>
                <Button
                  type="primary"
                  shape="circle"
                  className={styles.addButton}
                  icon={<PlusCircleOutlined />}
                  onClick={() => navigate(`/social-media/${company?.id}/add`)}
                />
              </Tooltip>
            </h2>
            <Content>
              <div className={styles.companyDescr}>
                {!productListByCompanyId?.length ? (
                  <div style={{ paddingBottom: '12px' }}>
                    <Text>{t('company_details.placeholders.no_social_media')}</Text>
                  </div>
                ) : (
                  ''
                )}
                <Table
                  // @ts-ignore
                  columns={socialMediaListColumns}
                  dataSource={newSocialMediaList}
                  pagination={false}
                  scroll={{ x: 'max-content' }}
                />
              </div>
            </Content>
          </Layout>
        </Content>
      </Layout>
      <Modal
        title={t('company_details.modals.confirm_deletion')}
        visible={isModalVisible}
        onOk={handleRemovePlatform}
        onCancel={handleModalCancel}
        confirmLoading={isRemoving}>
        <Text>
          {t('company_details.modals.confirm_delete_message', {
            platform: selectedPlatform?.platform.name,
            username: selectedPlatform?.username,
          })}
        </Text>
      </Modal>
    </>
  );
};
