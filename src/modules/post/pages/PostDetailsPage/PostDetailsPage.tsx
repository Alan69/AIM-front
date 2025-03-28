import { useNavigate, useParams, useLocation } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import {
  useCreatePostImageMutation,
  useGetPostByIdQuery,
  useGetPostMediasByIdQuery,
  usePostNowMutation,
  useRecreatePostImageMutation,
  useRecreatePostTextMutation,
  TPostMediaData,
  useUpdatePostMutation,
} from "../../redux/api";
import {
  Layout,
  Typography,
  Image,
  Button,
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
  EditOutlined,
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
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store";
import { postActions } from "../../redux/slices/post.slice";
import { WebSocketService } from "services/websocket";
import { createTemplate } from "../../../design/services/designService";
const baseApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

export const PostDetailsPage = () => {
  const { t } = useTranslation();

  const { id, postQueryId } = useParams<{ id: string; postQueryId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the refresh parameter from the URL
  const searchParams = new URLSearchParams(location.search);
  const refreshParam = searchParams.get('refresh');

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
  
  // Add Redux state for generation status
  const dispatch = useDispatch();
  const { textGenerationStatus, imageGenerationStatus } = useSelector(
    (state: RootState) => state.post
  );
  
  // WebSocket state
  const [wsService, setWsService] = useState<WebSocketService | null>(null);

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

  const handleOpenInDesigner = async (mediaItem: TPostMediaData) => {
    try {
      // Add more detailed logging
      console.log("Full post data:", post);
      console.log("Selected media item:", mediaItem);
      console.log("Media template value:", mediaItem?.template, typeof mediaItem?.template);
      
      // Try to fetch the post media directly to see what the API returns
      let mediaData;
      try {
        const response = await fetch(`${baseApiUrl}/post-media/${mediaItem.id}/`, {
          method: 'GET',
          credentials: 'include',
        });
        mediaData = await response.json();
        console.log("Media data from API:", mediaData);
        console.log("Template from API:", mediaData.template);
      } catch (error) {
        console.error("Error fetching media data:", error);
      }
      
      let templateUuid;
      
      // Check if the media already has a template - use more robust checking
      if (mediaData?.template && 
          mediaData.template !== "null" && 
          mediaData.template !== "undefined" && 
          mediaData.template !== null) {
        
        console.log(`Using existing template ${mediaData.template} for media ${mediaItem.id}`);
        templateUuid = mediaData.template;
        
        // Navigate directly to the existing template
        let url = `/design/editor/${templateUuid}?source=postMedia&postId=${post?.id}&mediaId=${mediaItem.id}`;
        
        // If we have a postQueryId, add it to the URL
        if (postQueryId) {
          url += `&postQueryId=${postQueryId}`;
        }
        
        navigate(url);
        return; // Exit early since we're using the existing template
      } else {
        // Create a new template with the media image
        const templateName = `Edit from Post ${post?.id || ''} Media ${mediaItem.id}`;
        const templateSize = '1080x1080'; // Default size, you might want to detect the actual image size
        
        // Get the media image URL
        let mediaImageUrl = mediaItem?.media || '';
        console.log(`Original media image URL: ${mediaImageUrl}`);
        
        // Make sure we have the full URL path
        if (mediaImageUrl && !mediaImageUrl.startsWith('http')) {
          // If it's a relative URL, convert to absolute
          const baseUrl = process.env.REACT_APP_API_URL || '';
          const apiUrl = baseUrl.replace('/api/', '').replace('/graphql/', '');
          
          // If it starts with /media, append it to the API URL
          if (mediaImageUrl.startsWith('/media/')) {
            mediaImageUrl = `${apiUrl}${mediaImageUrl}`;
          } else {
            // Otherwise, assume it needs /media/ prefix
            mediaImageUrl = `${apiUrl}/media/${mediaImageUrl}`;
          }
          console.log(`Converted to absolute URL: ${mediaImageUrl}`);
        }
        
        // Ensure the URL is accessible by checking if it's a valid URL
        try {
          new URL(mediaImageUrl);
        } catch (e) {
          console.error('Invalid URL:', mediaImageUrl);
          // Try to fix the URL
          if (mediaImageUrl) {
            const filename = mediaImageUrl.split('/').pop();
            if (filename) {
              mediaImageUrl = `http://localhost:8000/media/${filename}`;
              console.log(`Fixed URL: ${mediaImageUrl}`);
            }
          }
        }
        
        // Get the user ID from the user context
        const userId = user?.profile?.user?.id;
        console.log(`Creating template with user ID: ${userId}`);
        
        // Create a new template with the media image as background
        const newTemplate = await createTemplate(
          templateName, 
          templateSize, 
          mediaImageUrl,
          userId,
          false, // isDefault
          post?.id, // Pass the post ID to fetch the post image if needed
          mediaItem.id // Add the mediaId parameter
        );
        
        if (newTemplate && mediaItem.id) {
          // Update the media with the template UUID
          try {
            // Create form data for the request
            const formData = new URLSearchParams();
            formData.append('template_uuid', newTemplate.uuid);
            
            // Send the request to update the post media with the template UUID
            await fetch(`${baseApiUrl}/post-media/${mediaItem.id}/update-template/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: formData,
              credentials: 'include',
            });
            
            console.log(`Post media ${mediaItem.id} updated with template ${newTemplate.uuid}`);
          } catch (error) {
            console.error('Error updating post media with template UUID:', error);
          }
          
          templateUuid = newTemplate.uuid;
        }
      }
      
      if (templateUuid) {
        // Navigate to the template editor with the template
        // Pass source=postMedia, postId, and mediaId parameters to identify where we came from
        let url = `/design/editor/${templateUuid}?source=postMedia&postId=${post?.id}&mediaId=${mediaItem.id}`;
        
        // If we have a postQueryId, add it to the URL
        if (postQueryId) {
          url += `&postQueryId=${postQueryId}`;
        }
        
        navigate(url);
      }
    } catch (error) {
      console.error('Error creating template from media image:', error);
      message.error(t("postDetailsPage.error_creating_template"));
    }
  };

  const handleDownloadImage = async () => {
    try {
      if (!post?.picture) {
        message.error(t("postDetailsPage.image_not_found"));
        return;
      }

      const response = await fetch(post.picture, {
        method: "GET",
        mode: "cors",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(t("postDetailsPage.image_download_error"));
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
      message.success(t("postDetailsPage.image_download_success"));
    } catch (error) {
      console.error(t("postDetailsPage.image_download_error"), error);
      message.error(t("postDetailsPage.image_download_error"));
    }
  };

  // Function to add a cache-busting parameter to image URLs
  const getImageUrlWithCacheBuster = (url: string | undefined) => {
    if (!url) return '';
    
    // Add a timestamp to the URL to prevent caching
    const timestamp = refreshParam || Date.now();
    
    // Check if the URL already has query parameters
    const hasQueryParams = url.includes('?');
    const separator = hasQueryParams ? '&' : '?';
    
    return `${url}${separator}t=${timestamp}`;
  };
  
  // Check if the image has been updated from the TemplateEditorPage
  useEffect(() => {
    const imageUpdated = localStorage.getItem(`post_${id}_image_updated`);
    const newImageUrl = localStorage.getItem(`post_${id}_new_image_url`);
    const oldImageUrl = localStorage.getItem(`post_${id}_old_image_url`);
    const updateTimestamp = localStorage.getItem(`post_${id}_update_timestamp`);
    
    if (imageUpdated === 'true' && newImageUrl && post) {
      // Clear the localStorage flags
      localStorage.removeItem(`post_${id}_image_updated`);
      localStorage.removeItem(`post_${id}_new_image_url`);
      localStorage.removeItem(`post_${id}_old_image_url`);
      localStorage.removeItem(`post_${id}_update_timestamp`);
      
      // Force a refetch of the post data
      refetch();
      refetchPostMedias();
      
      // Show a notification that the image has been updated
      message.success(t("postDetailsPage.image_updated_from_editor"));
      
      // Force browser to clear image cache
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        const src = img.getAttribute('src');
        if (src && (src.includes(oldImageUrl || '') || src.includes(post.picture || ''))) {
          // Set a new src with cache buster
          img.setAttribute('src', getImageUrlWithCacheBuster(newImageUrl));
        }
      });
    }
  }, [id, post, refetch, refetchPostMedias, t]);
  
  // Force a refetch when the component mounts or when the refresh parameter changes
  useEffect(() => {
    // Refetch the post data
    refetch();
    refetchPostMedias();
    
    // Force browser to clear image cache
    if (refreshParam) {
      // Clear browser cache for images
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        const src = img.getAttribute('src');
        if (src && src.includes(post?.picture || '')) {
          // Set a new src with cache buster
          img.setAttribute('src', getImageUrlWithCacheBuster(src));
        }
      });
    }
  }, [id, refreshParam, refetch, refetchPostMedias, post?.picture]);
  
  // Add a function to handle image errors
  const handleImageError = () => {
    console.error('Image failed to load:', post?.picture);
    // Try to reload the image with a new cache buster
    const timestamp = Date.now();
    if (post?.picture) {
      const newSrc = `${post.picture}?t=${timestamp}`;
      // Find the image element and update its src
      const imgElement = document.querySelector(`.${styles.picture}`) as HTMLImageElement;
      if (imgElement) {
        imgElement.src = newSrc;
      }
    }
  };

  // Handle WebSocket messages
  const handleWebSocketMessage = (data: any) => {
    // Handle welcome message
    if (data.type === 'welcome') {
      // Send initial post check request if needed
      if (id && user?.profile?.user?.id) {
        const message = {
          query: 'post',
          user: user.profile.user.id,
          id: id,
          time: new Date().toISOString(),
          txt: true,
          img: true,
          previous_img: post?.picture || '/media/no_img.jpeg' // Add the current image to check if it changes
        };
        wsService?.send(message);
      }
    }
    
    // Handle post status updates
    if (data.type === 'post') {
      // Check if this is a status update
      if (data['checking-status']) {
        // Update generation status based on the message
        if (data.text_generated !== undefined) {
          const status = data.text_generated ? 'completed' : 'pending';
          dispatch(postActions.setTextGenerationStatus(status));
        }
        
        if (data.image_generated !== undefined) {
          const status = data.image_generated ? 'completed' : 'pending';
          dispatch(postActions.setImageGenerationStatus(status));
        }
        
        // If the message indicates we're still generating, set a timeout to force refresh
        if (data.message && data.message.includes('Still generating')) {
          setTimeout(() => {
            refetch();
            refetchPostMedias();
          }, 3000);
        }
      } 
      // Final result
      else if (data.result === 'ok') {
        // Update generation status based on the final result
        if (data.text_generated !== undefined) {
          const status = data.text_generated ? 'completed' : 'failed';
          dispatch(postActions.setTextGenerationStatus(status));
        }
        
        if (data.image_generated !== undefined) {
          const status = data.image_generated ? 'completed' : 'failed';
          dispatch(postActions.setImageGenerationStatus(status));
        }
        
        // Always refresh the post data when we get a final result
        refetch();
        refetchPostMedias();
      }
      // Handle error
      else if (data.result === 'error') {
        console.error('Error from WebSocket:', data.message);
        message.error(data.message || 'Error checking post status');
      }
    }
  };

  // Initialize WebSocket connection
  useEffect(() => {
    if (id) {
      // Reset generation status when component mounts or ID changes
      dispatch(postActions.setTextGenerationStatus('pending'));
      dispatch(postActions.setImageGenerationStatus('pending'));
      
      // Create WebSocket connection
      // Use the correct protocol (ws or wss) based on the current page protocol
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      
      // Determine the correct host based on environment
      let host;
      if (process.env.NODE_ENV === 'development') {
        // For local development, use localhost:8000 directly
        host = '127.0.0.1:8000';
      } else {
        // For production, use the API domain
      host = 'api.aimmagic.com';
      }
        
      const wsUrl = `${protocol}//${host}/ws/post/${id}/`;
      
      const ws = new WebSocketService(wsUrl, handleWebSocketMessage);
      
      ws.connect();
      setWsService(ws);
      
      return () => {
        ws.disconnect();
      };
    }
  }, [id, dispatch]);
  
  // Check if the post has an image and update the status accordingly
  useEffect(() => {
    if (post && post.picture && post.picture !== '/media/no_img.jpeg') {
      dispatch(postActions.setImageGenerationStatus('completed'));
      
      // Refresh the post data when the image is generated
      refetch();
      refetchPostMedias();
    }
  }, [post, dispatch, refetch, refetchPostMedias]);
  
  // Force a refresh after 10 seconds if we're still in pending state
  useEffect(() => {
    if ((textGenerationStatus === 'pending' || imageGenerationStatus === 'pending') && id && post) {
      const timer = setTimeout(() => {
        refetch();
        refetchPostMedias();
        
        // Also send a new WebSocket request
        if (id && user?.profile?.user?.id && wsService) {
          // Determine the correct host based on environment
          let apiHost;
          if (process.env.NODE_ENV === 'development') {
            apiHost = '127.0.0.1:8000';
          } else {
          apiHost = 'api.aimmagic.com';
          }
          
          // Get the current image URL, ensuring it's a full URL for comparison
          let previousImg = post?.picture || '/media/no_img.jpeg';
          if (previousImg.startsWith('/media/') && previousImg !== '/media/no_img.jpeg') {
            // Convert relative URL to absolute URL
            previousImg = `${window.location.protocol}//${apiHost}${previousImg}`;
          }
          
          const message = {
            query: 'post',
            user: user.profile.user.id,
            id: id,
            time: new Date().toISOString(),
            txt: true,
            img: true,
            previous_img: previousImg
          };
          wsService.send(message);
        }
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [textGenerationStatus, imageGenerationStatus, id, user, wsService, post, refetch, refetchPostMedias]);

  // Replace interval polling with WebSocket
  useEffect(() => {
    if (post) {
      const {
        txt_prompt,
        img_prompt,
        img_style,
      } = post;

      setValue("imageDescription", img_prompt || "");
      setValue("textDescription", txt_prompt || "");
      setCurrentImgStyle(img_style);
      
      // No need for interval polling as we're using WebSocket now
    }
  }, [post, setValue]);

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
                            onClick={handleDownloadImage}
                          />
                          {user?.profile?.user?.is_staff && (
                              <Tooltip title={media?.template 
                                ? t("postDetailsPage.edit_in_designer_with_template") 
                                : t("postDetailsPage.edit_in_designer")
                              }>
                                <Button
                                  className={cn(
                                    styles.iconOverlay,
                                    styles.iconOverlay__edit,
                                    media?.template ? styles.hasTemplate : ''
                                  )}
                                  icon={<EditOutlined />}
                                  shape="circle"
                                  onClick={() => handleOpenInDesigner(media)}
                                />
                              </Tooltip>
                              )}
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
                              {post?.picture && (
                                <>
                                  <Image
                                    src={getImageUrlWithCacheBuster(post.picture)}
                                    className={styles.picture}
                                    alt={t("postDetailsPage.image_alt")}
                                    onError={handleImageError}
                                  />
                                  {/* Add a direct link to the image as a fallback */}
                                  {/* {refreshParam && (
                                    <div className={styles.imageRefreshNotice}>
                                      {t("postDetailsPage.image_updated")}
                                      <br />
                                      <a 
                                        href={post.picture} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className={styles.viewDirectLink}
                                      >
                                        {t("postDetailsPage.view_direct")}
                                      </a>
                                    </div>
                                  )} */}
                                </>
                              )}

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
                                onClick={handleDownloadImage}
                              />
                              {/* {user?.profile?.user?.is_staff && (
                              <Tooltip title={post?.template 
                                ? t("postDetailsPage.edit_in_designer_with_template") 
                                : t("postDetailsPage.edit_in_designer")
                              }>
                                <Button
                                  className={`${styles.editInDesignerButton} ${post?.template ? styles.hasTemplate : ''}`}
                                  icon={<EditOutlined />}
                                  shape="circle"
                                  onClick={handleOpenInDesigner}
                                />
                              </Tooltip>
                              )} */}
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
