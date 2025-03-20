import React, { useState, useEffect } from 'react';
import { Tabs, List, Button, Card, Upload, message, Spin, Empty } from 'antd';
import { PictureOutlined, FontSizeOutlined, BorderOutlined, UploadOutlined, UnorderedListOutlined, FileImageOutlined } from '@ant-design/icons';
import { ElementType, Template, DesignElement, UserAsset } from '../../../../types';
import { getUserAssets, createUserAsset } from '../../../../services/designService';
import './ElementsPanel.scss';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';

const { TabPane } = Tabs;
const { Dragger } = Upload;

interface ElementsPanelProps {
  onAddElement: (elementType: ElementType, data?: any) => void;
  template?: Template; // Add template prop to access all elements
  selectedElement?: DesignElement | null; // Add selected element prop
  onSelectElement?: (element: DesignElement | null) => void; // Add select element handler
}

const ElementsPanel: React.FC<ElementsPanelProps> = ({ 
  onAddElement,
  template,
  selectedElement,
  onSelectElement
}) => {
  const [userAssets, setUserAssets] = useState<UserAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  
  // Get user from Redux store
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.profile?.user?.id;

  // Add user ID to window for easier access by services
  useEffect(() => {
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
  useEffect(() => {
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

  return (
    <div className="elements-panel">
      <Tabs defaultActiveKey="images" tabPosition="top" className="elements-tabs">
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
          </div>
        </TabPane>
        
        <TabPane 
          tab={<><FileImageOutlined /> My Assets</>} 
          key="assets"
        >
          <div className="tab-content">
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
          <List
            className="elements-list"
            size="small"
            dataSource={getAllElements()}
            renderItem={element => (
              <List.Item 
                key={element.uuid}
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
              </List.Item>
            )}
            locale={{ emptyText: 'No elements added yet' }}
          />
        )}
      </div>
    </div>
  );
};

export default ElementsPanel; 