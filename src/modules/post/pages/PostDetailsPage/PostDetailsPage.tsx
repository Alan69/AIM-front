import { useNavigate, useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useGetPostByIdQuery, usePostNowMutation, useRecreatePostImageMutation, useRecreatePostTextMutation } from '../../redux/api';
import { Layout, Typography, Image, Button, Collapse, Checkbox, Radio, Input, message } from 'antd';
import {
  ReloadOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import styles from './PostDetailsPage.module.scss';
import { useTypedSelector } from 'hooks/useTypedSelector';
import avatar from 'assets/avatar.png';
import { Controller, useForm } from 'react-hook-form';
import { ModalImageStylesList } from 'modules/post-query/components/ModalImageStylesList/ModalImageStylesList';
import { TImgStylesData, useGetImgStylesListQuery } from '../../../../redux/api/imgStyles/imgStylesApi';
import { ContentPlanSocialMediaListModal } from 'modules/content-plan/components/ContentPlanSocialMediaListModal/ContentPlanSocialMediaListModal';
import { useGetSocialMediaListByCurrentCompanyQuery, TSocialMediaByCurrentCompanyData } from 'modules/social-media/redux/api';
import { ContentPlanAddPostModal } from 'modules/content-plan/components/ContentPlanAddPostModal/ContentPlanAddPostModal';
import { TAddToSchedulersData, useAddToSchedulersMutation } from 'modules/content-plan/redux/api';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

export const PostDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: post, isLoading, refetch } = useGetPostByIdQuery(id || '');
  const { data: imgStylesList } = useGetImgStylesListQuery();
  const { data: socialMediaList, refetch: refetchSocialMediaList } = useGetSocialMediaListByCurrentCompanyQuery();
  const [recreatePostImage, { isLoading: isRecreatePostImageLoading }] = useRecreatePostImageMutation();
  const [recreatePostText, { isLoading: isRecreatePostTextLoading }] = useRecreatePostTextMutation();
  const [addToSchedulers, { isLoading: isAddingToSchedulers }] = useAddToSchedulersMutation();
  const [postNow, { isLoading: isPostNowLoading }] = usePostNowMutation();

  const { user } = useTypedSelector((state) => state.auth);

  const [currentImgStyle, setCurrentImgStyle] = useState(post?.img_style);
  const [selectedNewSocialMedias, setSelectedNewSocialMedias] = useState<TSocialMediaByCurrentCompanyData[]>([]);
  const [isEditBlockShow, setIsEditBlockShow] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContentPlanAddPostModalOpen, setIsContentPlanAddPostModalOpen] = useState(false);
  const [isContentPlanSocialMediaListModalOpen, setIsContentPlanSocialMediaListModalOpen] = useState(false);
  const [isPostPageOpen, setIsPostPageOpen] = useState(true);

  const profileImage = user?.profile.picture ? `${user.profile.picture}` : avatar;

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      imageOption: 'keepImage',
      textOption: 'keepText',
      imageDescription: '',
      textDescription: '',
    },
  });

  const formValues = watch();
  const imageOption = watch('imageOption');
  const textOption = watch('textOption');

  const handleChangeCurrentImgStyle = (style: TImgStylesData | undefined) => {
    setCurrentImgStyle(style);
    setIsModalOpen(false);
  }

  const handleOpenModal = () => setIsModalOpen(true);

  const handleShowContentPlanSocialMediaListModal = () => {
    refetchSocialMediaList();
    setIsContentPlanSocialMediaListModalOpen(true);
  }

  const handleShowContentPlanAddPostModal = () => {
    refetchSocialMediaList();
    setIsPostPageOpen(false);
    setIsContentPlanAddPostModalOpen(true);
  }

  const handleSelectNewSocialMedias = (socialMedias: TSocialMediaByCurrentCompanyData[]) => setSelectedNewSocialMedias(socialMedias);

  // @ts-ignore
  const onSubmit = (data) => {
    if (formValues.imageOption !== 'keepImage') {
      recreatePostImage({
        id: post?.id,
        img_prompt: data.imageDescription,
        img_style: currentImgStyle?.id
      }).unwrap().then(() => refetch())
    }
    if (formValues.textOption !== 'keepText') {
      recreatePostText({
        id: post?.id,
        txt_prompt: data.textDescription,
        main_text: post?.main_text
      }).unwrap().then(() => refetch())
    }
  };

  const handleAddToSchedulers = (item: TAddToSchedulersData) => {
    addToSchedulers(item).unwrap().then(() => {
      setIsPostPageOpen(true);
      setIsContentPlanAddPostModalOpen(false);
      message.success('Пост успешно добавлен в планировщик.');
    });
  }

  const handleClearAddModalParams = () => {
    setSelectedNewSocialMedias([]);
  }

  const handlePostNow = () => {
    if (post?.id) {
      postNow({
        post_id: post.id,
        social_media_account_ids: selectedNewSocialMedias.map((media) => media.id)
      }).unwrap().then((res) => {
        setIsContentPlanSocialMediaListModalOpen(false);
        setSelectedNewSocialMedias([]);
        message.success(res.message);
      })
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (post) {
      const { main_text, title, hashtags, picture, img_prompt, txt_prompt, img_style } = post;

      setValue('imageDescription', img_prompt || '');
      setValue('textDescription', txt_prompt || '');
      setCurrentImgStyle(img_style);

      if (!main_text || !title || !hashtags || picture?.includes('no_img')) {
        interval = setInterval(() => {
          refetch();
        }, 5000);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [post, refetch, setValue]);

  if (isLoading) return <div className={styles.postDescr}>
    <LoadingOutlined className={styles.loader} />
  </div>;

  return (
    <>
      <Layout>
        <Content className='page-layout'>
          <Layout>
            <Content>
              <div className={styles.postDescr}>
                <div className={styles.container}>
                  <div className={styles.mainBlock}>
                    <div className={styles.postHeader}>
                      <div className={styles.userInfo}>
                        <img
                          src={profileImage}
                          alt={user ? user.profile.user.first_name : '-'}
                          className={styles.avatar}
                        />
                        <div className={styles.details}>
                          <div className={styles.name}>{user ? user.profile.user.first_name : '-'}</div>
                        </div>
                      </div>
                      <div className={styles.pictureBlock}>
                        {post?.picture?.includes('no_img') ?
                          <LoadingOutlined className={styles.loader} />
                          :
                          <>
                            <Image
                              src={post?.picture}
                              className={styles.picture}
                              alt="Post Image"
                            />
                            <Button
                              className={styles.reloadButton}
                              icon={<ReloadOutlined />}
                              shape="circle"
                              onClick={() => setIsEditBlockShow(!isEditBlockShow)}
                            />
                          </>
                        }
                      </div>

                      {/* <Collapse className={styles.postDescription}>
                    <Panel header="Описание" key="1">
                      <Text>{post?.img_prompt}</Text>
                    </Panel>
                  </Collapse> */}
                    </div>
                    <div className={styles.postContent}>
                      <Title level={3}>{post?.title}</Title>
                      <Text>{post?.main_text}</Text>

                      <div className={styles.postHashtags}>
                        <Text>{post?.hashtags}</Text>
                      </div>
                    </div>
                    <div className={styles.postLike}>
                      <Text>Лайк</Text>
                      <Checkbox checked={post?.like}></Checkbox>
                    </div>
                    <div className={styles.postActions}>
                      <Button
                        type="primary"
                        onClick={() => navigate(`/post/${post?.post_query}/${post?.id}/update`)}
                      >
                        Редактировать
                      </Button>
                      <Button
                        type="primary"
                        onClick={handleShowContentPlanSocialMediaListModal}
                      >
                        Опубликовать сейчас
                      </Button>
                      <Button
                        type="primary"
                        onClick={handleShowContentPlanAddPostModal}
                      >
                        В планировщик
                      </Button>
                      <Button
                        htmlType="button"
                        style={{ color: '#faad14', borderColor: '#faad14' }}
                        onClick={() => navigate(-1)}
                      >
                        Отменить
                      </Button>
                    </div>
                  </div>
                  {isEditBlockShow && (
                    <div className={styles.editBlock}>
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <div className={styles.parameters}>
                          <Title level={4}>Параметры рисунка:</Title>
                          <Controller
                            control={control}
                            name="imageOption"
                            render={({ field }) => (
                              <Radio.Group
                                {...field}
                                className={styles.radioGroup}
                              >
                                <Radio value="keepImage" disabled={isRecreatePostImageLoading || isRecreatePostTextLoading}>Оставить без изменения</Radio>
                                <Radio value="newImage" disabled={isRecreatePostImageLoading || isRecreatePostTextLoading}>Создать заново</Radio>
                                <Radio value="newDescriptionImage" disabled={isRecreatePostImageLoading || isRecreatePostTextLoading}>Создать с новым описанием</Radio>
                              </Radio.Group>
                            )}
                          />
                          {imageOption === 'newDescriptionImage' && (
                            <div className={styles.imageBlock}>
                              <div className={styles.imageStyleBlock} onClick={() => {
                                if (!isRecreatePostImageLoading || !isRecreatePostTextLoading) {
                                  handleOpenModal()
                                }
                              }}>
                                <Title level={4} >Стиль рисунка: {currentImgStyle?.name}</Title>
                                <img src={currentImgStyle?.picture} alt={currentImgStyle?.name} />
                              </div>
                              <Controller
                                control={control}
                                name="imageDescription"
                                render={({ field }) => (
                                  <TextArea
                                    {...field}
                                    rows={6}
                                    placeholder="Введите описание изображения..."
                                    className={styles.textArea}
                                    disabled={isRecreatePostImageLoading || isRecreatePostTextLoading}
                                  />
                                )}
                              />
                            </div>
                          )}
                          <Title level={4}>Параметры текста:</Title>
                          <Controller
                            control={control}
                            name="textOption"
                            render={({ field }) => (
                              <Radio.Group
                                {...field}
                                className={styles.radioGroup}
                              >
                                <Radio value="keepText" disabled={isRecreatePostImageLoading || isRecreatePostTextLoading}>Оставить без изменения</Radio>
                                <Radio value="newText" disabled={isRecreatePostImageLoading || isRecreatePostTextLoading}>Создать заново</Radio>
                                <Radio value="newDescriptionText" disabled={isRecreatePostImageLoading || isRecreatePostTextLoading}>Создать с новым описанием</Radio>
                              </Radio.Group>
                            )}
                          />
                          {textOption === 'newDescriptionText' && (
                            <Controller
                              control={control}
                              name="textDescription"
                              render={({ field }) => (
                                <TextArea
                                  {...field}
                                  rows={6}
                                  placeholder="Введите описание текста..."
                                  className={styles.textArea}
                                  disabled={isRecreatePostImageLoading || isRecreatePostTextLoading}
                                />
                              )}
                            />
                          )}
                        </div>
                        <Button
                          type="primary"
                          htmlType="submit"
                          className={styles.submitButton}
                          disabled={isRecreatePostImageLoading || isRecreatePostTextLoading || (imageOption === 'keepImage' && textOption === 'keepText')}
                        >
                          Отправить запрос
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </Content>
          </Layout>
        </Content >
      </Layout >
      <ModalImageStylesList
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        imgStylesList={imgStylesList}
        handleChangeCurrentImgStyle={handleChangeCurrentImgStyle}
      />
      <ContentPlanAddPostModal
        isModalOpen={isContentPlanAddPostModalOpen}
        setIsModalOpen={setIsContentPlanAddPostModalOpen}
        handleShowContentPlanSocialMediaListModal={handleShowContentPlanSocialMediaListModal}
        selectNewPost={post}
        selectedNewSocialMedias={selectedNewSocialMedias}
        isAddingToSchedulers={isAddingToSchedulers}
        handleAddToSchedulers={handleAddToSchedulers}
        handleClearAddModalParams={handleClearAddModalParams}
        isPostNowLoading={isPostNowLoading}
        handlePostNow={handlePostNow}
        isPostPage
      />
      <ContentPlanSocialMediaListModal
        isModalOpen={isContentPlanSocialMediaListModalOpen}
        setIsModalOpen={setIsContentPlanSocialMediaListModalOpen}
        socialMediaList={socialMediaList}
        handleSelectNewSocialMedias={handleSelectNewSocialMedias}
        selectedNewSocialMedias={selectedNewSocialMedias}
        isPostNow={isPostPageOpen}
        isPostNowLoading={isPostNowLoading}
        handlePostNow={handlePostNow}
      />
    </>
  );
};
