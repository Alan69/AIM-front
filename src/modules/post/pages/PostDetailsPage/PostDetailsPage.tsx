import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import {
  useCreatePostImageMutation,
  useGetPostByIdQuery,
  useGetPostMediasByIdQuery,
  usePostNowMutation,
  useRecreatePostImageMutation,
  useRecreatePostTextMutation,
  useUpdatePostMutation,
} from "../../redux/api";
import {
  Layout,
  Typography,
  Image,
  Button,
  Collapse,
  Radio,
  Input,
  message,
  Tooltip,
  Upload,
} from "antd";
import {
  ReloadOutlined,
  LoadingOutlined,
  HeartTwoTone,
  DownloadOutlined,
  CopyOutlined,
  UpOutlined,
  DownOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import cn from "classnames";

import styles from "./PostDetailsPage.module.scss";
import { useTypedSelector } from "hooks/useTypedSelector";
import avatar from "assets/avatar.png";
import { Controller, useForm } from "react-hook-form";
import { ModalImageStylesList } from "modules/post-query/components/ModalImageStylesList/ModalImageStylesList";
import {
  TImgStylesData,
  useGetImgStylesListQuery,
} from "../../../../redux/api/imgStyles/imgStylesApi";
import { ContentPlanSocialMediaListModal } from "modules/content-plan/components/ContentPlanSocialMediaListModal/ContentPlanSocialMediaListModal";
import {
  useGetSocialMediaListByCurrentCompanyQuery,
  TSocialMediaByCurrentCompanyData,
} from "modules/social-media/redux/api";
import { ContentPlanAddPostModal } from "modules/content-plan/components/ContentPlanAddPostModal/ContentPlanAddPostModal";
import {
  TAddToSchedulersRequest,
  useAddToSchedulersMutation,
} from "modules/content-plan/redux/api";
import { useTranslation } from "react-i18next";

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

export const PostDetailsPage = () => {
  const { t } = useTranslation();

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: post, isLoading, refetch } = useGetPostByIdQuery(id || "");
  const {
    data: postMedias,
    isLoading: isMediasLoading,
    refetch: refetchPostMedias,
  } = useGetPostMediasByIdQuery(id || "");
  const { data: imgStylesList } = useGetImgStylesListQuery();
  const { data: socialMediaList, refetch: refetchSocialMediaList } =
    useGetSocialMediaListByCurrentCompanyQuery();
  const [recreatePostImage, { isLoading: isRecreatePostImageLoading }] =
    useRecreatePostImageMutation();
  const [recreatePostText, { isLoading: isRecreatePostTextLoading }] =
    useRecreatePostTextMutation();
  const [addToSchedulers, { isLoading: isAddingToSchedulers }] =
    useAddToSchedulersMutation();
  const [postNow, { isLoading: isPostNowLoading }] = usePostNowMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();
  const [createPostImage, { isLoading: isCreating }] =
    useCreatePostImageMutation();

  const { user } = useTypedSelector((state) => state.auth);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [currentImgStyle, setCurrentImgStyle] = useState(post?.img_style);
  const [selectedNewSocialMedias, setSelectedNewSocialMedias] = useState<
    TSocialMediaByCurrentCompanyData[]
  >([]);
  const [isEditBlockShow, setIsEditBlockShow] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContentPlanAddPostModalOpen, setIsContentPlanAddPostModalOpen] =
    useState(false);
  const [
    isContentPlanSocialMediaListModalOpen,
    setIsContentPlanSocialMediaListModalOpen,
  ] = useState(false);
  const [isPostPageOpen, setIsPostPageOpen] = useState(true);
  const [selectedMedias, setSelectedMedias] = useState<string[]>([]);
  const [fileList, setFileList] = useState<File[]>([]);

  const profileImage = user?.profile.picture
    ? `${user.profile.picture}`
    : avatar;

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      imageOption: "keepImage",
      textOption: "keepText",
      imageDescription: "",
      textDescription: "",
    },
  });

  const formValues = watch();
  const imageOption = watch("imageOption");
  const textOption = watch("textOption");

  const formatText = (text: string) => {
    return text
      .split("\n")
      .map((paragraph, index) => (
        <Typography.Paragraph key={index}>{paragraph}</Typography.Paragraph>
      ));
  };

  const handleChangeCurrentImgStyle = (style: TImgStylesData | undefined) => {
    setCurrentImgStyle(style);
    setIsModalOpen(false);
  };

  const handleOpenModal = () => setIsModalOpen(true);

  const handleShowContentPlanSocialMediaListModal = () => {
    refetchSocialMediaList();
    setIsContentPlanSocialMediaListModalOpen(true);
  };

  const handleShowContentPlanAddPostModal = () => {
    refetchSocialMediaList();
    setIsPostPageOpen(false);
    setIsContentPlanAddPostModalOpen(true);
  };

  const handleSelectNewSocialMedias = (
    socialMedias: TSocialMediaByCurrentCompanyData[]
  ) => setSelectedNewSocialMedias(socialMedias);

  // @ts-ignore
  const onSubmit = (data) => {
    if (formValues.imageOption !== "keepImage") {
      recreatePostImage({
        id: post?.id,
        img_prompt: data.imageDescription,
        img_style: currentImgStyle?.id,
      })
        .unwrap()
        .then(() => {
          refetch();
        })
        .catch((error) => {
          // refetch().unwrap().then(() => message.error(error.data.error))
          refetch();
        });
    }
    if (formValues.textOption !== "keepText") {
      recreatePostText({
        id: post?.id,
        txt_prompt: data.textDescription,
        main_text: post?.main_text,
      })
        .unwrap()
        .then(() => {
          refetch();
        })
        .catch((error) => {
          // refetch().unwrap().then(() => message.error(error.data.error))
          refetch();
        });
    }
  };

  const handleAddToSchedulers = (item: TAddToSchedulersRequest) => {
    addToSchedulers(item)
      .unwrap()
      .then(() => {
        setIsPostPageOpen(true);
        setIsContentPlanAddPostModalOpen(false);
        message.success("Пост успешно добавлен в планировщик.");
      });
  };

  const handleClearAddModalParams = () => {
    setSelectedNewSocialMedias([]);
  };

  const handleMediaClick = (mediaPost: string) => {
    setSelectedMedias((prev) =>
      prev.includes(mediaPost)
        ? prev.filter((item) => item !== mediaPost)
        : [...prev, mediaPost]
    );
  };

  const handlePostNow = () => {
    if (post?.id) {
      const previousPostImageIds =
        selectedMedias.length > 0
          ? selectedMedias
          : postMedias && postMedias.length > 0
            ? [postMedias[0].id]
            : [];

      postNow({
        post_id: post.id,
        social_media_account_ids: selectedNewSocialMedias.map(
          (media) => media.id
        ),
        previous_post_image_ids: previousPostImageIds,
      })
        .unwrap()
        .then((res) => {
          refetchPostMedias()
            .unwrap()
            .then(() => {
              setIsContentPlanSocialMediaListModalOpen(false);
              setSelectedNewSocialMedias([]);
              message.success(res.message);
            });
        });
    }
  };

  const handleUpdateLike = () => {
    if (post) {
      const updatedData = {
        id: id,
        title: post?.title,
        img_prompt: post?.img_prompt,
        txt_prompt: post?.txt_prompt,
        main_text: post?.main_text,
        hashtags: post?.hashtags,
        like: post?.like ? false : true,
        active: post.active,
        img_style: post.img_style?.id,
        post_query: post.post_query,
        author: user?.profile.id,
      };

      // @ts-ignore
      updatePost(updatedData)
        .unwrap()
        .then(() => {
          refetch()
            .unwrap()
            .then(() => {
              message.success(
                post?.like
                  ? "Вы успешно удалили из избранных!"
                  : "Вы успешно добавили в избранные!"
              );
            });
        });
    }
  };

  const handleFileChange = (info: any) => {
    const validTypes = ["image/jpeg", "image/png"];
    const files = info.fileList.map((file: any) => file.originFileObj);

    const isValid = files.every((file: File) => validTypes.includes(file.type));
    if (!isValid) {
      message.error(t("postDetailsPage.invalid_file_type"));
      return;
    }

    if (files.length > 10) {
      message.error(t("postDetailsPage.error_max_files"));
      return;
    }

    setFileList(files);
  };

  const handleUploadConfirm = async () => {
    try {
      await createPostImage({
        post: id,
        media: fileList,
      })
        .unwrap()
        .then(() => {
          refetchPostMedias();
          message.success(t("postDetailsPage.update_success"));
          setFileList([]);
        });
    } catch (error) {
      message.error(t("postDetailsPage.image_upload_error"));
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (post) {
      const {
        main_text,
        title,
        hashtags,
        picture,
        img_prompt,
        txt_prompt,
        img_style,
      } = post;

      setValue("imageDescription", img_prompt || "");
      setValue("textDescription", txt_prompt || "");
      setCurrentImgStyle(img_style);

      if (!main_text || !title || !hashtags || picture?.includes("no_img")) {
        interval = setInterval(() => {
          refetch();
          refetchPostMedias();
        }, 5000);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [post, refetch, setValue]);

  if (isLoading)
    return (
      <div className={styles.postDescr}>
        <LoadingOutlined className={styles.loader} />
      </div>
    );

  return (
    <>
      <Layout>
        <Content className="page-layout">
          <Layout>
            <Content>
              <div className={styles.postDescr}>
                <div className={styles.container}>
                  <div className={styles.mediaSlider}>
                    {postMedias && postMedias.length > 3 && (
                      <>
                        <button
                          className={styles.scrollButton}
                          onClick={() =>
                            scrollContainerRef.current?.scrollBy({
                              top: -200,
                              behavior: "smooth",
                            })
                          }
                        >
                          <UpOutlined />
                        </button>
                      </>
                    )}

                    <div
                      className={styles.scrollContainer}
                      ref={scrollContainerRef}
                    >
                      {postMedias?.map((media) => (
                        <div key={media.id} className={styles.imageWrapper}>
                          <Image
                            src={media.media}
                            alt={`Media ${media.id}`}
                            className={styles.sliderImage}
                          />
                          <div
                            className={`${styles.iconOverlay} ${
                              selectedMedias.includes(media.id)
                                ? styles.selected
                                : ""
                            }`}
                            onClick={() => handleMediaClick(media.id)}
                          >
                            {selectedMedias.includes(media.id) ? (
                              <div className={styles.iconSelected}>
                                {selectedMedias.indexOf(media.id) + 1}
                              </div>
                            ) : (
                              <PlusOutlined className={styles.iconUnselected} />
                            )}
                          </div>
                          <Button
                            className={cn(
                              styles.iconOverlay,
                              styles.iconOverlay__download
                            )}
                            icon={<DownloadOutlined />}
                            shape="circle"
                            onClick={async () => {
                              try {
                                if (!media.media) {
                                  message.error(
                                    t("postDetailsPage.image_not_found")
                                  );
                                  return;
                                }

                                const response = await fetch(media.media, {
                                  method: "GET",
                                  mode: "cors",
                                  credentials: "include",
                                });

                                if (!response.ok) {
                                  throw new Error(
                                    t("postDetailsPage.image_download_error")
                                  );
                                }

                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);

                                const link = document.createElement("a");
                                link.href = url;
                                link.setAttribute("download", "image.jpg");
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(url);
                                message.success(
                                  t("postDetailsPage.image_download_success")
                                );
                              } catch (error) {
                                console.error(
                                  t("postDetailsPage.image_download_error"),
                                  error
                                );
                                message.error(
                                  t("postDetailsPage.image_download_error")
                                );
                              }
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    {postMedias && postMedias.length > 3 && (
                      <>
                        <button
                          className={cn(
                            styles.scrollButton,
                            styles.scrollButtonDown
                          )}
                          onClick={() =>
                            scrollContainerRef.current?.scrollBy({
                              top: 200,
                              behavior: "smooth",
                            })
                          }
                        >
                          <DownOutlined />
                        </button>
                      </>
                    )}
                    <Upload
                      className={styles.uploadPicture}
                      name="picture"
                      listType="picture"
                      accept="image/jpeg, image/png"
                      multiple
                      fileList={fileList.map((file) => ({
                        // @ts-ignore
                        uid: file.uid || file.name,
                        name: file.name,
                        status: "done",
                        url: URL.createObjectURL(file),
                      }))}
                      beforeUpload={() => false}
                      onChange={handleFileChange}
                    >
                      <Button icon={<UploadOutlined />}>
                        {t("postDetailsPage.select_file")}
                      </Button>
                    </Upload>

                    {fileList.length ? (
                      <Button
                        className={styles.uploadConfirm}
                        type="primary"
                        onClick={handleUploadConfirm}
                        loading={isCreating}
                      >
                        {t("postDetailsPage.upload_image")}
                      </Button>
                    ) : (
                      ""
                    )}
                  </div>

                  <div className={styles.mainBlock}>
                    <div className={styles.mainContent}>
                      {" "}
                      <div className={styles.postHeader}>
                        <div className={styles.userInfo}>
                          <img
                            src={profileImage}
                            alt={user ? user.profile.user.first_name : "-"}
                            className={styles.avatar}
                          />
                          <div className={styles.details}>
                            <div className={styles.name}>
                              {user ? user.profile.user.first_name : "-"}
                            </div>
                          </div>
                        </div>
                        <div className={styles.pictureBlock}>
                          {post?.picture?.includes("no_img") ? (
                            <LoadingOutlined className={styles.loader} />
                          ) : (
                            <>
                              <Image
                                src={post?.picture}
                                className={styles.picture}
                                alt={t("postDetailsPage.image_alt")}
                              />

                              <Button
                                className={styles.reloadButton}
                                icon={<ReloadOutlined />}
                                shape="circle"
                                onClick={() =>
                                  setIsEditBlockShow(!isEditBlockShow)
                                }
                              />
                              <Button
                                className={styles.downloadButton}
                                icon={<DownloadOutlined />}
                                shape="circle"
                                onClick={async () => {
                                  try {
                                    if (!post?.picture) {
                                      message.error(
                                        t("postDetailsPage.image_not_found")
                                      );
                                      return;
                                    }

                                    const response = await fetch(post.picture, {
                                      method: "GET",
                                      mode: "cors",
                                      credentials: "include",
                                    });

                                    if (!response.ok) {
                                      throw new Error(
                                        t(
                                          "postDetailsPage.image_download_error"
                                        )
                                      );
                                    }

                                    const blob = await response.blob();
                                    const url =
                                      window.URL.createObjectURL(blob);

                                    const link = document.createElement("a");
                                    link.href = url;
                                    link.setAttribute("download", "image.jpg");
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    window.URL.revokeObjectURL(url);
                                    message.success(
                                      t(
                                        "postDetailsPage.image_download_success"
                                      )
                                    );
                                  } catch (error) {
                                    console.error(
                                      t("postDetailsPage.image_download_error"),
                                      error
                                    );
                                    message.error(
                                      t("postDetailsPage.image_download_error")
                                    );
                                  }
                                }}
                              />
                            </>
                          )}
                        </div>
                        {/* <Collapse className={styles.postDescription}>
                        <Panel header="Описание" key="1">
                          <Text>{post?.img_prompt}</Text>
                        </Panel>
                      </Collapse> */}
                      </div>
                      <div className={styles.postContent}>
                        <div className={styles.postContent__titleBlock}>
                          <Title level={3}>{post?.title}</Title>
                          <Tooltip title={t("postDetailsPage.copy")}>
                            <Button
                              className={styles.postContent__icon}
                              icon={<CopyOutlined />}
                              onClick={() => {
                                if (
                                  post?.title ||
                                  post?.main_text ||
                                  post?.hashtags
                                ) {
                                  const mainTextCleaned =
                                    post.main_text?.replace(/\n\n/g, " ");
                                  const textToCopy = [
                                    post.title,
                                    mainTextCleaned,
                                    post.hashtags,
                                  ]
                                    .filter(Boolean)
                                    .join("\n\n");

                                  navigator.clipboard
                                    .writeText(textToCopy)
                                    .then(
                                      () => {
                                        message.success(
                                          t("postDetailsPage.copy_success")
                                        );
                                      },
                                      () => {
                                        message.error(
                                          t("postDetailsPage.copy_error")
                                        );
                                      }
                                    );
                                }
                              }}
                            />
                          </Tooltip>
                        </div>
                        <div className={styles.postContent__text}>
                          {post?.main_text ? formatText(post.main_text) : null}
                        </div>
                        <div className={styles.postHashtags}>
                          <Text>{post?.hashtags}</Text>
                        </div>
                      </div>
                    </div>
                    <div className={styles.postButtons}>
                      <div className={styles.postLike}>
                        <HeartTwoTone
                          height={24}
                          width={24}
                          className={cn(
                            styles.iconHeart,
                            post?.like ? styles.iconHeart__active : ""
                          )}
                          onClick={handleUpdateLike}
                        />
                        <Text>{t("postDetailsPage.add_to_favorites")}</Text>
                      </div>
                      <div className={styles.postActions}>
                        <Button
                          type="primary"
                          onClick={() =>
                            navigate(
                              `/post/${post?.post_query}/${post?.id}/update`
                            )
                          }
                        >
                          {t("postDetailsPage.edit")}
                        </Button>
                        <Button
                          type="primary"
                          onClick={handleShowContentPlanSocialMediaListModal}
                        >
                          {t("postDetailsPage.publish_now")}
                        </Button>
                        <Button
                          type="primary"
                          onClick={handleShowContentPlanAddPostModal}
                        >
                          {t("postDetailsPage.add_to_scheduler")}
                        </Button>
                        <Button
                          htmlType="button"
                          type="default"
                          onClick={() => navigate(-1)}
                        >
                          {t("postDetailsPage.cancel")}
                        </Button>
                      </div>
                    </div>
                  </div>
                  {isEditBlockShow && (
                    <div className={styles.editBlock}>
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <div className={styles.parameters}>
                          <Title level={4}>
                            {t("postDetailsPage.image_parameters")}
                          </Title>
                          <Controller
                            control={control}
                            name="imageOption"
                            render={({ field }) => (
                              <Radio.Group
                                {...field}
                                className={styles.radioGroup}
                              >
                                <Radio
                                  value="keepImage"
                                  disabled={
                                    isRecreatePostImageLoading ||
                                    isRecreatePostTextLoading
                                  }
                                >
                                  {t("postDetailsPage.keep_image")}
                                </Radio>
                                <Radio
                                  value="newImage"
                                  disabled={
                                    isRecreatePostImageLoading ||
                                    isRecreatePostTextLoading
                                  }
                                >
                                  {t("postDetailsPage.create_new_image")}
                                </Radio>
                                <Radio
                                  value="newDescriptionImage"
                                  disabled={
                                    isRecreatePostImageLoading ||
                                    isRecreatePostTextLoading
                                  }
                                >
                                  {t(
                                    "postDetailsPage.create_with_new_description"
                                  )}
                                </Radio>
                              </Radio.Group>
                            )}
                          />
                          {imageOption === "newDescriptionImage" && (
                            <div className={styles.imageBlock}>
                              <div
                                className={styles.imageStyleBlock}
                                onClick={() => {
                                  if (
                                    !isRecreatePostImageLoading ||
                                    !isRecreatePostTextLoading
                                  ) {
                                    handleOpenModal();
                                  }
                                }}
                              >
                                <Title level={4}>
                                  {t("postDetailsPage.image_style")}:{" "}
                                  {currentImgStyle?.name}
                                </Title>
                                <img
                                  src={currentImgStyle?.picture}
                                  alt={currentImgStyle?.name}
                                />
                              </div>
                              <Controller
                                control={control}
                                name="imageDescription"
                                render={({ field }) => (
                                  <TextArea
                                    {...field}
                                    rows={6}
                                    placeholder={t(
                                      "postDetailsPage.enter_image_description"
                                    )}
                                    className={styles.textArea}
                                    disabled={
                                      isRecreatePostImageLoading ||
                                      isRecreatePostTextLoading
                                    }
                                  />
                                )}
                              />
                            </div>
                          )}
                          <Title level={4}>
                            {t("postDetailsPage.text_parameters")}
                          </Title>
                          <Controller
                            control={control}
                            name="textOption"
                            render={({ field }) => (
                              <Radio.Group
                                {...field}
                                className={styles.radioGroup}
                              >
                                <Radio
                                  value="keepText"
                                  disabled={
                                    isRecreatePostImageLoading ||
                                    isRecreatePostTextLoading
                                  }
                                >
                                  {t("postDetailsPage.keep_text")}
                                </Radio>
                                <Radio
                                  value="newText"
                                  disabled={
                                    isRecreatePostImageLoading ||
                                    isRecreatePostTextLoading
                                  }
                                >
                                  {t("postDetailsPage.create_new_text")}
                                </Radio>
                                <Radio
                                  value="newDescriptionText"
                                  disabled={
                                    isRecreatePostImageLoading ||
                                    isRecreatePostTextLoading
                                  }
                                >
                                  {t(
                                    "postDetailsPage.create_with_new_description"
                                  )}
                                </Radio>
                              </Radio.Group>
                            )}
                          />
                          {textOption === "newDescriptionText" && (
                            <Controller
                              control={control}
                              name="textDescription"
                              render={({ field }) => (
                                <TextArea
                                  {...field}
                                  rows={6}
                                  placeholder={t(
                                    "postDetailsPage.enter_text_description"
                                  )}
                                  className={styles.textArea}
                                  disabled={
                                    isRecreatePostImageLoading ||
                                    isRecreatePostTextLoading
                                  }
                                />
                              )}
                            />
                          )}
                        </div>
                        <Button
                          type="primary"
                          htmlType="submit"
                          className={styles.submitButton}
                          disabled={
                            isRecreatePostImageLoading ||
                            isRecreatePostTextLoading ||
                            (imageOption === "keepImage" &&
                              textOption === "keepText")
                          }
                          loading={
                            isRecreatePostImageLoading ||
                            isRecreatePostTextLoading
                          }
                        >
                          {t("postDetailsPage.submit_request")}
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
      <ModalImageStylesList
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        imgStylesList={imgStylesList}
        handleChangeCurrentImgStyle={handleChangeCurrentImgStyle}
      />
      <ContentPlanAddPostModal
        isModalOpen={isContentPlanAddPostModalOpen}
        setIsModalOpen={setIsContentPlanAddPostModalOpen}
        handleShowContentPlanSocialMediaListModal={
          handleShowContentPlanSocialMediaListModal
        }
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
