import { useNavigate, useParams, useLocation } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import {
  useCreateVideoImageMutation,
  useGetVideoByIdQuery,
  useGetVideoMediasByIdQuery,
  useVideoNowMutation,
  useRecreateVideoImageMutation,
  useRecreateVideoTextMutation,
  TVideoMediaData,
  useUpdateVideoMutation,
  useUpdateVideoMediaTemplateMutation,
  useDeleteVideoMediaMutation,
  useUploadVideoFileMutation,
  useDeleteVideoFileMutation,
  usePatchVideoFileMutation,
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
  Modal,
  Row,
  Col,
  Card,
  Spin,
  Popconfirm,
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
  PictureOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import cn from "classnames";

import styles from "./VideoDetailsPage.module.scss";
import { useTypedSelector } from "hooks/useTypedSelector";
import avatar from "assets/avatar.png";
import { Controller, useForm } from "react-hook-form";
import { ModalImageStylesList } from "modules/post-query/components/ModalImageStylesList/ModalImageStylesList";
import {
  TImgStylesData,
  useGetImgStylesListQuery,
} from "../../../../redux/api/imgStyles/imgStylesApi";
import {
  useGetSocialMediaListByCurrentCompanyQuery,
  TSocialMediaByCurrentCompanyData,
} from "modules/social-media/redux/api";
import {
  TAddToSchedulersRequest,
  useAddToSchedulersMutation,
} from "modules/content-plan/redux/api";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store";
import { videoActions } from "../../redux/slices/video.slice";
import { WebSocketService } from "services/websocket";
import { createTemplate, fetchAllTemplates, copyTemplate } from "../../../design/services/designService";
import { Template } from "../../../design/types";
import { VideoContentPlanAddModal } from "../../components/VideoContentPlanAddModal/VideoContentPlanAddModal";
import { VideoContentPlanSocialMediaListModal } from "../../components/VideoContentPlanSocialMediaListModal/VideoContentPlanSocialMediaListModal";
const baseApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

export const VideoDetailsPage = () => {
  const { t } = useTranslation();

  const { id, videoQueryId } = useParams<{ id: string; videoQueryId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the refresh parameter from the URL
  const searchParams = new URLSearchParams(location.search);
  const refreshParam = searchParams.get('refresh');

  const { data: video, isLoading, refetch } = useGetVideoByIdQuery(id || "");
  const {
    data: videoMedias,
    isLoading: isMediasLoading,
    refetch: refetchVideoMedias,
  } = useGetVideoMediasByIdQuery(id || "");
  const { data: imgStylesList } = useGetImgStylesListQuery();
  const { data: socialMediaList, refetch: refetchSocialMediaList } =
    useGetSocialMediaListByCurrentCompanyQuery();
  const [recreateVideoImage, { isLoading: isRecreateVideoImageLoading }] =
    useRecreateVideoImageMutation();
  const [recreateVideoText, { isLoading: isRecreateVideoTextLoading }] =
    useRecreateVideoTextMutation();
  const [addToSchedulers, { isLoading: isAddingToSchedulers }] =
    useAddToSchedulersMutation();
  const [videoNow, { isLoading: isVideoNowLoading }] = useVideoNowMutation();
  const [updateVideo, { isLoading: isUpdating }] = useUpdateVideoMutation();
  const [createVideoImage, { isLoading: isCreating }] =
    useCreateVideoImageMutation();
  const [updateVideoMediaTemplate] = useUpdateVideoMediaTemplateMutation();
  const [deleteVideoMedia, { isLoading: isDeleting }] = useDeleteVideoMediaMutation();
  const [deleteVideoFile] = useDeleteVideoFileMutation();
  const [uploadVideoFile, { isLoading: isUploadingVideo }] = useUploadVideoFileMutation();
  const [patchVideoFile, { isLoading: isPatchingVideo }] = usePatchVideoFileMutation();

  const { user } = useTypedSelector((state) => state.auth);
  
  // Add Redux state for generation status
  const dispatch = useDispatch();
  const { textGenerationStatus, imageGenerationStatus } = useSelector(
    (state: RootState) => state.video
  );
  
  // WebSocket state
  const [wsService, setWsService] = useState<WebSocketService | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [currentImgStyle, setCurrentImgStyle] = useState(video?.img_style);
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

  // New state for template selector
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // State for video upload
  const [videoFile, setVideoFile] = useState<File | null>(null);

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

  // Function to load non-assignable templates
  const loadNonAssignableTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const allTemplates = await fetchAllTemplates('1080x1920');
      // Filter templates to include:
      // 1. Non-assignable default templates (system templates)
      // 2. User's own assignable templates
      const filteredTemplates = allTemplates.templates.filter(
        (template: Template) => (
          (!template.assignable && template.isDefault) || 
          (!template.assignable && template.user === user?.profile.user.id)
        )
      );
      setTemplates(filteredTemplates);
      setLoadingTemplates(false);
    } catch (error) {
      console.error('Error loading templates:', error);
      message.error(t('videoDetailsPage.template_apply_error'));
      setLoadingTemplates(false);
    }
  };

  // Function to show template selection modal
  const showTemplateModal = () => {
    loadNonAssignableTemplates();
    setIsTemplateModalOpen(true);
  };

  // Function to handle template selection
  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
  };

  // Function to apply the selected template
  const applySelectedTemplate = async () => {
    if (!selectedTemplate || !id || !user?.profile?.user?.id) {
      message.error('Please select a template first');
      return;
    }

    try {
      // 1. Create a copy of the template
      const newTemplateName = `Template for Cover ${id}`;
      const userId = user.profile.user.id;
      
      message.loading({
        content: t('videoDetailsPage.creating_template'),
        key: 'templateCreation',
      });
      
      // Copy the template with all its elements
      const newTemplate = await copyTemplate(
        selectedTemplate.uuid, 
        newTemplateName, 
        userId
      );
      
      if (!newTemplate || !newTemplate.uuid) {
        throw new Error('Failed to create template copy');
      }
      
      console.log('Created template copy:', newTemplate);
      
      // 2. Render the template as an image
      const templateImageUrl = selectedTemplate.thumbnail || '';
      
      if (!templateImageUrl) {
        message.error(t('videoDetailsPage.template_apply_error'));
        return;
      }
      
      console.log('Using template thumbnail:', templateImageUrl);
      
      // 3. Create a File object from the image URL
      try {
        // Get current media list before adding new one
        const beforeMediaResponse = await refetchVideoMedias();
        const existingMediaIds = beforeMediaResponse.data ? 
          beforeMediaResponse.data.map(media => media.id) : [];
        
        console.log('Existing media IDs before creating new media:', existingMediaIds);
        
        const response = await fetch(templateImageUrl);
        const blob = await response.blob();
        
        // Add a timestamp to the filename to make it unique
        const timestamp = new Date().getTime();
        const file = new File(
          [blob], 
          `template_${selectedTemplate.uuid}_${timestamp}.png`, 
          { type: 'image/png' }
        );
        
        console.log('Created file from template thumbnail:', file.name);
        
        // 4. Upload the image to the post media and wait for it to complete
        const result = await createVideoImage({
          video: id,
          media: [file],
        }).unwrap();
        
        // Log the entire result structure to debug
        console.log('Full image upload result:', JSON.stringify(result, null, 2));
        
        // Wait longer for the media to be fully processed in the backend
        message.loading({
          content: t('videoDetailsPage.processing_image'),
          key: 'processingImage',
        });
        
        // Increase wait time to 5 seconds
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Get updated media list after adding new one
        const afterMediaResponse = await refetchVideoMedias();
        
        if (!afterMediaResponse.data || afterMediaResponse.data.length === 0) {
          throw new Error('Failed to fetch updated media list or no media found');
        }
        
        // Find the newly created media by comparing before and after lists
        const newMediaItems = afterMediaResponse.data.filter(
          media => !existingMediaIds.includes(media.id)
        );
        
        console.log('New media items detected:', newMediaItems);
        
        if (newMediaItems.length === 0) {
          throw new Error('Could not identify newly created media');
        }
        
        // Use the most recently created media (should be just one, but take the last to be safe)
        const newMedia = newMediaItems[newMediaItems.length - 1];
        const newMediaId = newMedia.id;
        
        console.log('Selected new media for template update:', newMedia);
        console.log('New media ID for template update:', newMediaId);
        
        if (!newMediaId) {
          console.error('New media does not have an ID:', newMedia);
          throw new Error('New media does not have an ID');
        }
        
        // 5. Now link the newly created media with the template
        try {
          // Create form data for the request
          const formData = new URLSearchParams();
          formData.append('template_uuid', newTemplate.uuid);
          
          // Extract the base domain without any path
          const urlParts = baseApiUrl.split('/');
          const domain = urlParts[0] + '//' + urlParts[2]; // e.g., https://api.aimmagic.com
          
          // Force the correct endpoint with /api/ and use the ID from the new media
          const updateTemplateUrl = `${domain}/api/post-media/${newMediaId}/update-template/`;
          
          console.log('Base API URL:', baseApiUrl);
          console.log('Extracted domain:', domain);
          console.log('Updating template at URL:', updateTemplateUrl);
          console.log('Template UUID being sent:', newTemplate.uuid);
          
          // Get CSRF token from cookies
          const getCookie = (name: string): string | null => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) {
              return parts.pop()?.split(';').shift() || null;
            }
            return null;
          };
          
          // Get the csrftoken
          const csrfToken = getCookie('csrftoken');
          console.log('CSRF Token:', csrfToken);
          
          // First, try to use the RTK mutation to leverage its built-in CSRF handling
          try {
            // Update the post media with the template UUID - use the ID from the new media
            const updateResult = await updateVideoMediaTemplate({
              id: newMediaId,
              template_uuid: newTemplate.uuid,
            }).unwrap();
            
            console.log('Template update response (RTK):', updateResult);
            
            // Final refresh to get the updated media
            await refetchVideoMedias();
            
            message.success(t('videoDetailsPage.template_applied'), 3);
            setIsTemplateModalOpen(false);
            setSelectedTemplate(null);
            return;
          } catch (rtkError) {
            console.error('Failed to update template using RTK mutation:', rtkError);
            // Continue with manual fetch as fallback
          }
          
          // Send the request to update the post media with the template UUID
          const updateResponse = await fetch(updateTemplateUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
              'X-CSRFToken': csrfToken || '',
              'X-Requested-With': 'XMLHttpRequest',
              'Referer': window.location.href
            },
            body: formData,
            credentials: 'include',
            mode: 'cors'
          });
          
          // Log the raw response first
          console.log('Template update response status:', updateResponse.status);
          console.log('Template update response statusText:', updateResponse.statusText);
          
          let responseData;
          try {
            // Try to parse the response as JSON
            responseData = await updateResponse.json();
            console.log('Template update response data:', responseData);
          } catch (jsonError) {
            // If parsing as JSON fails, get the text
            const textResponse = await updateResponse.text();
            console.log('Template update raw response:', textResponse);
            responseData = { text: textResponse };
          }
          
          if (!updateResponse.ok) {
            // Try a different approach using the Django REST API endpoint directly
            try {
              // Use the API endpoint without the api/ prefix as a fallback
              const alternateUrl = `${domain}/post-media/${newMediaId}/update-template/`;
              console.log('Trying alternate URL:', alternateUrl);
              
              const alternateResponse = await fetch(alternateUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Accept': 'application/json',
                  'X-CSRFToken': csrfToken || '',
                  'X-Requested-With': 'XMLHttpRequest',
                  'Referer': window.location.href
                },
                body: formData,
                credentials: 'include',
                mode: 'cors'
              });
              
              console.log('Alternate response status:', alternateResponse.status);
              
              if (alternateResponse.ok) {
                const alternateData = await alternateResponse.json();
                console.log('Alternate update succeeded:', alternateData);
                
                // Final refresh to get the updated media
                await refetchVideoMedias();
                
                message.success(t('videoDetailsPage.template_applied'), 3);
                setIsTemplateModalOpen(false);
                setSelectedTemplate(null);
                return;
              } else {
                console.error('Alternate update failed');
              }
            } catch (alternateError) {
              console.error('Error with alternate approach:', alternateError);
            }
            
            // If still failed, try to use the API directly
            try {
              const apiResponse = await fetch(`${domain}/graphql/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-CSRFToken': csrfToken || '',
                  'X-Requested-With': 'XMLHttpRequest',
                  'Referer': window.location.href
                },
                body: JSON.stringify({
                  query: `
                    mutation UpdatePostMediaTemplate($id: ID!, $templateUuid: String!) {
                      updatePostMediaTemplate(id: $id, templateUuid: $templateUuid) {
                        success
                        media {
                          id
                          template
                        }
                      }
                    }
                  `,
                  variables: {
                    id: newMediaId,
                    templateUuid: newTemplate.uuid
                  }
                }),
                credentials: 'include',
                mode: 'cors'
              });
              
              const apiData = await apiResponse.json();
              console.log('GraphQL API response:', apiData);
              
              if (apiData.data?.updatePostMediaTemplate?.success) {
                message.success(t('videoDetailsPage.template_applied'), 3);
                await refetchVideoMedias();
                setIsTemplateModalOpen(false);
                setSelectedTemplate(null);
                return;
              }
            } catch (apiError) {
              console.error('GraphQL API error:', apiError);
            }
            
            throw new Error(`Failed to update post media with template: ${updateResponse.statusText}`);
          }
          
          // Final refresh to get the updated media
          await refetchVideoMedias();
          
          message.success(t('videoDetailsPage.template_applied'), 3);
          setIsTemplateModalOpen(false);
          setSelectedTemplate(null);
        } catch (error: unknown) {
          console.error('Error updating template:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          message.error(`${t('videoDetailsPage.template_update_error')}: ${errorMessage}`);
        } finally {
          message.destroy('processingImage');
        }
      } catch (error: unknown) {
        console.error('Error processing template image:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        message.error(`${t('videoDetailsPage.template_apply_error')}: ${errorMessage}`);
      }
    } catch (error: unknown) {
      console.error('Error applying template:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      message.error(`${t('videoDetailsPage.template_apply_error')}: ${errorMessage}`);
    } finally {
      message.destroy('templateCreation');
    }
  };

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
      recreateVideoImage({
        id: video?.id,
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
      recreateVideoText({
        id: video?.id,
        txt_prompt: data.textDescription,
        main_text: video?.main_text,
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
        ? [] // If already selected, deselect it
        : [mediaPost] // If not selected, select only this one
    );
  };

  const handleVideoNow = () => {
    if (video?.id) {
      const previousVideoImageId = selectedMedias.length > 0
        ? selectedMedias[0]
        : videoMedias && videoMedias.length > 0
          ? videoMedias[0].id
          : undefined;

      videoNow({
        video_id: video.id,
        social_media_account_ids: selectedNewSocialMedias.map(
          (media) => media.id
        ),
        previous_video_image_id: previousVideoImageId,
      })
        .unwrap()
        .then((res) => {
          refetchVideoMedias()
            .unwrap()
            .then(() => {
              setIsContentPlanSocialMediaListModalOpen(false);
              setSelectedNewSocialMedias([]);
              message.success(t("videoDetailsPage.video_now_success"));
            });
        })
        .catch((error) => {
          message.error(t("videoDetailsPage.video_now_error"));
          console.error("Error in video now:", error);
        });
    }
  };

  const handleUpdateLike = () => {
    if (video) {
      const updatedData = {
        id: id,
        title: video?.title,
        img_prompt: video?.img_prompt,
        txt_prompt: video?.txt_prompt,
        main_text: video?.main_text,
        hashtags: video?.hashtags,
        like: video?.like ? false : true,
        active: video.active,
        img_style: video.img_style?.id,
        video_query: video.video_query,
        author: user?.profile.id,
      };

      // @ts-ignore
      updateVideo(updatedData)
        .unwrap()
        .then(() => {
          refetch()
            .unwrap()
            .then(() => {
              message.success(
                video?.like
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
      message.error(t("videoDetailsPage.invalid_file_type"));
      return;
    }

    if (files.length > 10) {
      message.error(t("videoDetailsPage.error_max_files"));
      return;
    }

    setFileList(files);
  };

  const handleUploadConfirm = async () => {
    try {
      await createVideoImage({
        video: id,
        media: fileList,
      })
        .unwrap()
        .then(() => {
        refetchVideoMedias();
          message.success(t("videoDetailsPage.update_success"));
          setFileList([]);
        });
    } catch (error) {
      message.error(t("videoDetailsPage.image_upload_error"));
    }
  };

  const handleOpenInDesigner = async (mediaItem: TVideoMediaData) => {
    try {
      // Add more detailed logging
      console.log("Full video data:", video);
      console.log("Selected media item:", mediaItem);
      console.log("Media template value:", mediaItem?.template, typeof mediaItem?.template);
      
      // Try to fetch the post media directly to see what the API returns
      let mediaData;
      try {
        const response = await fetch(`${baseApiUrl}/video-media/${mediaItem.id}/`, {
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
        let url = `/design/editor/${templateUuid}?source=videoMedia&videoId=${video?.id}&mediaId=${mediaItem.id}`;
        
        // If we have a postQueryId, add it to the URL
        if (videoQueryId) {
            url += `&videoQueryId=${videoQueryId}`;
        }
        
        navigate(url);
        return; // Exit early since we're using the existing template
      } else {
        // Create a new template with the media image as background
        const templateName = `Edit from Video ${video?.id || ''} Media ${mediaItem.id}`;
        const templateSize = '1080x1920'; // Explicitly use 1080x1920 for vertical format
        console.log(`Using template size: ${templateSize} for new template`);
        
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
          video?.id, // Pass the video ID to fetch the video image if needed
          mediaItem.id // Add the mediaId parameter
        );
        
        if (newTemplate && mediaItem.id) {
          // Update the media with the template UUID
          try {
            // Create form data for the request
            const formData = new URLSearchParams();
            formData.append('template_uuid', newTemplate.uuid);
            
            // Send the request to update the post media with the template UUID
            await fetch(`${baseApiUrl}/video-media/${mediaItem.id}/update-template/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: formData,
              credentials: 'include',
            });
            
            console.log(`Post media ${mediaItem.id} updated with template ${newTemplate.uuid}`);
          } catch (error) {
            console.error('Error updating video media with template UUID:', error);
          }
          
          templateUuid = newTemplate.uuid;
        }
      }
      
      if (templateUuid) {
        // Navigate to the template editor with the template
        // Pass source=postMedia, postId, and mediaId parameters to identify where we came from
        let url = `/design/editor/${templateUuid}?source=videoMedia&videoId=${video?.id}&mediaId=${mediaItem.id}`;
        
        // If we have a postQueryId, add it to the URL
        if (videoQueryId) {
          url += `&videoQueryId=${videoQueryId}`;
        }
        
        navigate(url);
      }
    } catch (error) {
      console.error('Error creating template from media image:', error);
      message.error(t("videoDetailsPage.error_creating_template"));
    }
  };

  const handleDownloadImage = async () => {
    try {
      if (!video?.cover) {
        message.error(t("videoDetailsPage.image_not_found"));
        return;
      }

      const response = await fetch(video?.cover, {
        method: "GET",
        mode: "cors",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(t("videoDetailsPage.image_download_error"));
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
      message.success(t("videoDetailsPage.image_download_success"));
    } catch (error) {
      console.error(t("videoDetailsPage.image_download_error"), error);
      message.error(t("videoDetailsPage.image_download_error"));
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
    const imageUpdated = localStorage.getItem(`video_${id}_image_updated`);
    const newImageUrl = localStorage.getItem(`video_${id}_new_image_url`);
    const oldImageUrl = localStorage.getItem(`video_${id}_old_image_url`);
    const updateTimestamp = localStorage.getItem(`video_${id}_update_timestamp`);
    
    if (imageUpdated === 'true' && newImageUrl && video) {
      // Clear the localStorage flags
      localStorage.removeItem(`video_${id}_image_updated`);
      localStorage.removeItem(`video_${id}_new_image_url`);
      localStorage.removeItem(`video_${id}_old_image_url`);
      localStorage.removeItem(`video_${id}_update_timestamp`);
      
      // Force a refetch of the video data
      refetch();
      refetchVideoMedias();
      
      // Show a notification that the image has been updated
      message.success(t("videoDetailsPage.image_updated_from_editor"));
      
      // Force browser to clear image cache
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        const src = img.getAttribute('src');
        if (src && (src.includes(oldImageUrl || '') || src.includes(video?.cover || ''))) {
          // Set a new src with cache buster
          img.setAttribute('src', getImageUrlWithCacheBuster(newImageUrl));
        }
      });
    }
  }, [id, video, refetch, refetchVideoMedias, t]);
  
  // Force a refetch when the component mounts or when the refresh parameter changes
  useEffect(() => {
    // Refetch the video data
    refetch();
    refetchVideoMedias();
    
    // Force browser to clear image cache
    if (refreshParam) {
      // Clear browser cache for images
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        const src = img.getAttribute('src');
        if (src && src.includes(video?.cover || '')) {
          // Set a new src with cache buster
          img.setAttribute('src', getImageUrlWithCacheBuster(src));
        }
      });
    }
  }, [id, refreshParam, refetch, refetchVideoMedias, video?.cover]);
  
  // Add a function to handle image errors
  const handleImageError = () => {
    console.error('Image failed to load:', video?.cover);
    // Try to reload the image with a new cache buster
    const timestamp = Date.now();
    if (video?.cover) {
      const newSrc = `${video.cover}?t=${timestamp}`;
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
          previous_img: video?.cover || '/media/no_img.jpeg' // Add the current image to check if it changes
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
          dispatch(videoActions.setTextGenerationStatus(status));
        }
        
        if (data.image_generated !== undefined) {
          const status = data.image_generated ? 'completed' : 'pending';
          dispatch(videoActions.setImageGenerationStatus(status));
        }
        
        // If the message indicates we're still generating, set a timeout to force refresh
        if (data.message && data.message.includes('Still generating')) {
          setTimeout(() => {
            refetch();
            refetchVideoMedias();
          }, 3000);
        }
      } 
      // Final result
      else if (data.result === 'ok') {
        // Update generation status based on the final result
        if (data.text_generated !== undefined) {
          const status = data.text_generated ? 'completed' : 'failed';
          dispatch(videoActions.setTextGenerationStatus(status));
        }
        
        if (data.image_generated !== undefined) {
          const status = data.image_generated ? 'completed' : 'failed';
          dispatch(videoActions.setImageGenerationStatus(status));
        }
        
        // Always refresh the post data when we get a final result
        refetch();
        refetchVideoMedias();
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
      dispatch(videoActions.setTextGenerationStatus('pending'));
      dispatch(videoActions.setImageGenerationStatus('pending'));
      
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
    if (video && video.cover && video.cover !== '/media/no_img.jpeg') {
      dispatch(videoActions.setImageGenerationStatus('completed'));
      
      // Refresh the video data when the image is generated
      refetch();
      refetchVideoMedias();
    }
  }, [video, dispatch, refetch, refetchVideoMedias]);
  
  // Force a refresh after 10 seconds if we're still in pending state
  useEffect(() => {
    if ((textGenerationStatus === 'pending' || imageGenerationStatus === 'pending') && id && video) {
      const timer = setTimeout(() => {
        refetch();
        refetchVideoMedias();
        
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
          let previousImg = video?.cover || '/media/no_img.jpeg';
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
  }, [textGenerationStatus, imageGenerationStatus, id, user, wsService, video, refetch, refetchVideoMedias]);

  // Replace interval polling with WebSocket
  useEffect(() => {
    if (video) {
      const {
        txt_prompt,
        img_prompt,
        img_style,
      } = video;

      setValue("imageDescription", img_prompt || "");
      setValue("textDescription", txt_prompt || "");
      setCurrentImgStyle(img_style);
      
      // No need for interval polling as we're using WebSocket now
    }
  }, [video, setValue]);

  // Add template selection modal
  const renderTemplateModal = () => {
    return (
      <Modal
        title={t('videoDetailsPage.select_template')}
        open={isTemplateModalOpen}
        onCancel={() => setIsTemplateModalOpen(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setIsTemplateModalOpen(false)}>
            {t('videoDetailsPage.cancel')}
          </Button>,
          <Button
            key="apply"
            type="primary"
            disabled={!selectedTemplate}
            onClick={applySelectedTemplate}
          >
            {t('videoDetailsPage.apply_template')}
          </Button>,
        ]}
      >
        {loadingTemplates ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>{t('videoDetailsPage.loading_templates')}</div>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <Text>{t('videoDetailsPage.select_banner_template')}</Text>
            </div>
            <Row gutter={[16, 16]}>
              {templates.length > 0 ? (
                templates.map((template) => (
                  <Col xs={24} sm={12} md={8} key={template.uuid}>
                    <Card
                      hoverable
                      style={{
                        height: '100%',
                        border: selectedTemplate?.uuid === template.uuid ? '2px solid #1890ff' : undefined,
                      }}
                      onClick={() => handleTemplateSelect(template)}
                      cover={
                        template.thumbnail ? (
                          <div style={{ height: 150, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '8px', background: '#f5f5f5' }}>
                            <img
                              alt={template.name}
                              src={template.thumbnail}
                              style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                            />
                          </div>
                        ) : (
                          <div style={{ height: 150, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '16px', background: '#f5f5f5' }}>
                            <PictureOutlined style={{ fontSize: 32, opacity: 0.5 }} />
                            <div style={{ marginTop: '8px' }}>{t('videoDetailsPage.no_preview')}</div>
                          </div>
                        )
                      }
                    >
                      <Card.Meta
                        title={template.name}
                        description={template.size}
                      />
                    </Card>
                  </Col>
                ))
              ) : (
                <Col span={24}>
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Text>{t('videoDetailsPage.no_banner_templates')}</Text>
                  </div>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>
    );
  };

  // Add a handler for deleting post media
  const handleDeleteMedia = async (mediaId: string) => {
    try {
      await deleteVideoMedia(mediaId).unwrap();
      message.success(t('videoDetailsPage.media_deleted_success'));
      refetchVideoMedias();
    } catch (error) {
      console.error('Error deleting media:', error);
      message.error(t('videoDetailsPage.media_deleted_error'));
    }
  };

  // Function to upload video
  const handleUploadVideo = async () => {
    if (!videoFile || !id) return;

    try {
      // Show loading message
      const loadingMsg = message.loading({
        content: video?.media 
          ? t("videoDetailsPage.updating_video") 
          : t("videoDetailsPage.uploading_video"),
        key: 'videoUpload',
        duration: 0,
      });
      
      console.log(`Starting video ${video?.media ? 'update' : 'upload'} for file:`, videoFile.name);
      
      // Use different API calls based on whether we're updating an existing video or uploading a new one
      const apiCall = video?.media 
        ? patchVideoFile({ video_id: id, video_file: videoFile }) 
        : uploadVideoFile({ video_id: id, video_file: videoFile });
      
      const result = await apiCall.unwrap();
      
      console.log('Upload response:', result);
      
      // Hide loading message and show success
      loadingMsg();
      message.success({
        content: t("videoDetailsPage.video_upload_success"),
        key: 'videoUpload'
      });
      
      // Force refetch to get the updated video URL
      await refetch();
      setVideoFile(null);
      
      // Force browser to reload the page to see the new video
      window.location.reload();
    } catch (error) {
      console.error('Error uploading video:', error);
      message.error({
        content: t("videoDetailsPage.video_upload_error"),
        key: 'videoUpload'
      });
    }
  };

  // Function to get video URL with proper domain
  const getVideoUrl = (videoPath: string) => {
    if (!videoPath) return '';
    
    if (videoPath.startsWith('http')) {
      return videoPath;
    }
    
    // Build the full URL from the API base URL
    const baseUrl = process.env.REACT_APP_API_URL || '';
    const apiUrl = baseUrl.replace('/api/', '').replace('/api', '');
    
    return `${apiUrl}${videoPath.startsWith('/') ? '' : '/'}${videoPath}`;
  };

  // Function to delete video
  const handleDeleteVideo = async () => {
    if (!id) return;

    try {
      await deleteVideoFile(id).unwrap();
      message.success(t("videoDetailsPage.video_delete_success"));
      refetch();
    } catch (error) {
      console.error('Error deleting video:', error);
      message.error(t("videoDetailsPage.video_delete_error"));
    }
  };

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
                    {videoMedias && videoMedias.length > 3 && (
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
                      {videoMedias?.map((media) => (
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
                          {(
                            <>
                              <Popconfirm
                                title={t("videoDetailsPage.confirm_delete_media")}
                                onConfirm={() => handleDeleteMedia(media.id)}
                                okText={t("videoDetailsPage.yes")}
                                cancelText={t("videoDetailsPage.no")}
                              >
                                <Button
                                  className={cn(
                                    styles.iconOverlay,
                                    styles.iconOverlay__delete
                                  )}
                                  icon={<DeleteOutlined />}
                                  shape="circle"
                                  loading={isDeleting}
                                />
                              </Popconfirm>
                              <Tooltip title={media?.template 
                                ? t("videoDetailsPage.edit_in_designer_with_template") 
                                : t("videoDetailsPage.edit_in_designer")
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
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                    {videoMedias && videoMedias.length > 3 && (
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
                        {t("videoDetailsPage.select_file")}
                      </Button>
                    </Upload>

                      <Button
                        className={styles.uploadBanner}
                        type="primary"
                        onClick={showTemplateModal}
                        icon={<PictureOutlined />}
                      >
                        {t("videoDetailsPage.add_banner")}
                      </Button>

                    {fileList.length ? (
                      <Button
                        className={styles.uploadConfirm}
                        type="primary"
                        onClick={handleUploadConfirm}
                        loading={isCreating}
                      >
                        {t("videoDetailsPage.upload_image")}
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
                          {video?.cover?.includes("no_img") ? (
                            <LoadingOutlined className={styles.loader} />
                          ) : (
                            <>
                              {video?.cover && (
                                <>
                                  <Image
                                    src={getImageUrlWithCacheBuster(video.cover)}
                                    className={styles.picture}
                                    alt={t("videoDetailsPage.image_alt")}
                                    onError={handleImageError}
                                  />
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
                            </>
                          )}
                        </div>
                        {/* <Collapse className={styles.postDescription}>
                        <Panel header="Описание" key="1">
                          <Text>{post?.img_prompt}</Text>
                        </Panel>
                      </Collapse> */}
                      </div>
                      {/* Video Panel - Add below the picture block */}
                      <div className={styles.videoPanel}>
                        <Title level={5}>{t("videoDetailsPage.video_file")}</Title>
                        {video?.media ? (
                          <div className={styles.videoContainer}>
                            <video 
                              src={getVideoUrl(video.media)} 
                              controls 
                              className={`${styles.videoPlayer} videoPlayer`}
                              // poster={video.cover}
                              onError={(e) => {
                                console.error('Error loading video:', e);
                                message.error(t("videoDetailsPage.video_load_error"));
                              }}
                            />
                            <div className={styles.videoActions}>
                              {/* <Button 
                                icon={<EditOutlined />} 
                                onClick={() => {
                                  // Show upload component for changing video
                                  const uploadInput = document.createElement('input');
                                  uploadInput.type = 'file';
                                  uploadInput.accept = 'video/mp4,video/quicktime,video/x-msvideo,video/x-ms-wmv,video/x-matroska';
                                  uploadInput.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) {
                                      const validTypes = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/x-ms-wmv", "video/x-matroska"];
                                      
                                      if (!validTypes.includes(file.type)) {
                                        message.error(t("videoDetailsPage.invalid_video_type"));
                                        return;
                                      }
                                      
                                      if (file.size > 100 * 1024 * 1024) {
                                        message.error(t("videoDetailsPage.error_max_video_size"));
                                        return;
                                      }
                                      
                                      setVideoFile(file);
                                      // Trigger upload immediately
                                      setTimeout(() => {
                                        handleUploadVideo();
                                      }, 0);
                                    }
                                  };
                                  uploadInput.click();
                                }}
                              >
                                {t("videoDetailsPage.change_video")}
                              </Button> */}
                              <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => {
                                  Modal.confirm({
                                    title: t("videoDetailsPage.confirm_delete_video"),
                                    onOk: async () => {
                                      try {
                                        // Show loading
                                        const loadingMsg = message.loading({
                                          content: t("videoDetailsPage.deleting_video"),
                                          key: 'videoDelete',
                                          duration: 0,
                                        });
                                        
                                        await handleDeleteVideo();
                                        
                                        // Hide loading and show success
                                        loadingMsg();
                                        message.success({
                                          content: t("videoDetailsPage.video_delete_success"),
                                          key: 'videoDelete'
                                        });
                                        
                                        // Force reload to update UI
                                        window.location.reload();
                                      } catch (error) {
                                        console.error('Error during video deletion:', error);
                                        message.error(t("videoDetailsPage.video_delete_error"));
                                      }
                                    },
                                    okText: t("videoDetailsPage.yes"),
                                    cancelText: t("videoDetailsPage.no"),
                                  });
                                }}
                              >
                                {t("videoDetailsPage.delete_video")}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className={styles.uploadVideoContainer}>
                            <Upload
                              name="video"
                              accept="video/mp4,video/quicktime,video/x-msvideo,video/x-ms-wmv,video/x-matroska"
                              showUploadList={false}
                              maxCount={1}
                              beforeUpload={(file) => {
                                const validTypes = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/x-ms-wmv", "video/x-matroska"];
                                
                                if (!validTypes.includes(file.type)) {
                                  message.error(t("videoDetailsPage.invalid_video_type"));
                                  return Upload.LIST_IGNORE;
                                }
                                
                                if (file.size > 100 * 1024 * 1024) {
                                  message.error(t("videoDetailsPage.error_max_video_size"));
                                  return Upload.LIST_IGNORE;
                                }
                                
                                setVideoFile(file);
                                return false;
                              }}
                            >
                              <Button icon={<UploadOutlined />}>
                                {t("videoDetailsPage.select_video")}
                              </Button>
                            </Upload>
                            {videoFile && (
                              <>
                                <div className={styles.selectedFile}>
                                  {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                                </div>
                                <Button
                                  type="primary"
                                  onClick={handleUploadVideo}
                                  loading={isUploadingVideo || isPatchingVideo}
                                >
                                  {t("videoDetailsPage.upload_video")}
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <div className={styles.postContent}>
                        <div className={styles.postContent__titleBlock}>
                          <Title level={3}>{video?.title}</Title>
                          <Tooltip title={t("videoDetailsPage.copy")}>
                            <Button
                              className={styles.postContent__icon}
                              icon={<CopyOutlined />}
                              onClick={() => {
                                if (
                                  video?.title ||
                                  video?.main_text ||
                                  video?.hashtags
                                ) {
                                  const mainTextCleaned =
                                    video.main_text?.replace(/\n\n/g, " ");
                                  const textToCopy = [
                                    video.title,
                                    mainTextCleaned,
                                    video.hashtags,
                                  ]
                                    .filter(Boolean)
                                    .join("\n\n");

                                  navigator.clipboard
                                    .writeText(textToCopy)
                                    .then(
                                      () => {
                                        message.success(
                                          t("videoDetailsPage.copy_success")
                                        );
                                      },
                                      () => {
                                        message.error(
                                          t("videoDetailsPage.copy_error")
                                        );
                                      }
                                    );
                                }
                              }}
                            />
                          </Tooltip>
                        </div>
                        <div className={styles.postContent__text}>
                          {video?.main_text ? formatText(video.main_text) : null}
                        </div>
                        <div className={styles.postHashtags}>
                          <Text>{video?.hashtags}</Text>
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
                            video?.like ? styles.iconHeart__active : ""
                          )}
                          onClick={handleUpdateLike}
                        />
                        <Text>{t("videoDetailsPage.add_to_favorites")}</Text>
                      </div>
                      <div className={styles.postActions}>
                        <Button
                          type="primary"
                          onClick={() =>
                            navigate(
                            `/video/${video?.video_query}/${video?.id}/update`
                            )
                          }
                        >
                          {t("videoDetailsPage.edit")}
                        </Button>
                        <Button
                          type="primary"
                          onClick={handleShowContentPlanSocialMediaListModal}
                        >
                          {t("videoDetailsPage.publish_now")}
                        </Button>
                        <Button
                          type="primary"
                          onClick={handleShowContentPlanAddPostModal}
                        >
                          {t("videoDetailsPage.add_to_scheduler")}
                        </Button>
                        <Button
                          htmlType="button"
                          type="default"
                          onClick={() => navigate(-1)}
                        >
                          {t("videoDetailsPage.cancel")}
                        </Button>
                      </div>
                    </div>
                  </div>
                  {isEditBlockShow && (
                    <div className={styles.editBlock}>
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <div className={styles.parameters}>
                          <Title level={4}>
                            {t("videoDetailsPage.image_parameters")}
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
                                    isRecreateVideoImageLoading ||
                                    isRecreateVideoTextLoading
                                  }
                                >
                                  {t("videoDetailsPage.keep_image")}
                                </Radio>
                                <Radio
                                  value="newImage"
                                  disabled={
                                    isRecreateVideoImageLoading ||
                                    isRecreateVideoTextLoading
                                  }
                                >
                                  {t("videoDetailsPage.create_new_image")}
                                </Radio>
                                <Radio
                                  value="newDescriptionImage"
                                  disabled={
                                    isRecreateVideoImageLoading ||
                                    isRecreateVideoTextLoading
                                  }
                                >
                                  {t(
                                    "videoDetailsPage.create_with_new_description"
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
                                    !isRecreateVideoImageLoading ||
                                    !isRecreateVideoTextLoading
                                  ) {
                                    handleOpenModal();
                                  }
                                }}
                              >
                                <Title level={4}>
                                  {t("videoDetailsPage.image_style")}:{" "}
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
                                      "videoDetailsPage.enter_image_description"
                                    )}
                                    className={styles.textArea}
                                    disabled={
                                      isRecreateVideoImageLoading ||
                                      isRecreateVideoTextLoading
                                    }
                                  />
                                )}
                              />
                            </div>
                          )}
                          <Title level={4}>
                            {t("videoDetailsPage.text_parameters")}
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
                                    isRecreateVideoImageLoading ||
                                    isRecreateVideoTextLoading
                                  }
                                >
                                  {t("videoDetailsPage.keep_text")}
                                </Radio>
                                <Radio
                                  value="newText"
                                  disabled={
                                    isRecreateVideoImageLoading ||
                                    isRecreateVideoTextLoading
                                  }
                                >
                                  {t("videoDetailsPage.create_new_text")}
                                </Radio>
                                <Radio
                                  value="newDescriptionText"
                                  disabled={
                                    isRecreateVideoImageLoading ||
                                    isRecreateVideoTextLoading
                                  }
                                >
                                  {t(
                                    "videoDetailsPage.create_with_new_description"
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
                                    "videoDetailsPage.enter_text_description"
                                  )}
                                  className={styles.textArea}
                                  disabled={
                                    isRecreateVideoImageLoading ||
                                    isRecreateVideoTextLoading
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
                            isRecreateVideoImageLoading ||
                            isRecreateVideoTextLoading ||
                            (imageOption === "keepImage" &&
                              textOption === "keepText")
                          }
                          loading={
                            isRecreateVideoImageLoading ||
                            isRecreateVideoTextLoading
                          }
                        >
                          {t("videoDetailsPage.submit_request")}
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
      {renderTemplateModal()}
      <ModalImageStylesList
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        imgStylesList={imgStylesList}
        handleChangeCurrentImgStyle={handleChangeCurrentImgStyle}
      />
      <VideoContentPlanAddModal
        isModalOpen={isContentPlanAddPostModalOpen}
        setIsModalOpen={setIsContentPlanAddPostModalOpen}
        handleShowContentPlanSocialMediaListModal={
          handleShowContentPlanSocialMediaListModal
        }
        selectNewVideo={video}
        selectedNewSocialMedias={selectedNewSocialMedias}
        isAddingToSchedulers={isAddingToSchedulers}
        handleAddToSchedulers={handleAddToSchedulers}
        handleClearAddModalParams={handleClearAddModalParams}
        isVideoNowLoading={isVideoNowLoading}
        handleVideoNow={handleVideoNow}
      />
      <VideoContentPlanSocialMediaListModal
        isModalOpen={isContentPlanSocialMediaListModalOpen}
        setIsModalOpen={setIsContentPlanSocialMediaListModalOpen}
        socialMediaList={socialMediaList}
        handleSelectNewSocialMedias={handleSelectNewSocialMedias}
        selectedNewSocialMedias={selectedNewSocialMedias}
        isVideoNow={true}
        isVideoNowLoading={isVideoNowLoading}
        handleVideoNow={handleVideoNow}
      />
    </>
  );
};
