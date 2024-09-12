import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { Layout, Button, Form, Input, Typography } from 'antd';
import styles from './SocialMediaAddPage.module.scss';
import { useTypedSelector } from 'hooks/useTypedSelector';
import { TSocialMediaData, useAddTelegramMutation, useGetSocialMediaListQuery } from 'modules/social-media/redux/api';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

export const SocialMediaAddPage = () => {
  const { data: socialMediaList, refetch: refetchSocialMediaList } = useGetSocialMediaListQuery();
  const [addTelegram] = useAddTelegramMutation();

  const { current_company } = useTypedSelector((state) => state.auth);

  const navigate = useNavigate();
  // const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  // const { refetch: refetchProductList } = useGetProductListByCompanyIdQuery(companyId || '');

  // useEffect(() => {
  //   refetchProductList();
  // }, [refetchProductList])

  const handleAddSocialMedia = (item: TSocialMediaData) => {
    if (item.name === 'telegram') {
      addTelegram(current_company?.id).unwrap().then((res) => {
        if (res.auth_url) {
          // window.open(res.auth_url, '_self');
        }
      }).catch((err) => {
        console.error("Error adding Telegram:", err);
      });
    }
  };


  return (
    <Layout>
      <Content style={{ padding: '24px', minHeight: 'calc(100vh - 70px)' }}>
        <h1>Добавление социальной сети</h1>
        <Layout>
          <Content>
            <div className={styles.list}>
              {socialMediaList?.map((item) => (
                <div key={item.id} className={styles.list__item} onClick={() => handleAddSocialMedia(item)}>
                  <Title level={4} className={styles.list__item__title}>{item.name}</Title>
                  <img src={item.icon} alt={item.name} />
                </div>
              ))}
            </div>
          </Content>
        </Layout>
      </Content>
    </Layout>
  )
}
