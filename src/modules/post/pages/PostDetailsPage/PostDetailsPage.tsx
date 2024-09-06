import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetPostByIdQuery } from '../../redux/api';
import { Layout, Typography, Image, Button, Collapse, Checkbox, Radio, Input } from 'antd';
import {
  ReloadOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import styles from './PostDetailsPage.module.scss';
import { useTypedSelector } from 'hooks/useTypedSelector';
import avatar from '../../../../assets/avatar.png';
import { Controller, useForm } from 'react-hook-form';
import { postActions } from 'modules/post/redux/slices/post.slice';
import { useDispatch } from 'react-redux';
import { ModalImageStylesList } from 'modules/post-query/components/ModalImageStylesList/ModalImageStylesList';
import { TImgStylesData, useGetImgStylesListQuery } from '../../../../redux/api/imgStyles/imgStylesApi';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

export const PostDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data: post, isLoading, refetch } = useGetPostByIdQuery(id || '');
  const { data: imgStylesList } = useGetImgStylesListQuery();

  const { user } = useTypedSelector((state) => state.auth);

  const [isEditBlockShow, setIsEditBlockShow] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImgStyle, setCurrentImgStyle] = useState(post?.img_style);

  const profileImage = user?.profile.picture ? `${user.profile.picture}` : avatar;

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      imageOption: 'keepImage',
      textOption: 'keepText',
      imageDescription: '',
      textDescription: '',
    },
  });

  const imageOption = watch('imageOption');
  const textOption = watch('textOption');

  const handleOpenModal = () => {
    setIsModalOpen(true);
  }

  const handleChangeCurrentImgStyle = (style: TImgStylesData | undefined) => {
    setCurrentImgStyle(style);
    setIsModalOpen(false);
  }

  // @ts-ignore
  const onSubmit = (data) => {
    console.log('Form data:', data);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (post) {
      const { main_text, title, hashtags, picture, img_prompt, txt_prompt } = post;

      setValue('imageDescription', img_prompt || '');
      setValue('textDescription', txt_prompt || '');

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
    <LoadingOutlined className={styles.loader} style={{ color: 'rgb(22, 119, 255)' }} />
  </div>;

  return (
    <>
      <Layout>
        <Content style={{ padding: '24px', minHeight: 'calc(100vh - 70px)' }}>
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
                          <LoadingOutlined className={styles.loader} style={{ fontSize: '16px', color: 'rgb(22, 119, 255)' }} />
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
                                <Radio value="keepImage">Оставить без изменения</Radio>
                                <Radio value="newImage">Создать заново</Radio>
                                <Radio value="newDescriptionImage">Создать с новым описанием</Radio>
                              </Radio.Group>
                            )}
                          />
                          {imageOption === 'newDescriptionImage' && (
                            <div className={styles.imageBlock}>
                              <div className={styles.imageStyleBlock} onClick={handleOpenModal}>
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
                                <Radio value="keepText">Оставить без изменения</Radio>
                                <Radio value="newText">Создать заново</Radio>
                                <Radio value="newDescriptionText">Создать с новым описанием</Radio>
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
                                />
                              )}
                            />
                          )}
                        </div>
                        <Button type="primary" htmlType="submit" className={styles.submitButton} disabled={imageOption === 'keepImage' && textOption === 'keepText'}>
                          Отправить запрос
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </Content>
          </Layout>
        </Content>
      </Layout>
      <ModalImageStylesList isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} imgStylesList={imgStylesList} handleChangeCurrentImgStyle={handleChangeCurrentImgStyle} />
    </>
  );
};
