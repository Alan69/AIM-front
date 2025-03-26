import * as React from 'react';
import { Fragment } from 'react';
import { Tabs, List, Button, Card, Upload, message, Spin, Empty, Input, Radio, Space } from 'antd';
import { PictureOutlined, FontSizeOutlined, BorderOutlined, UploadOutlined, UnorderedListOutlined, FileImageOutlined, ArrowUpOutlined, ArrowDownOutlined, LayoutOutlined, SearchOutlined } from '@ant-design/icons';
import { ElementType, Template, DesignElement, UserAsset } from '../../../../types';
import { getUserAssets, createUserAsset, updateElementInTemplate, getTemplates } from '../../../../services/designService';
import './ElementsPanel.scss';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import type { FC } from 'react';

const { TabPane } = Tabs;
const { Dragger } = Upload;

interface ElementsPanelProps {
  onAddElement: (elementType: ElementType, data?: any) => void;
  template?: Template;
  selectedElement?: DesignElement | null;
  onSelectElement?: (element: DesignElement | null) => void;
  onElementsOrderChange?: () => void;
}

const ElementItem = React.memo(({
  element,
  index,
  totalElements,
  isElementSelected,
  handleSelectElement,
  getElementIcon,
  getElementName,
  onMoveElement
}: {
  element: DesignElement & { elementType: string };
  index: number;
  totalElements: number;
  isElementSelected: (element: DesignElement) => boolean;
  handleSelectElement: (element: DesignElement) => void;
  getElementIcon: (element: DesignElement & { elementType: string }) => React.ReactNode;
  getElementName: (element: DesignElement & { elementType: string }) => string;
  onMoveElement: (oldIndex: number, newIndex: number) => void;
}) => (
  <div
    className={`element-list-item ${isElementSelected(element) ? 'selected' : ''}`}
    onClick={() => handleSelectElement(element)}
  >
    <div className="element-list-icon">
      {getElementIcon(element)}
    </div>
    <div className="element-list-name">
      {getElementName(element)}
    </div>
    <div className="element-list-z-index">
      {element.zIndex !== undefined ? `z: ${element.zIndex}` : ''}
    </div>
    <div className="element-list-actions">
      {index > 0 && (
        <Button
          type="text"
          icon={<ArrowUpOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onMoveElement(index, index - 1);
          }}
        />
      )}
      {index < totalElements - 1 && (
        <Button
          type="text"
          icon={<ArrowDownOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onMoveElement(index, index + 1);
          }}
        />
      )}
    </div>
  </div>
));

ElementItem.displayName = 'ElementItem';

const ElementsList = React.memo(({
  elements,
  onMoveElement,
  isElementSelected,
  handleSelectElement,
  getElementIcon,
  getElementName
}: {
  elements: Array<DesignElement & { elementType: string }>;
  onMoveElement: (oldIndex: number, newIndex: number) => void;
  isElementSelected: (element: DesignElement) => boolean;
  handleSelectElement: (element: DesignElement) => void;
  getElementIcon: (element: DesignElement & { elementType: string }) => React.ReactNode;
  getElementName: (element: DesignElement & { elementType: string }) => string;
}) => {
  return (
    <div className="elements-list">
      {elements.map((element, index) => (
        <ElementItem
          key={element.uuid}
          element={element}
          index={index}
          totalElements={elements.length}
          isElementSelected={isElementSelected}
          handleSelectElement={handleSelectElement}
          getElementIcon={getElementIcon}
          getElementName={getElementName}
          onMoveElement={onMoveElement}
        />
      ))}
    </div>
  );
});

ElementsList.displayName = 'ElementsList';

const ElementsPanel: React.FC<ElementsPanelProps> = ({ 
  onAddElement,
  template,
  selectedElement,
  onSelectElement,
  onElementsOrderChange
}) => {
  const [userAssets, setUserAssets] = React.useState<UserAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = React.useState(false);
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = React.useState(false);
  const [templateFilter, setTemplateFilter] = React.useState('my');
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Get user from Redux store
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.profile?.user?.id;

  // Add user ID to window for easier access by services
  React.useEffect(() => {
    if (userId && typeof window !== 'undefined') {
      // Store userId in window for services to access
      (window as any).__USER_ID__ = userId;
      
      // Also ensure it's in localStorage as a fallback
      try {
        if (!localStorage.getItem('userData') && user) {
          localStorage.setItem('userData', JSON.stringify(user.profile.user));
        }
      } catch (e) {
        console.warn('Failed to store user data in localStorage:', e);
      }
    }
  }, [userId, user]);

  // Load user assets on component mount
  React.useEffect(() => {
    loadUserAssets();
  }, [userId]); // Reload when userId changes

  // Function to load user assets
  const loadUserAssets = async () => {
    try {
      setLoadingAssets(true);
      const assets = await getUserAssets();
      setUserAssets(assets || []);
    } catch (error) {
      console.error('Error loading user assets:', error);
      
      // Show a more user-friendly error message based on the error type
      if (error instanceof Error && error.message === 'User not authenticated') {
        message.error('Please log in to view your saved images');
      } else {
        message.error('Failed to load your saved images');
      }
    } finally {
      setLoadingAssets(false);
    }
  };

  // Load templates
  React.useEffect(() => {
    loadTemplates();
  }, [userId, templateFilter]);

  // Function to load templates
  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      setTemplates([]); // Clear existing templates while loading
      const fetchedTemplates = await getTemplates(templateFilter);
      setTemplates(fetchedTemplates || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      message.error('Failed to load templates');
      setTemplates([]); // Ensure templates is empty if there was an error
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Filter templates based on search query
  const filteredTemplates = React.useMemo(() => {
    if (!searchQuery.trim()) return templates;
    
    return templates.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [templates, searchQuery]);

  // Handle template selection
  const handleTemplateSelect = async (selectedTemplate: Template) => {
    if (!template || !selectedTemplate) return;
    
    // Display confirmation before applying template elements
    if (window.confirm(`Do you want to add elements from template "${selectedTemplate.name}" to your current canvas?`)) {
      try {
        message.loading(`Adding elements from "${selectedTemplate.name}"...`, 1.5);

        // Add text elements
        if (selectedTemplate.texts) {
          for (const text of selectedTemplate.texts) {
            onAddElement(ElementType.TEXT, {
              ...text,
              uuid: undefined // Let the server generate a new UUID
            });
          }
        }

        // Add image elements
        if (selectedTemplate.images) {
          for (const image of selectedTemplate.images) {
            onAddElement(ElementType.IMAGE, {
              ...image,
              uuid: undefined // Let the server generate a new UUID
            });
          }
        }

        // Add shape elements
        if (selectedTemplate.shapes) {
          for (const shape of selectedTemplate.shapes) {
            onAddElement(ElementType.SHAPE, {
              ...shape,
              uuid: undefined // Let the server generate a new UUID
            });
          }
        }

        message.success(`Elements from "${selectedTemplate.name}" added to canvas`);
      } catch (error) {
        console.error('Error adding template elements:', error);
        message.error('Failed to add template elements');
      }
    }
  };

  // Sample text elements
  const textElements = [
    { name: 'Heading', style: { fontSize: 32, fontWeight: 'bold' } },
    { name: 'Subheading', style: { fontSize: 24, fontWeight: 'bold' } },
    { name: 'Body Text', style: { fontSize: 16 } },
    { name: 'Caption', style: { fontSize: 12, color: '#888' } },
    { name: 'Quote', style: { fontSize: 18, fontStyle: 'italic' } },
  ];

  // Sample shape elements
  const shapeElements = [
    { name: 'Rectangle', type: 'rectangle', color: '#4A90E2' },
    { name: 'Circle', type: 'circle', color: '#7ED321' },
    { name: 'Triangle', type: 'triangle', color: '#F5A623' },
    { name: 'Line', type: 'line', color: '#9013FE' },
    { name: 'Star', type: 'star', color: '#F8E71C' },
  ];

  const uploadProps = {
    name: 'file',
    multiple: false,
    action: '/api/upload', // Replace with your upload endpoint
    showUploadList: false,
    accept: 'image/*',
    beforeUpload: (file: File) => {
      // Make sure it's a valid image file
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return false;
      }

      // For now, we'll use the FileReader to convert the image to a data URL
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        if (imageUrl) {
          try {
            // Save the image as a user asset
            await createUserAsset(
              imageUrl, 
              file.name
            );
            
            // Refresh the user assets list
            loadUserAssets();
            
          // Only add the element when we have a valid image URL
            onAddElement(ElementType.IMAGE, { image: imageUrl });
            message.success(`${file.name} added to canvas and saved to your assets`);
          } catch (error) {
            console.error('Error saving image asset:', error);
            // Still add the image to the canvas even if saving as asset failed
          onAddElement(ElementType.IMAGE, { image: imageUrl });
          message.success(`${file.name} added to canvas`);
            message.error('Failed to save image to your assets');
          }
        } else {
          message.error(`Failed to load image: ${file.name}`);
        }
      };
      
      reader.onerror = () => {
        message.error(`Failed to read file: ${file.name}`);
      };
      
      // Start reading the file
      reader.readAsDataURL(file);
      
      // Return false to prevent actual upload (handled manually)
      return false;
    },
    onChange(info: any) {
      // We're handling the file in beforeUpload, so this is just for feedback
      if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  const handleAddTextElement = (textStyle: any, textName: string) => {
    onAddElement(ElementType.TEXT, {
      ...textStyle,
      text: textName  // Include the text content
    });
  };

  const handleAddShapeElement = (shapeType: string, color: string) => {
    // Validate shape type
    if (!shapeType) {
      shapeType = 'rectangle'; // Default to rectangle if no type provided
    }
    
    // Pass the shape type and color to the parent component
    onAddElement(ElementType.SHAPE, { shapeType, color });
  };

  // Function to handle selecting an element from the list
  const handleSelectElement = (element: DesignElement) => {
    if (onSelectElement) {
      onSelectElement(element);
    }
  };

  // Handle adding an image from user assets
  const handleAddUserAsset = (asset: UserAsset) => {
    onAddElement(ElementType.IMAGE, { image: asset.image });
    message.success(`Image added to canvas`);
  };

  // Get all elements for the Elements List
  const getAllElements = () => {
    if (!template) return [];
    
    const allElements: Array<DesignElement & { elementType: string }> = [];
    
    // Add text elements
    if (template.texts) {
      template.texts.forEach(text => {
        allElements.push({ ...text, elementType: 'text' });
      });
    }
    
    // Add image elements
    if (template.images) {
      template.images.forEach(image => {
        allElements.push({ ...image, elementType: 'image' });
      });
    }
    
    // Add shape elements
    if (template.shapes) {
      template.shapes.forEach(shape => {
        allElements.push({ ...shape, elementType: 'shape' });
      });
    }
    
    // Sort elements by z-index, highest first (for selection priority)
    return allElements.sort((a, b) => {
      const zIndexA = a.zIndex !== undefined ? Number(a.zIndex) : 0;
      const zIndexB = b.zIndex !== undefined ? Number(b.zIndex) : 0;
      return zIndexB - zIndexA;
    });
  };

  // Get element display name
  const getElementName = (element: DesignElement & { elementType: string }) => {
    if (element.elementType === 'text') {
      return `Text: ${(element as any).text || 'Text'}`;
    } else if (element.elementType === 'image') {
      return `Image ${element.uuid.slice(0, 6)}`;
    } else if (element.elementType === 'shape') {
      return `Shape: ${(element as any).shapeType || 'Shape'}`;
    }
    return `Element ${element.uuid.slice(0, 6)}`;
  };

  // Get element icon/preview
  const getElementIcon = (element: DesignElement & { elementType: string }) => {
    if (element.elementType === 'text') {
      return <FontSizeOutlined />;
    } else if (element.elementType === 'image') {
      return <PictureOutlined />;
    } else if (element.elementType === 'shape') {
      return <BorderOutlined />;
    }
    return null;
  };

  // Check if element is currently selected
  const isElementSelected = (element: DesignElement) => {
    return selectedElement?.uuid === element.uuid;
  };

  // Update handleMoveElement to work with react-beautiful-dnd
  const handleMoveElement = async (oldIndex: number, newIndex: number) => {
    if (!template) return;

    const elements = getAllElements();
    const newElements = [...elements];
    const [movedItem] = newElements.splice(oldIndex, 1);
    newElements.splice(newIndex, 0, movedItem);

    // Update z-index for all elements
    const updates = newElements.map((item, index) => {
      const newZIndex = newElements.length - index; // Higher z-index for items at the top
      return updateElementInTemplate(
        template.uuid,
        item.uuid,
        item.elementType as 'image' | 'text' | 'shape',
        { zIndex: newZIndex }
      );
    });

    try {
      await Promise.all(updates);
      message.success('Element order updated');
      // Notify parent component about the order change
      onElementsOrderChange?.();
    } catch (error) {
      console.error('Error updating element order:', error);
      message.error('Failed to update element order');
    }
  };

  return (
    <div className="elements-panel">
      <Tabs defaultActiveKey="images" tabPosition="top" className="elements-tabs">
        <TabPane 
          tab={<><LayoutOutlined /> Templates</>} 
          key="templates"
        >
          <div className="tab-content">
            <div className="template-search">
              <Input 
                placeholder="Search Mobile Video templates" 
                suffix={<SearchOutlined />}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="template-search-input"
              />
            </div>
            
            <div className="template-filter">
              <Radio.Group 
                value={templateFilter} 
                onChange={e => setTemplateFilter(e.target.value)}
                buttonStyle="solid"
                size="small"
              >
                <Radio.Button value="default">Default</Radio.Button>
                <Radio.Button value="my">My Templates</Radio.Button>
                <Radio.Button value="liked">Liked</Radio.Button>
              </Radio.Group>
            </div>
            
            <div className="templates-container">
              {loadingTemplates ? (
                <div className="templates-loading">
                  <Spin tip="Loading templates..." />
                </div>
              ) : filteredTemplates.length > 0 ? (
                <List
                  grid={{ gutter: 16, column: 2 }}
                  dataSource={filteredTemplates}
                  renderItem={item => (
                    <List.Item>
                      <Card 
                        hoverable 
                        className="template-card"
                        onClick={() => handleTemplateSelect(item)}
                        cover={
                          <div className="template-preview">
                            <div className="template-preview-container">
                              <img 
                                alt={item.name} 
                                src={item.backgroundImage === 'no_image.jpg' ? '/default-template-icon.png' : item.backgroundImage} 
                                className="template-background"
                              />
                              {/* Overlay template elements as thumbnails */}
                              {item.texts && item.texts.map((text, index) => (
                                <div 
                                  key={`text-${index}`}
                                  className="template-element text-element"
                                  style={{
                                    left: `${text.positionX / 10.8}%`,
                                    top: `${text.positionY / (item.size === '1080x1920' ? 19.2 : 10.8)}%`,
                                    color: text.color,
                                    fontSize: `${text.fontSize / 10}px`,
                                    zIndex: text.zIndex
                                  }}
                                >
                                  {text.text.substring(0, 5)}
                                </div>
                              ))}
                              {item.images && item.images.map((image, index) => (
                                <div 
                                  key={`image-${index}`}
                                  className="template-element image-element"
                                  style={{
                                    left: `${image.positionX / 10.8}%`,
                                    top: `${image.positionY / (item.size === '1080x1920' ? 19.2 : 10.8)}%`,
                                    width: `${image.width / 10.8}%`,
                                    height: `${image.height / (item.size === '1080x1920' ? 19.2 : 10.8)}%`,
                                    zIndex: image.zIndex
                                  }}
                                >
                                  <img 
                                    src={image.image} 
                                    alt=""
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                      borderRadius: `${image.borderRadius || 0}px`
                                    }}
                                  />
                                </div>
                              ))}
                              {item.shapes && item.shapes.map((shape, index) => (
                                <div 
                                  key={`shape-${index}`}
                                  className={`template-element shape-element shape-${shape.shapeType}`}
                                  style={{
                                    left: `${shape.positionX / 10.8}%`,
                                    top: `${shape.positionY / (item.size === '1080x1920' ? 19.2 : 10.8)}%`,
                                    width: `${shape.width / 10.8}%`,
                                    height: `${shape.height / (item.size === '1080x1920' ? 19.2 : 10.8)}%`,
                                    backgroundColor: shape.color,
                                    zIndex: shape.zIndex
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        }
                      >
                        <div className="template-name" title={item.name}>
                          {item.name}
                        </div>
                      </Card>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty 
                  description={
                    searchQuery 
                      ? "No templates match your search" 
                      : templateFilter === "my" 
                        ? "You haven't created any templates yet" 
                        : templateFilter === "liked" 
                          ? "You haven't liked any templates yet"
                          : "No templates available"
                  } 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
          </div>
        </TabPane>
        
        <TabPane 
          tab={<><PictureOutlined /> Images</>} 
          key="images"
        >
          <div className="tab-content">
            <Dragger {...uploadProps} className="image-uploader">
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">Click or drag an image to upload</p>
              <p className="ant-upload-hint">
                Supports JPG, PNG, SVG, and GIF
              </p>
            </Dragger>

            <div className="my-assets-section">
              <div className="section-title">My Assets</div>
              {loadingAssets ? (
                <div className="assets-loading">
                  <Spin tip="Loading your images..." />
                </div>
              ) : userAssets.length > 0 ? (
                <List
                  grid={{ gutter: 16, column: 2 }}
                  dataSource={userAssets}
                  renderItem={asset => (
                    <List.Item>
                      <Card 
                        hoverable 
                        className="asset-card"
                        onClick={() => handleAddUserAsset(asset)}
                        cover={
                          <div className="asset-image-container">
                            <img 
                              alt={asset.name} 
                              src={asset.thumbnail || asset.image} 
                              className="asset-image"
                            />
                          </div>
                        }
                      >
                        <div className="asset-name" title={asset.name}>
                          {asset.name}
                        </div>
                      </Card>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty 
                  description="No saved images yet" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
              <div className="refresh-assets">
                <Button 
                  type="link" 
                  onClick={loadUserAssets}
                  disabled={loadingAssets}
                >
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </TabPane>
        
        <TabPane 
          tab={<><FontSizeOutlined /> Text</>} 
          key="text"
        >
          <div className="tab-content">
            <List
              grid={{ gutter: 8, column: 1 }}
              dataSource={textElements}
              renderItem={item => (
                <List.Item>
                  <Card 
                    hoverable 
                    className="element-card"
                    onClick={() => handleAddTextElement(item.style, item.name)}
                  >
                    <div style={item.style}>{item.name}</div>
                  </Card>
                </List.Item>
              )}
            />
          </div>
        </TabPane>
        
        <TabPane 
          tab={<><BorderOutlined /> Shapes</>} 
          key="shapes"
        >
          <div className="tab-content">
            <List
              grid={{ gutter: 8, column: 2 }}
              dataSource={shapeElements}
              renderItem={item => (
                <List.Item>
                  <Card 
                    hoverable 
                    className="element-card shape-card"
                    onClick={() => handleAddShapeElement(item.type, item.color)}
                  >
                    <div className={`shape-preview shape-${item.type}`}></div>
                    <div className="shape-name">{item.name}</div>
                  </Card>
                </List.Item>
              )}
            />
          </div>
        </TabPane>
      </Tabs>
      
      {/* Elements List Panel */}
      <div className="elements-list-panel">
        <div className="elements-list-header">
          <UnorderedListOutlined /> Elements
        </div>
        {template && (
          <ElementsList
            elements={getAllElements()}
            onMoveElement={handleMoveElement}
            isElementSelected={isElementSelected}
            handleSelectElement={handleSelectElement}
            getElementIcon={getElementIcon}
            getElementName={getElementName}
          />
        )}
      </div>
    </div>
  );
};

export default ElementsPanel; 