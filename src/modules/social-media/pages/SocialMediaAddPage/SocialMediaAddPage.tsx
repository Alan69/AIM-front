import React from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Button, Typography, message } from "antd";
import styles from "./SocialMediaAddPage.module.scss";
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
} from "modules/social-media/redux/api";

const { Content } = Layout;
const { Title } = Typography;

export const SocialMediaAddPage = () => {
  const navigate = useNavigate();

  const { data: socialMediaList } = useGetSocialMediaListQuery();
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

  const addSocialMediaActions: any = {
    instagram: addInstagram,
    facebook: addFacebook,
    linkedin: addLinkedin,
    reddit: addReddit,
    snapchat: addSnapchat,
    telegram: addTelegram,
    tiktok: addTiktok,
    tumblr: addTumblr,
    twitter: addTwitter,
    vk: addVk,
  };

  const handleAddSocialMedia = (item: TSocialMediaData) => {
    const addAction = addSocialMediaActions[item.name];

    if (addAction) {
      addAction()
        .unwrap()
        .then((authUrl: string) => {
          if (authUrl) window.open(authUrl, "_self");
        })
        .catch((err: string) => {
          message.error(
            `Error adding ${item.name.charAt(0).toUpperCase() + item.name.slice(1)}: ${err}`
          );
        });
    } else {
      message.error("Social media integration not available.");
    }
  };

  return (
    <Layout>
      <Content className="page-layout">
        <h1 className="main-title">Добавление социальной сети</h1>
        <Layout>
          <Content className={styles.wrapper}>
            <div className={styles.list}>
              {socialMediaList?.map((item) => (
                <div
                  key={item.id}
                  className={styles.list__item}
                  onClick={() => handleAddSocialMedia(item)}
                >
                  <Title level={4} className={styles.list__item__title}>
                    {item.name}
                  </Title>
                  <img src={item.icon} alt={item.name} />
                </div>
              ))}
            </div>

            <Button
              htmlType="button"
              className={styles.backBtn}
              type="default"
              onClick={() => navigate(-1)}
            >
              Назад
            </Button>
          </Content>
        </Layout>
      </Content>
    </Layout>
  );
};
