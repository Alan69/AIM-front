import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { Layout, Button, Form, Input, Typography, message } from 'antd';
import styles from './SocialMediaAddPage.module.scss';
import {
  TSocialMediaData,
  useGetSocialMediaListQuery,
  useLazyAddFacebookQuery,
  useLazyAddInstagramQuery,
  useLazyAddLinkedinQuery,
  useLazyAddRedditQuery,
  useLazyAddSnapchatQuery,
  useLazyAddTelegramQuery,
  useLazyAddTiktokQuery,
  useLazyAddTumblrQuery,
  useLazyAddTwitterQuery,
  useLazyAddVkQuery,
} from 'modules/social-media/redux/api';
import { useTypedSelector } from 'hooks/useTypedSelector';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

export const SocialMediaAddPage = () => {
  const navigate = useNavigate();

  const { current_company } = useTypedSelector((state) => state.auth);

  const { data: socialMediaList, refetch: refetchSocialMediaList } = useGetSocialMediaListQuery();
  const [addFacebook] = useLazyAddFacebookQuery();
  const [addInstagram] = useLazyAddInstagramQuery();
  const [addLinkedin] = useLazyAddLinkedinQuery();
  const [addReddit] = useLazyAddRedditQuery();
  const [addSnapchat] = useLazyAddSnapchatQuery();
  const [addTelegram] = useLazyAddTelegramQuery();
  const [addTiktok] = useLazyAddTiktokQuery();
  const [addTumblr] = useLazyAddTumblrQuery();
  const [addTwitter] = useLazyAddTwitterQuery();
  const [addVk] = useLazyAddVkQuery();

  // const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  // const { refetch: refetchProductList } = useGetProductListByCompanyIdQuery(companyId || '');

  // useEffect(() => {
  //   refetchProductList();
  // }, [refetchProductList])

  const handleAddSocialMedia = (item: TSocialMediaData) => {
    if (item.name === 'instagram') {
      addInstagram().unwrap().then((res) => {
        if (res.auth_url) {
          window.open(res.auth_url, '_self');
        }
      }).catch((err) => {
        message.error("Error adding Instagram:", err);
      });
    }

    if (item.name === 'facebook') {
      addFacebook().unwrap().then((res) => {
        if (res.auth_url) {
          window.open(res.auth_url, '_self');
        }
      }).catch((err) => {
        message.error("Error adding Facebook:", err);
      });
    }

    if (item.name === 'telegram') {
      addTelegram().unwrap().then((res) => {
        if (res.auth_url) {
          window.open(res.auth_url, '_self');
        }
      }).catch((err) => {
        message.error("Error adding Telegram:", err);
      });
    }

    if (item.name === 'linkedin') {
      addLinkedin().unwrap().then((authUrl) => {
        window.open(authUrl, '_self');
      }).catch((err) => {
        message.error("Error adding LinkedIn:", err);
      });
    }

    if (item.name === 'reddit') {
      addReddit().unwrap().then((authUrl) => {
        window.open(authUrl, '_self');
      }).catch((err) => {
        message.error("Error adding Reddit:", err);
      });
    }

    if (item.name === 'snapchat') {
      addSnapchat().unwrap().then((authUrl) => {
        window.open(authUrl, '_self');
      }).catch((err) => {
        message.error("Error adding Snapchat:", err);
      });
    }

    if (item.name === 'tiktok') {
      addTiktok().unwrap().then((authUrl) => {
        window.open(authUrl, '_self');
      }).catch((err) => {
        message.error("Error adding Tiktok:", err);
      });
    }

    if (item.name === 'tumblr') {
      addTumblr().unwrap().then((authUrl) => {
        window.open(authUrl, '_self');
      }).catch((err) => {
        message.error("Error adding Tumblr:", err);
      });
    }

    if (item.name === 'twitter') {
      addTwitter().unwrap().then((res) => {
        if (res.auth_url) {
          window.open(res.auth_url, '_self');
        }
      }).catch((err) => {
        message.error("Error adding Twitter:", err);
      });
    }

    if (item.name === 'vk') {
      addVk().unwrap().then((res) => {
        if (res.auth_url) {
          window.open(res.auth_url, '_self');
        }
      }).catch((err) => {
        message.error("Error adding Vk:", err);
      });
    }
  };

  return (
    <Layout>
      <Content className='page-layout'>
        <h1 className='main-title'>Добавление социальной сети</h1>
        <Layout>
          <Content className={styles.wrapper}>
            <div className={styles.list}>
              {socialMediaList?.map((item) => (
                <div key={item.id} className={styles.list__item} onClick={() => handleAddSocialMedia(item)}>
                  <Title level={4} className={styles.list__item__title}>{item.name}</Title>
                  <img src={item.icon} alt={item.name} />
                </div>
              ))}
            </div>
            <Button
              htmlType="button"
              className={styles.backBtn}
              style={{ color: '#faad14', borderColor: '#faad14' }}
              onClick={() => navigate('/company/current_company?.id/')}
            >
              Назад
            </Button>
          </Content>
        </Layout>
      </Content>
    </Layout>
  )
}
