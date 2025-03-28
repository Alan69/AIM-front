import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Col, Row, Input, Tabs, Select, Typography, Spin, message } from 'antd';
import { PlusOutlined, SearchOutlined, PictureOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import { fetchAllTemplates, createTemplate, processImageData, updateTemplate, copyTemplate } from '../../services/designService';
import { Template, TemplateSizeType } from '../../types';
import './TemplateListPage.scss';
import { useTypedSelector } from 'hooks/useTypedSelector';

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const TemplateListPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<TemplateSizeType>('1080x1080');
  const navigate = useNavigate();
  const { user } = useTypedSelector((state) => state.auth);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await fetchAllTemplates(selectedSize);
      
      // Process image data for all templates
      const processedTemplates = data.map((template: Template) => {
        // Process background image if it exists
        if (template.backgroundImage && template.backgroundImage !== 'no_image.jpg') {
          template.backgroundImage = processImageData(template.backgroundImage);
        }
        
        // Process image assets
        if (template.imageAssets && template.imageAssets.length > 0) {
          template.imageAssets = template.imageAssets.map((img: any) => ({
            ...img,
            image: processImageData(img.image)
          }));
        }
        return template;
      });
      
      setTemplates(processedTemplates);
      setFilteredTemplates(processedTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      message.error('Failed to load templates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [selectedSize]);

  const filterTemplates = () => {
    let filtered = [...templates];
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by tab
    if (activeTab === 'all') {
      // Show only default templates and user-created templates
      filtered = filtered.filter(template => 
        template.isDefault
      );
    } else if (activeTab === 'my') {
      // Show only user-created templates (not default templates)
      filtered = filtered.filter(template => 
        !template.isDefault && template.user?.id === user?.profile?.user?.id
      );
    } else if (activeTab === 'liked') {
      // Show only liked templates that are either default or created by the user
      filtered = filtered.filter(template => 
        template.like && (template.isDefault || template.user?.id === user?.profile?.user?.id)
      );
    }
    
    setFilteredTemplates(filtered);
  };

  useEffect(() => {
    if (templates.length > 0) {
      filterTemplates();
    }
  }, [templates, searchQuery, activeTab]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleSizeChange = (value: TemplateSizeType) => {
    setSelectedSize(value);
  };

  const handleCreateTemplate = async () => {
    try {
      // Get the user ID from the user context
      const userId = user?.profile?.user?.id;
      
      if (!userId) {
        message.error('You must be logged in to create a template.');
        return;
      }
      
      console.log(`Creating template with user ID: ${userId}`);
      const newTemplate = await createTemplate(
        `New Template ${new Date().toLocaleTimeString()}`, 
        selectedSize,
        undefined, // No background image
        userId     // Pass the user ID
      );
      
      navigate(`/design/editor/${newTemplate.uuid}`);
    } catch (error) {
      console.error('Error creating template:', error);
      message.error('Failed to create template. Please try again.');
    }
  };

  const handleTemplateClick = async (uuid: string) => {
    // Find the template that was clicked
    const template = templates.find(t => t.uuid === uuid);
    
    if (!template) {
      console.error('Template not found:', uuid);
      return;
    }
    
    // If it's a default template, make a copy for the user
    if (template.isDefault) {
      try {
        setLoading(true);
        
        // Get the user ID
        const userId = user?.profile?.user?.id;
        
        if (!userId) {
          message.error('You must be logged in to use this template.');
          return;
        }
        
        // Ensure we have a valid size
        const templateSize = template.size === '1080x1920' ? '1080x1920' : '1080x1080';
        console.log(`Creating copy of template: ${template.name} with size: ${templateSize}`);
        
        message.loading({
          content: 'Creating a copy of this template...',
          key: 'templateCopy',
          duration: 0,
        });
        
        // Create a new template name
        const newTemplateName = `Copy of ${template.name}`;
        
        // Use the copyTemplate function to create a full copy with all elements
        const newTemplate = await copyTemplate(uuid, newTemplateName, userId);
        
        // Verify the size was preserved correctly
        if (newTemplate.size !== templateSize) {
          console.log(`Size mismatch detected. Original: ${templateSize}, New: ${newTemplate.size}`);
          
          // Fix the size if needed
          await updateTemplate(newTemplate.uuid, { 
            size: templateSize
          });
          
          console.log(`Template size updated to: ${templateSize}`);
        }
        
        // Navigate to the new template in the editor
        message.success({
          content: 'Template copied successfully!',
          key: 'templateCopy',
          duration: 2,
        });
        
        // Refresh the template list to show the new template
        loadTemplates();
        
        // Navigate to the new template
        navigate(`/design/editor/${newTemplate.uuid}`);
      } catch (error) {
        console.error('Error copying template:', error);
        message.error({
          content: 'Failed to copy template. Please try again.',
          key: 'templateCopy',
        });
        setLoading(false);
      }
    } else {
      // If it's not a default template, just navigate to it
      navigate(`/design/editor/${uuid}`);
    }
  };

  const handleToggleLike = async (e: React.MouseEvent, template: Template) => {
    e.stopPropagation(); // Prevent card click event
    
    try {
      const newLikeStatus = !template.like;
      
      // Optimistically update UI
      const updatedTemplates = templates.map(t => 
        t.uuid === template.uuid ? { ...t, like: newLikeStatus } : t
      );
      setTemplates(updatedTemplates);
      
      // Update filtered templates as well
      const updatedFilteredTemplates = filteredTemplates.map(t => 
        t.uuid === template.uuid ? { ...t, like: newLikeStatus } : t
      );
      setFilteredTemplates(updatedFilteredTemplates);
      
      // Update template in the backend
      await updateTemplate(template.uuid, { like: newLikeStatus });
      
      // Show success message
      message.success(newLikeStatus ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Error toggling like status:', error);
      
      // Revert UI state if the API call fails
      const revertedTemplates = templates.map(t => 
        t.uuid === template.uuid ? { ...t, like: template.like } : t
      );
      setTemplates(revertedTemplates);
      
      // Update filtered templates as well
      const revertedFilteredTemplates = filteredTemplates.map(t => 
        t.uuid === template.uuid ? { ...t, like: template.like } : t
      );
      setFilteredTemplates(revertedFilteredTemplates);
      
      message.error('Failed to update favorite status');
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
    const firstImage = template.imageAssets && template.imageAssets.length > 0 ? template.imageAssets[0] : null;
    
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
          {template.shapeElements?.map(shape => {
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
                    opacity: 1,
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
                    opacity: 1,
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
                    opacity: 1,
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
                    opacity: 1,
                    visibility: 'visible'
                  }}
                />
              );
            }
          })}
          
          {/* Render text elements - scaled and positioned relative to the canvas */}
          {template.textElements?.map(text => {
            // Calculate scaled positions and sizes consistently
            const scaledLeft = (text.positionX / originalWidth) * 100;
            const scaledTop = (text.positionY / originalHeight) * 100;
            const scaledFontSize = (text.fontSize / originalWidth) * 100 * 0.5; // Scale font size relative to width
            
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
                  opacity: 1,
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

  return (
    <div className="template-list-page">
      <div className="template-list-header">
        <Title level={2}>Design Templates</Title>
        <div className="template-actions">
          <Select 
            value={selectedSize} 
            onChange={handleSizeChange}
            style={{ width: 170, marginRight: 16 }}
          >
            <Option value="1080x1080">Square 1080×1080</Option>
            <Option value="1080x1920">Portrait 1080×1920</Option>
          </Select>
          
          <Input
            placeholder="Search templates"
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={handleSearchChange}
            style={{ width: 250, marginRight: 16 }}
          />
          
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleCreateTemplate}
          >
            Create New
          </Button>
        </div>
      </div>

      <Tabs activeKey={activeTab} onChange={handleTabChange} className="template-tabs">
        <TabPane tab="All Templates" key="all" />
        <TabPane tab="My Templates" key="my" />
        <TabPane tab="Liked Templates" key="liked" />
      </Tabs>

      {loading ? (
        <div className="templates-loading">
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[24, 24]} className="templates-grid">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map(template => (
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
                      {(template.thumbnail || template.imageAssets?.length || template.textElements?.length || template.shapeElements?.length || 
                        (template.backgroundImage && template.backgroundImage !== 'no_image.jpg')) ? (
                        renderTemplatePreview(template)
                      ) : (
                        <div className="template-placeholder">
                          <PictureOutlined style={{ fontSize: '32px', opacity: 0.5, marginBottom: '8px' }} />
                          <div>{template.name}</div>
                          <div className="template-size-indicator">{template.size}</div>
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
                    </div>
                  </div>
                </Card>
              </Col>
            ))
          ) : (
            <Col span={24} className="no-templates">
              <p>No templates found. Try adjusting your search or create a new template.</p>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTemplate}>
                Create New Template
              </Button>
            </Col>
          )}
        </Row>
      )}
    </div>
  );
};

export default TemplateListPage; 