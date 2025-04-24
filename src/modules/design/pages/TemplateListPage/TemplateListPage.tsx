import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Col, Row, Input, Tabs, Select, Typography, Spin, message, Tooltip, Tag, Pagination } from 'antd';
import { PlusOutlined, SearchOutlined, PictureOutlined, HeartOutlined, HeartFilled, CheckCircleOutlined } from '@ant-design/icons';
import { Template, TemplateSizeType } from '../../types';
import './TemplateListPage.scss';
import { useTypedSelector } from 'hooks/useTypedSelector';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';
import { useDispatch } from 'react-redux';
import { 
  useGetTemplatesQuery, 
  useCreateTemplateMutation,
  useToggleLikeTemplateMutation,
  templatesActions
} from '../../redux';
import { formatApiUrl, copyDefaultTemplate } from '../../services/designService';

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const PAGE_SIZE = 12; // Number of templates per page

const TemplateListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get state from Redux
  const { selectedSize, currentPage, searchQuery, activeTab } = useTypedSelector((state) => state.templates);
  const { user } = useTypedSelector((state) => state.auth);

  // Use RTK Query for data fetching
  const { 
    data: templatesData, 
    isLoading, 
    isFetching, 
    error 
  } = useGetTemplatesQuery({
    size: selectedSize,
    page: currentPage,
    pageSize: PAGE_SIZE,
    searchQuery,
    tab: activeTab
  });

  // Get templates and total from the query result or use empty values
  const templates = templatesData?.templates || [];
  const totalTemplates = templatesData?.total || 0;

  // Mutations
  const [createTemplate] = useCreateTemplateMutation();
  const [toggleLikeTemplate] = useToggleLikeTemplateMutation();

  // Handle search with debounce
  const debouncedSearch = debounce((value: string) => {
    dispatch(templatesActions.setSearchQuery(value));
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleTabChange = (key: string) => {
    dispatch(templatesActions.setActiveTab(key as 'all' | 'my' | 'liked'));
  };

  const handleSizeChange = (value: TemplateSizeType) => {
    dispatch(templatesActions.setSelectedSize(value));
  };

  const handlePageChange = (page: number) => {
    dispatch(templatesActions.setCurrentPage(page));
  };

  const handleCreateTemplate = async () => {
    try {
      // Get the user ID from the user context
      const userId = user?.profile?.user?.id;
      
      if (!userId) {
        message.error(t('templateListPage.must_be_logged_in'));
        return;
      }
      
      const newTemplate = await createTemplate({
        name: `New Template ${new Date().toLocaleTimeString()}`, 
        size: selectedSize,
        userId     // Pass the user ID
      }).unwrap();
      
      navigate(`/design/editor/${newTemplate.uuid}`);
    } catch (error) {
      console.error('Error creating template:', error);
      message.error(t('templateListPage.error_create_template'));
    }
  };

  const handleTemplateClick = async (uuid: string) => {
    try {
      // Find the template that was clicked
      const template = templates.find(t => t.uuid === uuid);
      
      if (!template) {
        console.error('Template not found:', uuid);
        return;
      }
      
      console.log('Template clicked:', template);
      console.log('Is default template?', template.isDefault);
      console.log('isDefault type:', typeof template.isDefault);
      
      // More robust checking for isDefault - check all possible truthy conditions
      const isTemplateDefault = 
        template.isDefault === true || 
        String(template.isDefault).toLowerCase() === 'true';
        
      console.log('Using robust isDefault check:', isTemplateDefault);
      
      // Always make a copy if it's a default template
      if (isTemplateDefault) {
        try {
          console.log('Creating copy of default template:', template.name);
          
          // Show loading message
          message.loading({
            content: t('templateListPage.creating_template_copy'),
            key: 'templateCopy',
            duration: 0,
          });
          
          // Get the user ID
          const userId = user?.profile?.user?.id;
          
          if (!userId) {
            console.error('User ID not found');
            message.error({
              content: t('templateListPage.must_be_logged_in_template'),
              key: 'templateCopy',
            });
            return;
          }
          
          console.log('Calling copyDefaultTemplate with UUID:', uuid);
          // Use the dedicated function for copying default templates
          const newTemplate = await copyDefaultTemplate(uuid, `Copy of ${template.name}`);
          
          console.log('Copy successful, new template:', newTemplate);
          console.log('New template UUID:', newTemplate.uuid);
          
          message.success({
            content: t('templateListPage.template_copied'),
            key: 'templateCopy',
            duration: 2,
          });
          
          // Ensure we're using the new template UUID
          if (!newTemplate.uuid) {
            console.error('New template has no UUID:', newTemplate);
            message.error({
              content: 'Error: New template has no UUID',
              key: 'templateCopy',
            });
            return;
          }
          
          const newTemplateUrl = `/design/editor/${newTemplate.uuid}`;
          console.log('Navigating to new template at:', newTemplateUrl);
          
          // Navigate to the new template in the editor
          navigate(newTemplateUrl);
        } catch (error) {
          console.error('Error copying template:', error);
          message.error({
            content: t('templateListPage.error_copy_template'),
            key: 'templateCopy',
          });
        }
      } else {
        // If it's not a default template, navigate directly to it
        console.log('Navigating to user template:', uuid);
        navigate(`/design/editor/${uuid}`);
      }
    } catch (error) {
      console.error('Unexpected error in handleTemplateClick:', error);
      message.error('An unexpected error occurred. Please try again.');
    }
  };

  const handleToggleLike = async (e: React.MouseEvent, template: Template) => {
    e.stopPropagation(); // Prevent card click event
    
    try {
      const newLikeStatus = !template.like;
      
      // Optimistic update using Redux action
      dispatch(templatesActions.toggleLike({ 
        uuid: template.uuid, 
        like: newLikeStatus 
      }));
      
      // Use the mutation to update the backend
      await toggleLikeTemplate({ uuid: template.uuid, like: newLikeStatus }).unwrap();
      
      // Show success message
      message.success(newLikeStatus ? t('templateListPage.added_to_favorites') : t('templateListPage.removed_from_favorites'));
    } catch (error) {
      console.error('Error toggling like status:', error);
      message.error(t('templateListPage.error_toggle_favorite'));
    }
  };

  const renderTemplatePreview = (template: Template) => {
    // Check if the template has a thumbnail
    if (template.thumbnail) {
      return (
        <div className="template-content-preview">
          <img
            src={template.thumbnail}
            alt={template.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              position: 'absolute',
              top: '0',
              left: '0'
            }}
          />
        </div>
      );
    }
    
    // If no thumbnail, render the traditional preview
    // Get the first image (if any)
    const firstImage = template.image_assets && template.image_assets.length > 0 
      ? template.image_assets[0] 
      : (template.imageAssets && template.imageAssets.length > 0 
        ? template.imageAssets[0] 
        : null);
    
    // Determine if we're dealing with portrait or square
    const isPortrait = template.size === '1080x1920';
    const previewWidth = isPortrait ? 240 : 300;
    const previewHeight = 300;
    
    // Calculate scaling factor based on template size
    const originalWidth = isPortrait ? 1080 : 1080;
    const originalHeight = isPortrait ? 1920 : 1080;
    
    // Scale to fit in preview container with 10% padding
    const scaleFactor = Math.min(
      (previewWidth * 0.9) / originalWidth,
      (previewHeight * 0.9) / originalHeight
    );
    
    // Calculate dimensions of the scaled canvas
    const scaledWidth = originalWidth * scaleFactor;
    const scaledHeight = originalHeight * scaleFactor;
    
    return (
      <div className="template-content-preview">
        {/* Create a centered scaled-down canvas */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
            backgroundColor: 'white',
            border: '1px solid #e8e8e8',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            zIndex: 1
          }}
        >
          {/* Render the background image if available */}
          {template.backgroundImage && template.backgroundImage !== 'no_image.jpg' && (
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0
              }}
            >
              <img
                src={template.backgroundImage}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>
          )}

          {/* Render the first image asset (if any) */}
          {firstImage && (
            <div 
              style={{
                position: 'absolute',
                left: `${(firstImage.positionX / originalWidth) * 100}%`,
                top: `${(firstImage.positionY / originalHeight) * 100}%`,
                width: `${(firstImage.width / originalWidth) * 100}%`,
                height: `${(firstImage.height / originalHeight) * 100}%`,
                zIndex: 100 + (firstImage.zIndex || 0)
              }}
            >
              <img
                src={firstImage.image}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                  transform: `rotate(${firstImage.rotation || 0}deg)`
                }}
              />
            </div>
          )}

          {/* Render shapes - scaled and positioned relative to the canvas */}
          {(template.shape_elements || template.shapeElements)?.map(shape => {
            // Get scaled dimensions and position
            const scaledLeft = (shape.positionX / originalWidth) * 100;
            const scaledTop = (shape.positionY / originalHeight) * 100;
            const scaledWidth = (shape.width / originalWidth) * 100;
            const scaledHeight = (shape.height / originalHeight) * 100;
            
            // Handle different shape types
            if (shape.shapeType === 'star') {
              return (
                <div
                  key={shape.uuid}
                  className="preview-shape"
                  style={{
                    position: 'absolute',
                    left: `${scaledLeft}%`,
                    top: `${scaledTop}%`,
                    width: `${scaledWidth}%`,
                    height: `${scaledHeight}%`,
                    zIndex: 100 + (shape.zIndex || 0),
                    transform: `rotate(${shape.rotation}deg)`,
                    display: 'block',
                    opacity: shape.opacity || 1,
                    visibility: 'visible'
                  }}
                >
                  <svg 
                    width="100%" 
                    height="100%" 
                    viewBox="0 0 100 100" 
                    preserveAspectRatio="none"
                  >
                    <polygon 
                      points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" 
                      fill={shape.color || '#FFFF00'} 
                    />
                  </svg>
                </div>
              );
            } else if (shape.shapeType === 'circle') {
              return (
                <div
                  key={shape.uuid}
                  className="preview-shape"
                  style={{
                    position: 'absolute',
                    left: `${scaledLeft}%`,
                    top: `${scaledTop}%`,
                    width: `${scaledWidth}%`,
                    height: `${scaledHeight}%`,
                    backgroundColor: shape.color || '#000000',
                    transform: `rotate(${shape.rotation}deg)`,
                    zIndex: 100 + (shape.zIndex || 0),
                    borderRadius: '50%',
                    display: 'block',
                    opacity: shape.opacity || 1,
                    visibility: 'visible'
                  }}
                />
              );
            } else if (shape.shapeType === 'triangle') {
              return (
                <div
                  key={shape.uuid}
                  className="preview-shape"
                  style={{
                    position: 'absolute',
                    left: `${scaledLeft}%`,
                    top: `${scaledTop}%`,
                    width: `${scaledWidth}%`,
                    height: `${scaledHeight}%`,
                    zIndex: 100 + (shape.zIndex || 0),
                    transform: `rotate(${shape.rotation}deg)`,
                    display: 'block',
                    opacity: shape.opacity || 1,
                    visibility: 'visible'
                  }}
                >
                  <svg 
                    width="100%" 
                    height="100%" 
                    viewBox="0 0 100 100" 
                    preserveAspectRatio="none"
                  >
                    <polygon 
                      points="50,0 0,100 100,100" 
                      fill={shape.color || '#000000'} 
                    />
                  </svg>
                </div>
              );
            } else {
              // Default rectangle or other shapes
              return (
                <div
                  key={shape.uuid}
                  className="preview-shape"
                  style={{
                    position: 'absolute',
                    left: `${scaledLeft}%`,
                    top: `${scaledTop}%`,
                    width: `${scaledWidth}%`,
                    height: `${scaledHeight}%`,
                    backgroundColor: shape.color || '#000000',
                    transform: `rotate(${shape.rotation}deg)`,
                    zIndex: 100 + (shape.zIndex || 0),
                    borderRadius: '0',
                    display: 'block',
                    opacity: shape.opacity || 1,
                    visibility: 'visible'
                  }}
                />
              );
            }
          })}
          
          {/* Render text elements - scaled and positioned relative to the canvas */}
          {(template.text_elements || template.textElements)?.map(text => {
            // Calculate scaled positions and sizes consistently
            const scaledLeft = (text.positionX / originalWidth) * 100;
            const scaledTop = (text.positionY / originalHeight) * 100;
            const fontSize = text.fontSize || text.font_size || 16;
            const scaledFontSize = (fontSize / originalWidth) * 100 * 0.5; // Scale font size relative to width
            
            return (
              <div
                key={text.uuid}
                className="preview-text"
                style={{
                  position: 'absolute',
                  left: `${scaledLeft}%`,
                  top: `${scaledTop}%`,
                  color: text.color || '#000000',
                  fontSize: `${Math.max(8, scaledFontSize)}px`, // Ensure minimum readability
                  fontFamily: text.font || 'Arial',
                  transform: `rotate(${text.rotation || 0}deg)`,
                  zIndex: 200 + (text.zIndex || 0),
                  display: 'block',
                  opacity: text.opacity || 1,
                  visibility: 'visible',
                  textAlign: 'center',
                  whiteSpace: 'nowrap'
                }}
              >
                {text.text}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Add this near the beginning of the component function, after templates is defined
  useEffect(() => {
    // Debug log to inspect templates and their isDefault property
    if (templates && templates.length > 0) {
      console.log('Templates loaded:', templates.length);
      console.log('Template sample:', templates[0]);
      
      // Count default templates
      const defaultTemplates = templates.filter(t => t.isDefault === true);
      console.log(`Default templates: ${defaultTemplates.length}/${templates.length}`);
      
      // Log each template isDefault value
      templates.forEach((t, i) => {
        console.log(`Template ${i}: ${t.name}, isDefault=${t.isDefault}, type=${typeof t.isDefault}`);
      });
    }
  }, [templates]);

  return (
    <div className="template-list-page">
      <div className="template-list-header">
        <Title level={2}>{t('templateListPage.page_title')}</Title>
        <div className="template-actions">
          <Select 
            value={selectedSize} 
            onChange={handleSizeChange}
            style={{ width: 170, marginRight: 16 }}
          >
            <Option value="1080x1080">{t('templateListPage.size_square')}</Option>
            <Option value="1080x1920">{t('templateListPage.size_portrait')}</Option>
          </Select>
          
          <Input
            placeholder={t('templateListPage.search_placeholder')}
            prefix={<SearchOutlined />}
            defaultValue={searchQuery}
            onChange={handleSearchChange}
            style={{ width: 250, marginRight: 16 }}
          />
          
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleCreateTemplate}
          >
            {t('templateListPage.create_new')}
          </Button>
        </div>
      </div>

      <Tabs activeKey={activeTab} onChange={handleTabChange} className="template-tabs">
        <TabPane tab={t('templateListPage.tab_all')} key="all" />
        <TabPane tab={t('templateListPage.tab_my')} key="my" />
        <TabPane tab={t('templateListPage.tab_liked')} key="liked" />
      </Tabs>

      {isLoading || isFetching ? (
        <div className="templates-loading">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {activeTab === 'all' ? (
            // Separate sections for assignable and non-assignable templates in "all" tab
            <>
              {/* Assignable Templates Section */}
              {templates.filter(template => !!template.assignable).length > 0 && (
                <>
                  <div className="templates-section-header">
                    <Title level={4}>Шаблоны</Title>
                  </div>
                  <Row gutter={[24, 24]} className="templates-grid">
                    {templates
                      .filter(template => !!template.assignable)
                      .map(template => (
                        <Col xs={24} sm={12} md={8} lg={6} key={template.uuid}>
                          <Card
                            hoverable
                            className="template-card"
                            onClick={() => handleTemplateClick(template.uuid)}
                            actions={[
                              template.like ? 
                                <HeartFilled 
                                  key="like" 
                                  className="heart-icon filled" 
                                  onClick={(e) => handleToggleLike(e, template)} 
                                /> : 
                                <HeartOutlined 
                                  key="like" 
                                  className="heart-icon" 
                                  onClick={(e) => handleToggleLike(e, template)} 
                                />
                            ]}
                          >
                            <div className="template-preview">
                              <div 
                                className={`preview-container ${template.size === '1080x1920' ? 'portrait' : 'square'}`}
                              >
                                {(template.thumbnail || 
                                  (template.image_assets?.length || template.imageAssets?.length) || 
                                  (template.text_elements?.length || template.textElements?.length) || 
                                  (template.shape_elements?.length || template.shapeElements?.length) || 
                                  (template.backgroundImage && template.backgroundImage !== 'no_image.jpg')) ? (
                                  renderTemplatePreview(template)
                                ) : (
                                  <div className="template-placeholder">
                                    <PictureOutlined style={{ fontSize: '32px', opacity: 0.5, marginBottom: '8px' }} />
                                    <div>{template.name}</div>
                                    <div className="template-size-indicator">{t('templateListPage.template_size_indicator', { size: template.size })}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="template-info">
                              <div className="template-name">{template.name}</div>
                              <div className="template-size">
                                {template.size}
                                {template.isDefault && (
                                  <span className="template-default-badge"></span>
                                )}
                                {template.assignable && (
                                  <Tooltip title={t('templateListPage.assignable_tooltip')}>
                                    <Tag color="green" className="assignable-tag">
                                      <CheckCircleOutlined /> {t('templateListPage.assignable_label')}
                                    </Tag>
                                  </Tooltip>
                                )}
                              </div>
                            </div>
                          </Card>
                        </Col>
                      ))}
                  </Row>
                </>
              )}

              {/* Non-Assignable Templates Section */}
              {templates.filter(template => !template.assignable).length > 0 && (
                <>
                  <div className="templates-section-header">
                    <Title level={4}>Баннер</Title>
                  </div>
                  <Row gutter={[24, 24]} className="templates-grid">
                    {templates
                      .filter(template => !template.assignable)
                      .map(template => (
                        <Col xs={24} sm={12} md={8} lg={6} key={template.uuid}>
                          <Card
                            hoverable
                            className="template-card"
                            onClick={() => handleTemplateClick(template.uuid)}
                            actions={[
                              template.like ? 
                                <HeartFilled 
                                  key="like" 
                                  className="heart-icon filled" 
                                  onClick={(e) => handleToggleLike(e, template)} 
                                /> : 
                                <HeartOutlined 
                                  key="like" 
                                  className="heart-icon" 
                                  onClick={(e) => handleToggleLike(e, template)} 
                                />
                            ]}
                          >
                            <div className="template-preview">
                              <div 
                                className={`preview-container ${template.size === '1080x1920' ? 'portrait' : 'square'}`}
                              >
                                {(template.thumbnail || 
                                  (template.image_assets?.length || template.imageAssets?.length) || 
                                  (template.text_elements?.length || template.textElements?.length) || 
                                  (template.shape_elements?.length || template.shapeElements?.length) || 
                                  (template.backgroundImage && template.backgroundImage !== 'no_image.jpg')) ? (
                                  renderTemplatePreview(template)
                                ) : (
                                  <div className="template-placeholder">
                                    <PictureOutlined style={{ fontSize: '32px', opacity: 0.5, marginBottom: '8px' }} />
                                    <div>{template.name}</div>
                                    <div className="template-size-indicator">{t('templateListPage.template_size_indicator', { size: template.size })}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="template-info">
                              <div className="template-name">{template.name}</div>
                              <div className="template-size">
                                {template.size}
                                {template.isDefault && (
                                  <span className="template-default-badge"></span>
                                )}
                                {template.assignable && (
                                  <Tooltip title={t('templateListPage.assignable_tooltip')}>
                                    <Tag color="green" className="assignable-tag">
                                      <CheckCircleOutlined /> {t('templateListPage.assignable_label')}
                                    </Tag>
                                  </Tooltip>
                                )}
                              </div>
                            </div>
                          </Card>
                        </Col>
                      ))}
                  </Row>
                </>
              )}

              {templates.length === 0 && (
                <Col span={24} className="no-templates">
                  <p>{t('templateListPage.no_templates')}</p>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTemplate}>
                    {t('templateListPage.create_new_template')}
                  </Button>
                </Col>
              )}
            </>
          ) : (
            // Original template list for 'my' and 'liked' tabs
            <Row gutter={[24, 24]} className="templates-grid">
              {templates.length > 0 ? (
                templates.map(template => (
                  <Col xs={24} sm={12} md={8} lg={6} key={template.uuid}>
                    <Card
                      hoverable
                      className="template-card"
                      onClick={() => handleTemplateClick(template.uuid)}
                      actions={[
                        template.like ? 
                          <HeartFilled 
                            key="like" 
                            className="heart-icon filled" 
                            onClick={(e) => handleToggleLike(e, template)} 
                          /> : 
                          <HeartOutlined 
                            key="like" 
                            className="heart-icon" 
                            onClick={(e) => handleToggleLike(e, template)} 
                          />
                      ]}
                    >
                      <div className="template-preview">
                        <div 
                          className={`preview-container ${template.size === '1080x1920' ? 'portrait' : 'square'}`}
                        >
                          {(template.thumbnail || 
                            (template.image_assets?.length || template.imageAssets?.length) || 
                            (template.text_elements?.length || template.textElements?.length) || 
                            (template.shape_elements?.length || template.shapeElements?.length) || 
                            (template.backgroundImage && template.backgroundImage !== 'no_image.jpg')) ? (
                            renderTemplatePreview(template)
                          ) : (
                            <div className="template-placeholder">
                              <PictureOutlined style={{ fontSize: '32px', opacity: 0.5, marginBottom: '8px' }} />
                              <div>{template.name}</div>
                              <div className="template-size-indicator">{t('templateListPage.template_size_indicator', { size: template.size })}</div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="template-info">
                        <div className="template-name">{template.name}</div>
                        <div className="template-size">
                          {template.size}
                          {template.isDefault && (
                            <span className="template-default-badge"></span>
                          )}
                          {template.assignable && (
                            <Tooltip title={t('templateListPage.assignable_tooltip')}>
                              <Tag color="green" className="assignable-tag">
                                <CheckCircleOutlined /> {t('templateListPage.assignable_label')}
                              </Tag>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col span={24} className="no-templates">
                  <p>{t('templateListPage.no_templates')}</p>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTemplate}>
                    {t('templateListPage.create_new_template')}
                  </Button>
                </Col>
              )}
            </Row>
          )}

          {/* Add pagination */}
          {totalTemplates > PAGE_SIZE && (
            <div className="templates-pagination" style={{ textAlign: 'center', marginTop: '24px' }}>
              <Pagination
                current={currentPage}
                total={totalTemplates}
                pageSize={PAGE_SIZE}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TemplateListPage; 