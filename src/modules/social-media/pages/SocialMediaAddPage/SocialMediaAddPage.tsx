import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { Layout, Button, Form, Input, Typography } from 'antd';
import styles from './SocialMediaAddPage.module.scss';
import { TSocialMediaData, useLazyAddTelegramQuery, useLazyAddTwitterQuery, useGetSocialMediaListQuery, useLazyGetTwitterCallbackQuery, useLazyAddLinkedinQuery, useLazyAddTumblrQuery } from 'modules/social-media/redux/api';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

export const SocialMediaAddPage = () => {
  const { data: socialMediaList, refetch: refetchSocialMediaList } = useGetSocialMediaListQuery();
  const [addTelegram] = useLazyAddTelegramQuery();
  const [addTwitter] = useLazyAddTwitterQuery();
  const [getTwitterCallback] = useLazyGetTwitterCallbackQuery();
  const [addLinkedin] = useLazyAddLinkedinQuery();
  const [addTumblr] = useLazyAddTumblrQuery();


  const navigate = useNavigate();
  // const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  // const { refetch: refetchProductList } = useGetProductListByCompanyIdQuery(companyId || '');

  // useEffect(() => {
  //   refetchProductList();
  // }, [refetchProductList])

  const handleAddSocialMedia = (item: TSocialMediaData) => {
    if (item.name === 'telegram') {
      addTelegram().unwrap().then((res) => {
        if (res.auth_url) {
          window.open(res.auth_url, '_self');
        }
      }).catch((err) => {
        console.error("Error adding Telegram:", err);
      });
    }

    if (item.name === 'twitter') {
      addTwitter().unwrap().then((res) => {
        if (res.auth_url) {
          window.open(res.auth_url, '_self');
        }
      }).catch((err) => {
        console.error("Error adding Twitter:", err);
      });
    }

    if (item.name === 'linkedin') {
      addLinkedin().unwrap().then((authUrl) => {
        window.open(authUrl, '_self');
      }).catch((err) => {
        console.error("Error adding LinkedIn:", err);
      });
    }

    if (item.name === 'tumblr') {
      addTumblr().unwrap().then((authUrl) => {
        window.open(authUrl, '_self');
      }).catch((err) => {
        console.error("Error adding tumblr:", err);
      });
    }
  };


  return (
    <Layout>
      <Content className='page-layout'>
        <h1 className='main-title'>Добавление социальной сети</h1>
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
