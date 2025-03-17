import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Button, Input, Spin, message, Tooltip, Modal, notification } from 'antd';
import { 
  ArrowLeftOutlined, 
  SaveOutlined, 
  UndoOutlined, 
  RedoOutlined, 
  DeleteOutlined,
  CloudUploadOutlined,
  HeartOutlined,
  HeartFilled
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { 
  fetchTemplateWithElements, 
  updateTemplate, 
  deleteTemplate,
  createTextElement,
  createImageAsset,
  createShapeElement,
  deleteElementFromTemplate,
  updateElementInTemplate,
  debugElementProperties
} from '../../services/designService';
import { Template, ElementType, DesignElement } from '../../types';
import CanvasWorkspace from './components/CanvasWorkspace';
import ElementsPanel from './components/ElementsPanel';
import PropertiesPanel from './components/PropertiesPanel';
import './TemplateEditorPage.scss';
import debounce from 'lodash/debounce';
import axios from 'axios';
import { baseURL } from 'types/baseUrl';
import Cookies from 'js-cookie';
import html2canvas from 'html2canvas';

const { Header, Sider, Content } = Layout;

const TemplateEditorPage: React.FC = () => {
  const { t } = useTranslation('templateEditorPage');
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse query parameters to check if we came from a post
  const queryParams = new URLSearchParams(location.search);
  const sourceType = queryParams.get('source');
  const postId = queryParams.get('postId');
  const isFromPost = sourceType === 'post' && postId;
  
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [templateName, setTemplateName] = useState<string>('');
  const [selectedElement, setSelectedElement] = useState<DesignElement | null>(null);
  const [history, setHistory] = useState<Template[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSavingToPost, setIsSavingToPost] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  // Load template data on mount
  useEffect(() => {
    if (uuid) {
      loadTemplate(uuid);
    }
  }, [uuid]);

  // Initialize history and like status when template is loaded
  useEffect(() => {
    if (template) {
      setTemplateName(template.name);
      // Set like status from template
      setIsLiked(template.like || false);
      // Only initialize history if it's empty
      if (history.length === 0) {
        setHistory([template]);
        setHistoryIndex(0);
      }
    }
  }, [template]);

  // Add keyboard event listener for Delete/Backspace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
        // Only trigger delete if we're not in an input field
        if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
          e.preventDefault();
          handleDeleteElement();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElement]);

  // Monitor template state changes with minimal logging
  useEffect(() => {
    if (template && template.shapes && template.shapes.length > 0) {
      // Only log once when template is loaded, not on every update
      if (template.shapes.some(shape => shape.positionX === 0 && shape.positionY === 0)) {
        console.log('Warning: Some shapes have position (0,0) which may indicate a problem');
      }
    }
  }, [template]);

  const loadTemplate = async (uuid: string) => {
    try {
      setLoading(true);
      console.log(`Loading template with uuid: ${uuid}`);
      
      // Fetch template - data is now processed in fetchTemplateWithElements
      const data = await fetchTemplateWithElements(uuid);
      
      // Verify positions are properly set
      if (data.shapes && data.shapes.length > 0) {
        // Ensure position values are numbers
        data.shapes.forEach((shape: any) => {
          shape.positionX = Number(shape.positionX);
          shape.positionY = Number(shape.positionY);
          shape.width = Number(shape.width);
          shape.height = Number(shape.height);
          shape.zIndex = Number(shape.zIndex);
          shape.rotation = Number(shape.rotation);
        });
      }
      
      if (data.texts && data.texts.length > 0) {
        // Ensure position values are numbers
        data.texts.forEach((text: any) => {
          text.positionX = Number(text.positionX);
          text.positionY = Number(text.positionY);
          text.fontSize = Number(text.fontSize);
          text.zIndex = Number(text.zIndex);
          text.rotation = Number(text.rotation);
        });
      }
      
      if (data.images && data.images.length > 0) {
        // Ensure position values are numbers
        data.images.forEach((image: any) => {
          image.positionX = Number(image.positionX);
          image.positionY = Number(image.positionY);
          image.width = Number(image.width);
          image.height = Number(image.height);
          image.zIndex = Number(image.zIndex);
          image.rotation = Number(image.rotation);
        });
      }
      
      // Set the template with the processed data
      setTemplate(data);
      
      // Auto-select the first element if available to show properties
      setTimeout(() => {
        if (data.shapes && data.shapes.length > 0) {
          handleSelectElement(data.shapes[0]);
        } else if (data.texts && data.texts.length > 0) {
          handleSelectElement(data.texts[0]);
        } else if (data.images && data.images.length > 0) {
          handleSelectElement(data.images[0]);
        }
      }, 100);
    } catch (error) {
      console.error('Error fetching template:', error);
      message.error('Failed to load template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/design');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemplateName(e.target.value);
  };

  const processElementForSaving = (element: any, elementType: 'text' | 'image' | 'shape') => {
    // Create a new object with explicitly converted numeric properties
    const processedElement: any = {};
    
    // Copy all properties from the original element
    Object.keys(element).forEach(key => {
      const value = element[key];
      
      // Convert numeric properties to numbers
      if (['positionX', 'positionY', 'width', 'height', 'rotation', 'fontSize'].includes(key)) {
        processedElement[key] = value !== null ? Number(value) : 0;
      } else if (key === 'zIndex') {
        // Ensure zIndex is an integer
        processedElement[key] = value !== null ? parseInt(String(value)) : 0;
      } else {
        processedElement[key] = value;
      }
    });
    
    // Ensure required properties are present and numeric
    processedElement.positionX = element.positionX !== null ? Number(element.positionX) : 0;
    processedElement.positionY = element.positionY !== null ? Number(element.positionY) : 0;
    processedElement.zIndex = element.zIndex !== null ? parseInt(String(element.zIndex)) : 0;
    processedElement.rotation = element.rotation !== null ? Number(element.rotation) : 0;
    
    // Additional properties based on element type
    if (elementType === 'text') {
      processedElement.fontSize = element.fontSize !== null ? Number(element.fontSize) : 16;
    }
    
    if (elementType === 'image' || elementType === 'shape') {
      processedElement.width = element.width !== null ? Number(element.width) : 100;
      processedElement.height = element.height !== null ? Number(element.height) : 100;
    }
    
    // Ensure shape_type is preserved for shape elements
    if (elementType === 'shape') {
      // If shapeType is null or empty, set it to 'rectangle'
      if (!element.shapeType) {
        console.warn('Shape type is null or empty, defaulting to rectangle');
        processedElement.shapeType = 'rectangle';
      } else {
        processedElement.shapeType = element.shapeType;
      }
    }
    
    console.log(`Processed ${elementType} element for saving:`, processedElement);
    
    return processedElement;
  };

  const handleSave = async () => {
    if (!template || !uuid) return;
    
    try {
      setIsSaving(true);
      console.log('Saving template with elements...');
      
      // Create a copy of the current template to preserve all properties
      let updatedTemplateData = { ...template };
      
      // First, save all element properties if there are any changes
      if (template.texts && template.texts.length > 0) {
        console.log(`Saving ${template.texts.length} text elements...`);
        for (const text of template.texts) {
          const processedText = processElementForSaving(text, 'text');
          console.log(`Saving text element ${text.uuid} with position: (${processedText.positionX}, ${processedText.positionY})`);
          await updateElementInTemplate(uuid, text.uuid, 'text', JSON.stringify(processedText));
          
          // Update the element in our local copy
          updatedTemplateData.texts = updatedTemplateData.texts?.map(t => 
            t.uuid === text.uuid ? processedText : t
          );
        }
      }
      
      if (template.images && template.images.length > 0) {
        console.log(`Saving ${template.images.length} image elements...`);
        for (const image of template.images) {
          const processedImage = processElementForSaving(image, 'image');
          console.log(`Saving image element ${image.uuid} with position: (${processedImage.positionX}, ${processedImage.positionY})`);
          await updateElementInTemplate(uuid, image.uuid, 'image', JSON.stringify(processedImage));
          
          // Update the element in our local copy
          updatedTemplateData.images = updatedTemplateData.images?.map(img => 
            img.uuid === image.uuid ? processedImage : img
          );
        }
      }
      
      if (template.shapes && template.shapes.length > 0) {
        console.log(`Saving ${template.shapes.length} shape elements...`);
        for (const shape of template.shapes) {
          const processedShape = processElementForSaving(shape, 'shape');
          console.log(`Saving shape element ${shape.uuid} with position: (${processedShape.positionX}, ${processedShape.positionY}), shapeType: ${processedShape.shapeType}`);
          await updateElementInTemplate(uuid, shape.uuid, 'shape', JSON.stringify(processedShape));
          
          // Update the element in our local copy
          updatedTemplateData.shapes = updatedTemplateData.shapes?.map(s => 
            s.uuid === shape.uuid ? processedShape : s
          );
        }
      }
      
      // Then save the template name
      console.log(`Saving template name: ${templateName}`);
      const updatedTemplate = await updateTemplate(uuid, { name: templateName });
      
      // Merge the updated template with our local copy to ensure all properties are preserved
      updatedTemplateData = {
        ...updatedTemplateData,
        name: updatedTemplate.name,
        isDefault: updatedTemplate.isDefault,
        size: updatedTemplate.size,
      };
      
      // Set the template directly without reloading from server
      // This preserves all our correctly saved element positions
      console.log('Template saved, using local data with preserved positions');
      setTemplate(updatedTemplateData);
      
      message.success('Template saved successfully');
    } catch (error: any) {
      console.error('Error saving template:', error);
      message.error(`Failed to save template: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!template || !uuid) return;
    
    try {
      const success = await deleteTemplate(uuid);
      if (success) {
        message.success('Template deleted successfully');
        navigate('/design');
      } else {
        message.error('Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      message.error('Failed to delete template. Please try again.');
    }
  };

  const showDeleteConfirm = () => {
    setDeleteModalVisible(true);
  };

  const addElementToHistory = useCallback((updatedTemplate: Template) => {
    if (historyIndex < history.length - 1) {
      // If we're not at the latest state, truncate the future history
      const newHistory = history.slice(0, historyIndex + 1);
      setHistory([...newHistory, updatedTemplate]);
    } else {
      setHistory([...history, updatedTemplate]);
    }
    setHistoryIndex(prev => prev + 1);
  }, [history, historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setTemplate(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setTemplate(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const handleSelectElement = (element: DesignElement | null) => {
    console.log('Selecting element:', element);
    
    // If element has position values, log them for debugging
    if (element && 'positionX' in element) {
      console.log(`Selected element position: (${element.positionX}, ${element.positionY})`);
      
      // Create a deep copy of the element to avoid modifying the original reference
      const processedElement = { ...element };
      
      // Ensure position values are numbers, not null
      if (processedElement.positionX === null) processedElement.positionX = 0;
      if (processedElement.positionY === null) processedElement.positionY = 0;
      
      // Log the final position values being passed to the PropertiesPanel
      console.log(`Properties panel will receive element with position: (${processedElement.positionX}, ${processedElement.positionY})`);
      
      // Update the element in the template state to ensure consistency
      if (template) {
        let updatedTemplate = { ...template };
        
        if ('shapeType' in processedElement && updatedTemplate.shapes) {
          updatedTemplate.shapes = updatedTemplate.shapes.map(shape => 
            shape.uuid === processedElement.uuid ? processedElement : shape
          );
        } else if ('text' in processedElement && updatedTemplate.texts) {
          updatedTemplate.texts = updatedTemplate.texts.map(text => 
            text.uuid === processedElement.uuid ? processedElement : text
          );
        } else if ('image' in processedElement && updatedTemplate.images) {
          updatedTemplate.images = updatedTemplate.images.map(image => 
            image.uuid === processedElement.uuid ? processedElement : image
          );
        }
        
        setTemplate(updatedTemplate);
      }
      
      // Set the processed element as the selected element
      setSelectedElement(processedElement);
    } else {
      setSelectedElement(element);
    }
  };

  const handleUpdateElements = useCallback((updatedTemplate: Template) => {
    // Ensure all position values are numbers in the updated template
    if (updatedTemplate.shapes && updatedTemplate.shapes.length > 0) {
      updatedTemplate.shapes = updatedTemplate.shapes.map(shape => ({
        ...shape,
        positionX: Number(shape.positionX),
        positionY: Number(shape.positionY),
        width: Number(shape.width),
        height: Number(shape.height),
        zIndex: Number(shape.zIndex),
        rotation: Number(shape.rotation)
      }));
    }
    
    if (updatedTemplate.texts && updatedTemplate.texts.length > 0) {
      updatedTemplate.texts = updatedTemplate.texts.map(text => ({
        ...text,
        positionX: Number(text.positionX),
        positionY: Number(text.positionY),
        fontSize: Number(text.fontSize),
        zIndex: Number(text.zIndex),
        rotation: Number(text.rotation)
      }));
    }
    
    if (updatedTemplate.images && updatedTemplate.images.length > 0) {
      updatedTemplate.images = updatedTemplate.images.map(image => ({
        ...image,
        positionX: Number(image.positionX),
        positionY: Number(image.positionY),
        width: Number(image.width),
        height: Number(image.height),
        zIndex: Number(image.zIndex),
        rotation: Number(image.rotation)
      }));
    }
    
    setTemplate(updatedTemplate);
    addElementToHistory(updatedTemplate);
  }, [addElementToHistory]);

  // Create a debounced function for updating elements in the backend
  const debouncedUpdateElement = useCallback(
    debounce(async (templateId: string, element: DesignElement, elementType: 'text' | 'image' | 'shape') => {
      try {
        // Create a new object with explicitly converted numeric properties
        const processedElement: any = {};
        
        // Copy all properties from the original element
        Object.keys(element).forEach(key => {
          const value = (element as any)[key];
          
          // Convert numeric properties to numbers
          if (['positionX', 'positionY', 'width', 'height', 'zIndex', 'rotation', 'fontSize'].includes(key)) {
            processedElement[key] = Number(value);
          } else {
            processedElement[key] = value;
          }
        });
        
        // Ensure required properties are present and numeric
        if ('positionX' in element) processedElement.positionX = Number(element.positionX);
        if ('positionY' in element) processedElement.positionY = Number(element.positionY);
        if ('zIndex' in element) processedElement.zIndex = Number(element.zIndex);
        if ('rotation' in element) processedElement.rotation = Number(element.rotation);
        
        // Additional properties based on element type
        if (elementType === 'text' && 'fontSize' in element) {
          processedElement.fontSize = Number((element as any).fontSize);
        }
        
        if ((elementType === 'image' || elementType === 'shape') && 'width' in element) {
          processedElement.width = Number((element as any).width);
        }
        
        if ((elementType === 'image' || elementType === 'shape') && 'height' in element) {
          processedElement.height = Number((element as any).height);
        }
        
        console.log('Updating element with properties:', processedElement);
        
        // Convert to JSON string with explicit handling of numeric values
        const jsonString = JSON.stringify(processedElement);
        console.log('JSON string being sent:', jsonString);
        
        await updateElementInTemplate(
          templateId,
          element.uuid,
          elementType,
          jsonString
        );
      } catch (error) {
        console.error('Error updating element:', error);
      }
    }, 500), // 500ms debounce time
    []
  );

  // Function to handle element updates with real-time visual updates
  const handleElementUpdate = useCallback((updatedElement: DesignElement) => {
    if (!template || !selectedElement) return;
    
    let updatedTemplate: Template = { ...template };
    let elementType: 'text' | 'image' | 'shape';
    
    if ('image' in selectedElement) {
      elementType = 'image';
      updatedTemplate.images = template.images?.map(img => 
        img.uuid === selectedElement.uuid ? updatedElement as any : img
      );
    } else if ('text' in selectedElement) {
      elementType = 'text';
      updatedTemplate.texts = template.texts?.map(txt => 
        txt.uuid === selectedElement.uuid ? updatedElement as any : txt
      );
    } else if ('shapeType' in selectedElement) {
      elementType = 'shape';
      updatedTemplate.shapes = template.shapes?.map(shape => 
        shape.uuid === selectedElement.uuid ? updatedElement as any : shape
      );
    } else {
      return;
    }
    
    // Update the UI immediately
    handleUpdateElements(updatedTemplate);
    
    // Debounced update to the backend
    if (uuid) {
      debouncedUpdateElement(uuid, updatedElement, elementType);
    }
  }, [template, selectedElement, handleUpdateElements, debouncedUpdateElement, uuid]);

  // Add functions to handle creating new elements
  const handleAddElement = async (elementType: ElementType, data?: any) => {
    if (!template || !uuid) return;
    
    try {
      let updatedTemplate: Template;
      
      // Calculate center position of the canvas
      const centerX = 300; // Default center X
      const centerY = 300; // Default center Y
      
      switch(elementType) {
        case 'text':
          // Default text properties
          const text = data?.text || 'New Text';
          const font = data?.font || 'Arial';
          const fontSize = data?.fontSize || 24;
          const color = data?.color || '#000000';
          // Center the text on the canvas
          const positionX = data?.positionX || centerX;
          const positionY = data?.positionY || centerY;
          
          console.log('Creating text element with:', { text, font, fontSize, color, positionX, positionY });
          
          updatedTemplate = await createTextElement(
            uuid, 
            text, 
            font, 
            fontSize, 
            color, 
            positionX, 
            positionY
          );
          
          // Immediately save the element properties to ensure they persist
          if (updatedTemplate.texts && updatedTemplate.texts.length > 0) {
            const newText = updatedTemplate.texts[updatedTemplate.texts.length - 1];
            const processedText = processElementForSaving(newText, 'text');
            await updateElementInTemplate(uuid, newText.uuid, 'text', JSON.stringify(processedText));
          }
          break;
        
        case 'image':
          // Default image properties
          const image = data?.image || '';
          if (!image) {
            message.error('No image provided');
            return;
          }
          updatedTemplate = await createImageAsset(
            uuid,
            image,
            data?.positionX || centerX,
            data?.positionY || centerY,
            data?.width || 200,
            data?.height || 200,
            -1 // zIndex - set to -1 to place behind other elements
          );
          
          // Immediately save the element properties
          if (updatedTemplate.images && updatedTemplate.images.length > 0) {
            const newImage = updatedTemplate.images[updatedTemplate.images.length - 1];
            const processedImage = processElementForSaving(newImage, 'image');
            await updateElementInTemplate(uuid, newImage.uuid, 'image', JSON.stringify(processedImage));
          }
          break;
        
        case 'shape':
          // Default shape properties
          // Use the shapeType from data, or default to 'rectangle' if not provided
          const shapeType = data?.shapeType || 'rectangle';
          console.log('Creating shape element with type:', shapeType);
          console.log('Full shape data received:', data);
          
          try {
            updatedTemplate = await createShapeElement(
              uuid,
              shapeType,  // Use the provided shapeType
              data?.color || '#000000',
              data?.positionX || centerX,
              data?.positionY || centerY,
              data?.width || 100,
              data?.height || 100
            );
            
            // Immediately save the element properties
            if (updatedTemplate.shapes && updatedTemplate.shapes.length > 0) {
              const newShape = updatedTemplate.shapes[updatedTemplate.shapes.length - 1];
              const processedShape = processElementForSaving(newShape, 'shape');
              await updateElementInTemplate(uuid, newShape.uuid, 'shape', JSON.stringify(processedShape));
            }
          } catch (error: any) {
            console.error('Error creating shape element:', error);
            message.error(`Failed to add shape element: ${error.message || 'Unknown error'}`);
            return;
          }
          break;
          
        default:
          message.error(`Unknown element type: ${elementType}`);
          return;
      }
      
      // Update the template in state
      console.log('Updated template after adding element:', updatedTemplate);
      console.log('Number of shapes in updated template:', updatedTemplate.shapes?.length || 0);

      // Create a fresh copy to ensure React detects the change
      const freshTemplate = { ...updatedTemplate };
      setTemplate(freshTemplate);

      // Add to history
      addElementToHistory(freshTemplate);

      // Show success message
      message.success(`Added ${elementType} element to canvas`);
    } catch (error: any) {
      console.error(`Error adding ${elementType} element:`, error);
      message.error(`Failed to add ${elementType} element: ${error.message || 'Unknown error'}`);
    }
  };

  // Function to delete the selected element
  const handleDeleteElement = async () => {
    if (!template || !selectedElement || !uuid) return;
    
    try {
      // Determine element type
      let elementType: 'image' | 'text' | 'shape';
      if ('image' in selectedElement) {
        elementType = 'image';
      } else if ('text' in selectedElement) {
        elementType = 'text';
      } else if ('shapeType' in selectedElement) {
        elementType = 'shape';
      } else {
        console.error('Unknown element type');
        return;
      }
      
      const updatedTemplate = await deleteElementFromTemplate(
        uuid,
        selectedElement.uuid,
        elementType
      );
      
      setTemplate(updatedTemplate);
      setSelectedElement(null);
      addElementToHistory(updatedTemplate);
      message.success(`${elementType} element deleted`);
    } catch (error: any) {
      console.error('Error deleting element:', error);
      message.error(`Failed to delete element: ${error.message || 'Unknown error'}`);
    }
  };

  // Function to save the canvas as an image and update the post
  const handleSaveToPost = async () => {
    if (!uuid || !isFromPost || !postId) return;
    
    try {
      setIsSavingToPost(true);
      
      // First, save the template to ensure all changes are persisted
      await handleSave();
      
      // Get the token from cookies
      const token = Cookies.get('token');
      
      console.log('Sending template data to server for rendering...');
      console.log('Template UUID:', uuid);
      console.log('Post ID:', postId);
      
      // Skip updating the post with the template UUID if it's already set to this template
      // This prevents creating a new template when saving to post
      let shouldUpdatePostTemplate = true;
      
      try {
        // Check if the post already has this template
        const postResponse = await fetch(`${baseURL}posts/${postId}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });
        
        if (postResponse.ok) {
          const postData = await postResponse.json();
          if (postData.template === uuid) {
            console.log(`Post ${postId} already has template ${uuid}, skipping update`);
            shouldUpdatePostTemplate = false;
          }
        }
      } catch (error) {
        console.error('Error checking post template:', error);
      }
      
      // Only update the post with the template UUID if needed
      if (shouldUpdatePostTemplate) {
        try {
          const formData = new URLSearchParams();
          formData.append('template_uuid', uuid);
          
          // Send the request to update the post with the template UUID
          await fetch(`${baseURL}posts/${postId}/update-template/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
            credentials: 'include',
          });
          
          console.log(`Post ${postId} updated with template ${uuid}`);
        } catch (error) {
          console.error('Error updating post with template UUID:', error);
        }
      }
      
      // Send the template UUID and post ID to the server for server-side rendering
      const response = await axios({
        method: 'post',
        url: `${baseURL}designs/template-to-post/`,
        data: {
          template_uuid: uuid,
          post_id: postId
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Server response:', response.data);
      
      if (response.data && response.data.success) {
        message.success(t('save_to_post_success'));
        
        // Check if we came from a post query details page
        const postQueryId = queryParams.get('postQueryId');
        
        // Get the new image URL from the response
        const newImageUrl = response.data.picture_url;
        const oldImageUrl = response.data.old_picture_url;
        
        console.log('New image URL:', newImageUrl);
        console.log('Old image URL:', oldImageUrl);
        
        // Add a timestamp to force a refresh of the page
        const timestamp = Date.now();
        
        // Store the new image URL in localStorage to help the PostDetailsPage
        // identify that the image has been updated
        localStorage.setItem(`post_${postId}_image_updated`, 'true');
        localStorage.setItem(`post_${postId}_new_image_url`, newImageUrl);
        localStorage.setItem(`post_${postId}_old_image_url`, oldImageUrl || '');
        localStorage.setItem(`post_${postId}_update_timestamp`, timestamp.toString());
        
        // If the response includes a thumbnail, show it in a notification
        if (response.data.thumbnail) {
          notification.success({
            message: t('save_to_post_success'),
            description: (
              <div>
                <p>{t('image_preview')}</p>
                <img 
                  src={response.data.thumbnail} 
                  alt="Preview" 
                  style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '10px' }} 
                />
              </div>
            ),
            duration: 5,
          });
        }
        
        // Navigate back to the post details page with the correct URL format
        setTimeout(() => {
          if (postQueryId) {
            // If we have a post query ID, use the format with post query ID
            const url = `/post/${postQueryId}/${postId}?refresh=${timestamp}`;
            console.log('Navigating to:', url);
            navigate(url, { replace: true });
          } else {
            // Otherwise use the simple format
            const url = `/post/${postId}?refresh=${timestamp}`;
            console.log('Navigating to:', url);
            navigate(url, { replace: true });
          }
        }, 1000); // Add a longer delay to ensure the notification is shown
      } else {
        throw new Error(response.data.message || 'Failed to update post image');
      }
    } catch (error: any) {
      console.error('Error saving image to post:', error);
      if (error.response && error.response.data) {
        console.error('Server response:', error.response.data);
        
        // Check for specific error messages
        if (error.response.data.picture) {
          message.error(`${t('save_to_post_error')} ${error.response.data.picture[0]}`);
        } else if (error.response.data.message) {
          message.error(`${t('save_to_post_error')} ${error.response.data.message}`);
        } else {
          message.error(t('save_to_post_error'));
        }
      } else {
        message.error(t('save_to_post_error'));
      }
    } finally {
      setIsSavingToPost(false);
    }
  };

  // Function to get a reference to the stage from CanvasWorkspace
  const handleStageRef = (ref: any) => {
    stageRef.current = ref;
  };

  // Add function to toggle like status
  const handleToggleLike = async () => {
    if (!template) return;
    
    try {
      const newLikeStatus = !isLiked;
      setIsLiked(newLikeStatus);
      
      // Update template with new like status
      const updatedTemplate = await updateTemplate(template.uuid, { like: newLikeStatus });
      
      // Update template state with the response
      setTemplate(updatedTemplate);
      
      // Show success message
      message.success(newLikeStatus ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Error toggling like status:', error);
      // Revert UI state if the API call fails
      setIsLiked(!isLiked);
      message.error('Failed to update favorite status');
    }
  };

  if (loading) {
    return (
      <div className="editor-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="editor-error">
        <p>Template not found or failed to load.</p>
        <Button type="primary" onClick={handleBack}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <Layout className="template-editor-layout" ref={containerRef}>
      <Header className="editor-header">
        <div className="header-left">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
          >
            Back
          </Button>
          <Input
            value={templateName}
            onChange={handleNameChange}
            placeholder="Template Name"
            className="template-name-input"
          />
        </div>
        <div className="header-right">
          <Tooltip title={isLiked ? "Remove from favorites" : "Add to favorites"}>
            <Button
              icon={isLiked ? 
                <HeartFilled className="heart-icon filled" /> : 
                <HeartOutlined className="heart-icon" />
              }
              onClick={handleToggleLike}
              className={`header-button ${isLiked ? 'liked' : ''}`}
            />
          </Tooltip>
          {selectedElement && (
            <>
              <Tooltip title="Delete Element">
                <Button 
                  icon={<DeleteOutlined />} 
                  onClick={handleDeleteElement}
                  danger
                  className="header-button"
                />
              </Tooltip>
            </>
          )}
          <Tooltip title="Undo">
            <Button 
              icon={<UndoOutlined />} 
              disabled={historyIndex <= 0}
              onClick={handleUndo}
              className="header-button"
            />
          </Tooltip>
          <Tooltip title="Redo">
            <Button 
              icon={<RedoOutlined />} 
              disabled={historyIndex >= history.length - 1}
              onClick={handleRedo}
              className="header-button"
            />
          </Tooltip>
          <Tooltip title="Delete Template">
            <Button 
              icon={<DeleteOutlined />} 
              danger
              onClick={showDeleteConfirm}
              className="header-button"
            />
          </Tooltip>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            loading={isSaving}
            onClick={handleSave}
          >
            Save
          </Button>
          
          {isFromPost && (
            <Button 
              type="primary" 
              icon={<CloudUploadOutlined />} 
              loading={isSavingToPost}
              onClick={handleSaveToPost}
              className="header-button save-to-post-button"
            >
              Save to Post
            </Button>
          )}
        </div>
      </Header>
      
      <Layout>
        <Sider width={250} className="editor-sider left-sider">
          <ElementsPanel 
            onAddElement={handleAddElement}
          />
        </Sider>
        
        <Content className="editor-content">
          <CanvasWorkspace 
            template={template}
            selectedElement={selectedElement}
            onSelectElement={handleSelectElement}
            onUpdateElements={handleUpdateElements}
            onStageRef={handleStageRef}
          />
        </Content>
        
        <Sider width={300} className="editor-sider right-sider">
          <PropertiesPanel 
            selectedElement={selectedElement}
            onUpdateElement={handleElementUpdate}
          />
        </Sider>
      </Layout>

      <Modal
        title="Delete Template"
        open={deleteModalVisible}
        onOk={handleDeleteTemplate}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this template? This action cannot be undone.</p>
      </Modal>
    </Layout>
  );
};

export default TemplateEditorPage; 