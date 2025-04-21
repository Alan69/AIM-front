import * as React from 'react';
import { Tabs, List, Button, Card, Upload, message, Spin, Empty, Input, Radio } from 'antd';
import { PictureOutlined, FontSizeOutlined, BorderOutlined, UploadOutlined, UnorderedListOutlined, ArrowUpOutlined, ArrowDownOutlined, LayoutOutlined, SearchOutlined } from '@ant-design/icons';
import { ElementType, Template, DesignElement, UserAsset } from '../../../../types';
import { getUserAssets, createUserAsset, updateElementInTemplate, getTemplates } from '../../../../services/designService';
import './ElementsPanel.scss';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const { TabPane } = Tabs;
const { Dragger } = Upload;

interface ElementsPanelProps {
  onAddElement: (elementType: ElementType, data?: any) => void;
  onAddBatchElements?: (elements: Array<{type: string, data: any}>) => void;
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
  onAddBatchElements,
  template,
  selectedElement,
  onSelectElement,
  onElementsOrderChange
}) => {
  const { t } = useTranslation();
  const [userAssets, setUserAssets] = React.useState<UserAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = React.useState(false);
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = React.useState(false);
  const [templateFilter, setTemplateFilter] = React.useState('default');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState('');
  
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
        message.error(t('templateEditorPage.please_login_to_view_images'));
      } else {
        message.error(t('templateEditorPage.failed_to_load_images'));
      }
    } finally {
      setLoadingAssets(false);
    }
  };

  // Use useEffect to debounce the search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay before applying the search
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Move loadTemplates into useCallback so it can be safely used in the dependency array
  const loadTemplates = useCallback(async () => {
    try {
      setLoadingTemplates(true);
      setTemplates([]); // Clear existing templates while loading
      
      // Use the updated getTemplates function which now accepts size and search parameters
      const fetchedTemplates = await getTemplates(
        templateFilter,
        template?.size, // Pass the current template size as a filter
        debouncedSearchQuery.trim() ? debouncedSearchQuery : undefined // Only pass search query if it's not empty
      );
      
      setTemplates(fetchedTemplates || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      message.error(t('templateEditorPage.failed_to_load_templates'));
      setTemplates([]); // Ensure templates is empty if there was an error
    } finally {
      setLoadingTemplates(false);
    }
  }, [templateFilter, t, template?.size, debouncedSearchQuery]); // Use debouncedSearchQuery instead of searchQuery

  // Now use the callback in useEffect with the updated dependencies
  React.useEffect(() => {
    loadTemplates();
  }, [userId, loadTemplates]); // Keep the same dependencies

  // Update the filteredTemplates logic to simplify since filtering is now handled by the backend
  const filteredTemplates = React.useMemo(() => {
    // Filter out the current template if it exists
    return template?.uuid
      ? templates.filter(t => t.uuid !== template.uuid)
      : templates;
  }, [templates, template?.uuid]);

  // Handle template selection
  const handleTemplateSelect = async (selectedTemplate: Template) => {
    if (!template || !selectedTemplate) return;
    
    // Display confirmation before applying template elements
    if (window.confirm(t('templateEditorPage.confirm_add_elements', { name: selectedTemplate.name }))) {
      try {
        // Store the message reference so we can close it later
        const loadingMessage = message.loading(t('templateEditorPage.adding_elements', { name: selectedTemplate.name }), 0);

        console.log('Selected template for elements:', selectedTemplate);

        // Add all elements in z-index order to maintain the layering
        const allElements = [
          ...(selectedTemplate.shapes || []).map(el => ({ ...el, type: 'shape' })),
          ...(selectedTemplate.images || []).map(el => ({ ...el, type: 'image' })),
          ...(selectedTemplate.texts || []).map(el => ({ ...el, type: 'text' }))
        ].sort((a, b) => (Number(a.zIndex) || 0) - (Number(b.zIndex) || 0));

        // Prepare all elements for batch addition
        const batchElements = allElements.map(element => {
          // Create a deep clone of the element
          const elementCopy = JSON.parse(JSON.stringify(element));
          // Only remove the UUID to get a new one
          delete elementCopy.uuid;
          
          // Ensure all numeric properties are properly converted to numbers
          if (element.type === 'image') {
            elementCopy.width = Number(elementCopy.width);
            elementCopy.height = Number(elementCopy.height);
            elementCopy.positionX = Number(elementCopy.positionX);
            elementCopy.positionY = Number(elementCopy.positionY);
            elementCopy.zIndex = Number(elementCopy.zIndex);
            elementCopy.rotation = Number(elementCopy.rotation || 0);
            elementCopy.opacity = Number(elementCopy.opacity || 1.0);
            elementCopy.borderRadius = Number(elementCopy.borderRadius || 0);
          } else if (element.type === 'text') {
            elementCopy.fontSize = Number(elementCopy.fontSize);
            elementCopy.positionX = Number(elementCopy.positionX);
            elementCopy.positionY = Number(elementCopy.positionY);
            elementCopy.zIndex = Number(elementCopy.zIndex);
            elementCopy.rotation = Number(elementCopy.rotation || 0);
            elementCopy.opacity = Number(elementCopy.opacity || 1.0);
          } else if (element.type === 'shape') {
            elementCopy.width = Number(elementCopy.width);
            elementCopy.height = Number(elementCopy.height);
            elementCopy.positionX = Number(elementCopy.positionX);
            elementCopy.positionY = Number(elementCopy.positionY);
            elementCopy.zIndex = Number(elementCopy.zIndex);
            elementCopy.rotation = Number(elementCopy.rotation || 0);
            elementCopy.opacity = Number(elementCopy.opacity || 1.0);
          }
          
          console.log(`Prepared ${element.type} element:`, elementCopy);
          
          return {
            type: element.type,
            data: elementCopy
          };
        });
        
        // Use the batch add function if available, otherwise fall back to sequential
        if (onAddBatchElements) {
          // Use the batch function for better performance
          await onAddBatchElements(batchElements);
        } else {
          // Fallback to sequential addition if batch function not available
          const elementPromises = batchElements.map(element => {
            return new Promise<void>((resolve) => {
              // Add the element based on its type
              switch (element.type) {
                case 'shape':
                  onAddElement(ElementType.SHAPE, element.data);
                  break;
                case 'image':
                  // For images, ensure we're passing the exact dimensions
                  onAddElement(ElementType.IMAGE, {
                    ...element.data,
                    // Force exact numeric values for dimensions
                    width: Number(element.data.width),
                    height: Number(element.data.height)
                  });
                  break;
                case 'text':
                  onAddElement(ElementType.TEXT, element.data);
                  break;
              }
              
              // Short timeout to ensure the element is processed before adding the next
              setTimeout(resolve, 100);
            });
          });
          
          // Wait for all elements to be added
          await Promise.all(elementPromises);
        }

        // Close the loading message
        loadingMessage();
        
        // Show success message
        message.success(t('templateEditorPage.elements_added_from_template', { name: selectedTemplate.name }));
        
        // Force a refresh of the template to ensure all elements are properly loaded
        if (onElementsOrderChange) {
          onElementsOrderChange();
        }
      } catch (error) {
        // Make sure to close the loading message even if there's an error
        message.destroy();
        
        console.error('Error adding template elements:', error);
        message.error(t('templateEditorPage.failed_to_add_template_elements'));
      }
    }
  };

  // Sample text elements
  const textElements = [
    { name: t('templateEditorPage.heading'), style: { fontSize: 32, fontWeight: 'bold' } },
    { name: t('templateEditorPage.subheading'), style: { fontSize: 24, fontWeight: 'bold' } },
    { name: t('templateEditorPage.body_text'), style: { fontSize: 16 } },
    { name: t('templateEditorPage.caption'), style: { fontSize: 12, color: '#888' } },
    { name: t('templateEditorPage.quote'), style: { fontSize: 18, fontStyle: 'italic' } },
  ];

  // Sample shape elements
  const shapeElements = [
    { name: t('templateEditorPage.rectangle'), type: 'rectangle', color: '#4A90E2' },
    { name: t('templateEditorPage.circle'), type: 'circle', color: '#7ED321' },
    { name: t('templateEditorPage.triangle'), type: 'triangle', color: '#F5A623' },
    { name: t('templateEditorPage.line'), type: 'line', color: '#9013FE' },
    { name: t('templateEditorPage.star'), type: 'star', color: '#F8E71C' },
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
        message.error(t('templateEditorPage.only_upload_images'));
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
            
            // Create an image object to get dimensions
            const img = new Image();
            img.onload = () => {
              // Get original dimensions
              let width = img.width;
              let height = img.height;
              
              // Calculate aspect ratio
              const aspectRatio = width / height;
              
              // If width or height is greater than 500px, scale down while maintaining aspect ratio
              if (width > 500 || height > 500) {
                if (width > height) {
                  // Width is larger, cap at 500px
                  width = 500;
                  height = Math.round(width / aspectRatio);
                } else {
                  // Height is larger, cap at 500px
                  height = 500;
                  width = Math.round(height * aspectRatio);
                }
              }
              
              // Add the image with the calculated dimensions
              onAddElement(ElementType.IMAGE, {
                image: imageUrl,
                width,
                height
              });
              message.success(t('templateEditorPage.image_added_to_canvas_and_saved', { name: file.name }));
            };
            
            // Handle loading errors
            img.onerror = () => {
              // Fallback to original method without size calculation
              onAddElement(ElementType.IMAGE, { image: imageUrl });
              message.success(t('templateEditorPage.image_added_to_canvas_and_saved', { name: file.name }));
            };
            
            // Set source to load the image
            img.src = imageUrl;
            
          } catch (error) {
            console.error('Error saving image asset:', error);
            // Still add the image to the canvas even if saving as asset failed
            // Create an image object to get dimensions
            const img = new Image();
            img.onload = () => {
              // Get original dimensions
              let width = img.width;
              let height = img.height;
              
              // Calculate aspect ratio
              const aspectRatio = width / height;
              
              // If width or height is greater than 500px, scale down while maintaining aspect ratio
              if (width > 500 || height > 500) {
                if (width > height) {
                  // Width is larger, cap at 500px
                  width = 500;
                  height = Math.round(width / aspectRatio);
                } else {
                  // Height is larger, cap at 500px
                  height = 500;
                  width = Math.round(height * aspectRatio);
                }
              }
              
              // Add the image with the calculated dimensions
              onAddElement(ElementType.IMAGE, {
                image: imageUrl,
                width,
                height
              });
              message.success(t('templateEditorPage.image_added_to_canvas', { name: file.name }));
            };
            
            // Handle loading errors
            img.onerror = () => {
              // Fallback to original method without size calculation
              onAddElement(ElementType.IMAGE, { image: imageUrl });
              message.success(t('templateEditorPage.image_added_to_canvas', { name: file.name }));
            };
            
            // Set source to load the image
            img.src = imageUrl;
            
            message.error(t('templateEditorPage.failed_to_save_image_asset'));
          }
        } else {
          message.error(t('templateEditorPage.failed_to_load_image', { name: file.name }));
        }
      };
      
      reader.onerror = () => {
        message.error(t('templateEditorPage.failed_to_read_file', { name: file.name }));
      };
      
      // Start reading the file
      reader.readAsDataURL(file);
      
      // Return false to prevent actual upload (handled manually)
      return false;
    },
    onChange(info: any) {
      // We're handling the file in beforeUpload, so this is just for feedback
      if (info.file.status === 'error') {
        message.error(t('templateEditorPage.file_upload_failed', { name: info.file.name }));
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
    // Create a new image element to check dimensions and maintain aspect ratio
    const img = new Image();
    img.onload = () => {
      // Get original dimensions
      let width = img.width;
      let height = img.height;
      
      // Calculate aspect ratio
      const aspectRatio = width / height;
      
      // If width or height is greater than 500px, scale down while maintaining aspect ratio
      if (width > 500 || height > 500) {
        if (width > height) {
          // Width is larger, cap at 500px
          width = 500;
          height = Math.round(width / aspectRatio);
        } else {
          // Height is larger, cap at 500px
          height = 500;
          width = Math.round(height * aspectRatio);
        }
      }
      
      // Add the image with the calculated dimensions
      onAddElement(ElementType.IMAGE, { 
        image: asset.image,
        width,
        height
      });
      message.success(t('templateEditorPage.image_added_to_canvas'));
    };
    
    // Handle loading errors
    img.onerror = () => {
      // Fallback to original method without size calculation
      onAddElement(ElementType.IMAGE, { image: asset.image });
      message.success(t('templateEditorPage.image_added_to_canvas'));
    };
    
    // Set source to load the image
    img.src = asset.image;
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
      return `${t('templateEditorPage.text')}: ${(element as any).text || t('templateEditorPage.text')}`;
    } else if (element.elementType === 'image') {
      return `${t('templateEditorPage.image')} ${element.uuid.slice(0, 6)}`;
    } else if (element.elementType === 'shape') {
      return `${t('templateEditorPage.shape')}: ${(element as any).shapeType || t('templateEditorPage.shape')}`;
    }
    return `${t('templateEditorPage.element')} ${element.uuid.slice(0, 6)}`;
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

    // Update z-index for all elements while preserving other properties
    const updates = newElements.map((item, index) => {
      const newZIndex = newElements.length - index; // Higher z-index for items at the top
      
      // Base properties that all elements have
      const baseUpdate = {
        uuid: item.uuid,
        elementType: item.elementType,
        zIndex: newZIndex,
        positionX: Number(item.positionX),
        positionY: Number(item.positionY),
        rotation: Number(item.rotation || 0),
        opacity: Number('opacity' in item ? item.opacity || 1 : 1)
      };

      let updateData;
      
      // Add type-specific properties based on element type
      if (item.elementType === 'shape' || item.elementType === 'image') {
        updateData = {
          ...baseUpdate,
          width: Number((item as any).width || 100),
          height: Number((item as any).height || 100),
          ...(item.elementType === 'shape' ? { color: (item as any).color, shapeType: (item as any).shapeType } : {}),
          ...(item.elementType === 'image' ? { image: (item as any).image } : {})
        };
      } else if (item.elementType === 'text') {
        updateData = {
          ...baseUpdate,
          text: (item as any).text,
          font: (item as any).font,
          fontSize: Number((item as any).fontSize || 16),
          color: (item as any).color
        };
      } else {
        updateData = baseUpdate;
      }

      return updateElementInTemplate(
        template.uuid,
        item.uuid,
        item.elementType as 'image' | 'text' | 'shape',
        updateData
      );
    });

    try {
      await Promise.all(updates);
      message.success(t('templateEditorPage.element_order_updated'));
      // Notify parent component about the order change
      onElementsOrderChange?.();
    } catch (error) {
      console.error('Error updating element order:', error);
      message.error(t('templateEditorPage.failed_update_element_order'));
    }
  };

  return (
    <div className="elements-panel">
      <Tabs defaultActiveKey="images" tabPosition="top" className="elements-tabs">
        <TabPane 
          tab={<><LayoutOutlined /> {t('templateEditorPage.templates')}</>} 
          key="templates"
        >
          <div className="tab-content">
            <div className="template-search">
              <Input 
                placeholder={t('templateEditorPage.search_templates')}
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
                <Radio.Button value="default">{t('templateEditorPage.default')}</Radio.Button>
                <Radio.Button value="liked">{t('templateEditorPage.liked')}</Radio.Button>
              </Radio.Group>
            </div>
            
            <div className="templates-container">
              {loadingTemplates ? (
                <div className="templates-loading">
                  <Spin tip={t('templateEditorPage.loading_templates')} />
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
                                src={item.thumbnail || (item.backgroundImage === 'no_image.jpg' ? '/default-template-icon.png' : item.backgroundImage)} 
                                className="template-background"
                              />
                              {/* Removed overlay template elements as per request */}
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
                      ? t('templateEditorPage.no_templates_match_search')
                      : templateFilter === "liked" 
                        ? t('templateEditorPage.no_liked_templates')
                        : template?.size
                          ? t('templateEditorPage.no_templates_with_size', { size: template.size })
                          : t('templateEditorPage.no_templates_available')
                  } 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
          </div>
        </TabPane>
        
        <TabPane 
          tab={<><PictureOutlined /> {t('templateEditorPage.images')}</>} 
          key="images"
        >
          <div className="tab-content">
            <Dragger {...uploadProps} className="image-uploader">
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">{t('templateEditorPage.click_drag_upload')}</p>
              <p className="ant-upload-hint">
                {t('templateEditorPage.supported_formats')}
              </p>
            </Dragger>

            <div className="my-assets-section">
              <div className="section-title">{t('templateEditorPage.my_assets')}</div>
              {loadingAssets ? (
                <div className="assets-loading">
                  <Spin tip={t('templateEditorPage.loading_images')} />
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
                  description={t('templateEditorPage.no_saved_images')}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
              <div className="refresh-assets">
                <Button 
                  type="link" 
                  onClick={loadUserAssets}
                  disabled={loadingAssets}
                >
                  {t('templateEditorPage.refresh')}
                </Button>
              </div>
            </div>
          </div>
        </TabPane>
        
        <TabPane 
          tab={<><FontSizeOutlined /> {t('templateEditorPage.text')}</>} 
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
          tab={<><BorderOutlined /> {t('templateEditorPage.shapes')}</>} 
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
          <UnorderedListOutlined /> {t('templateEditorPage.elements')}
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