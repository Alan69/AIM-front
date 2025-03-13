import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Col, Row, Input, Tabs, Select, Typography, Spin, message } from 'antd';
import { PlusOutlined, SearchOutlined, PictureOutlined } from '@ant-design/icons';
import { fetchAllTemplates, createTemplate, fetchTemplatesREST, processImageData } from '../../services/designService';
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

  useEffect(() => {
    loadTemplates();
  }, [selectedSize]);

  useEffect(() => {
    if (templates.length > 0) {
      filterTemplates();
    }
  }, [templates, searchQuery, activeTab]);

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

  const filterTemplates = () => {
    let filtered = [...templates];
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by tab
    if (activeTab === 'my') {
      filtered = filtered.filter(template => !template.isDefault);
    }
    
    setFilteredTemplates(filtered);
  };

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

  const handleTemplateClick = (uuid: string) => {
    navigate(`/design/editor/${uuid}`);
  };

  const renderTemplatePreview = (template: Template) => {
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
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 1
              }}
            >
              <img
                src={firstImage.image}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block'
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
            // For the "Heading" text, position it in the middle of the pink rectangle
            if (text.text === 'Heading') {
              return (
                <div
                  key={text.uuid}
                  className="preview-text"
                  style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: '12.5%', // Middle of the pink rectangle
                    transform: 'translateX(-50%)',
                    color: '#000000',
                    fontSize: `${Math.max(12, 22 * scaleFactor)}px`, // Scale font size but ensure minimum readability
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: 'bold',
                    zIndex: 200,
                    textAlign: 'center',
                    display: 'block',
                    opacity: 1,
                    visibility: 'visible'
                  }}
                >
                  {text.text}
                </div>
              );
            }
            
            // For other text elements, use the default positioning
            const scaledLeft = (text.positionX / originalWidth) * 100;
            const scaledTop = (text.positionY / originalHeight) * 100;
            const scaledFontSize = Math.max(10, text.fontSize * scaleFactor); // Ensure minimum readable size
            
            return (
              <div
                key={text.uuid}
                className="preview-text"
                style={{
                  position: 'absolute',
                  left: `${scaledLeft}%`,
                  top: `${scaledTop}%`,
                  color: text.color || '#000000',
                  fontSize: `${scaledFontSize}px`,
                  fontFamily: text.font || 'Arial',
                  transform: `translate(-50%, -50%) rotate(${text.rotation}deg)`,
                  zIndex: 200 + (text.zIndex || 0),
                  display: 'block',
                  opacity: 1,
                  visibility: 'visible',
                  textAlign: 'center'
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
                >
                  <div className="template-preview">
                    <div 
                      className={`preview-container ${template.size === '1080x1920' ? 'portrait' : 'square'}`}
                    >
                      {(template.imageAssets?.length || template.textElements?.length || template.shapeElements?.length || 
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
                    <div className="template-size">{template.size}</div>
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