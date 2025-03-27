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
  HeartFilled,
  CopyOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useTypedSelector } from 'hooks/useTypedSelector';
import { 
  fetchTemplateWithElements, 
  updateTemplate, 
  deleteTemplate,
  createTextElement,
  createImageAsset,
  createShapeElement,
  deleteElementFromTemplate,
  updateElementInTemplate,
  debugElementProperties,
  copyTemplate
} from '../../services/designService';
import { Template, ElementType, DesignElement, ImageAsset, TextElement, ShapeElement } from '../../types';
import CanvasWorkspace from './components/CanvasWorkspace';
import ElementsPanel from './components/ElementsPanel';
import PropertiesPanel from './components/PropertiesPanel';
import './TemplateEditorPage.scss';
import debounce from 'lodash/debounce';
import axios from 'axios';
import { baseURL } from 'types/baseUrl';
import Cookies from 'js-cookie';
import html2canvas from 'html2canvas';
import Konva from 'konva';

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
  const mediaId = queryParams.get('mediaId');
  const isFromPost = sourceType === 'post' && postId;
  const isFromPostMedia = sourceType === 'postMedia' && postId && mediaId;
  
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
  const { user } = useTypedSelector((state) => state.auth);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

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
      if (['positionX', 'positionY', 'width', 'height', 'rotation', 'opacity'].includes(key)) {
        processedElement[key] = value !== null && value !== undefined ? Number(value) : 
          (key === 'opacity' ? 1.0 : 0);
      } else if (key === 'fontSize') {
        // Special handling for fontSize - ensure it's never null, undefined, 0, or NaN
        if (value === null || value === undefined || Number(value) === 0 || isNaN(Number(value))) {
          processedElement[key] = 50; // Default font size of 50
          console.log(`Setting default fontSize: 50 for element ${element.uuid}`);
        } else {
          processedElement[key] = Number(value);
          // Make sure fontSize is never too small (minimum 10)
          if (processedElement[key] < 10) {
            processedElement[key] = 10;
            console.log(`Corrected too small fontSize for element ${element.uuid}: min value set to 10`);
          }
          console.log(`Processing fontSize for element ${element.uuid}: original=${value}, converted=${processedElement[key]}`);
        }
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
    
    // Ensure opacity is always set with a reasonable default
    processedElement.opacity = element.opacity !== null && element.opacity !== undefined ? 
      Number(element.opacity) : 1.0;
    
    // Additional properties based on element type
    if (elementType === 'text') {
      // Ensure fontSize is properly set for text elements
      if (!('fontSize' in processedElement) || 
          processedElement.fontSize === null || 
          processedElement.fontSize === 0 || 
          isNaN(processedElement.fontSize)) {
        processedElement.fontSize = 50;
        console.log(`Ensuring text element ${element.uuid} has proper fontSize: 50`);
      }
      
      // Double check the fontSize is at least 10
      if (processedElement.fontSize < 10) {
        processedElement.fontSize = 10;
        console.log(`Final check: Corrected fontSize to minimum of 10 for text element ${element.uuid}`);
      }
      
      console.log(`Final fontSize for text element ${element.uuid}: ${processedElement.fontSize}`);
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
          console.log(`Saving text element ${text.uuid} with position: (${processedText.positionX}, ${processedText.positionY}), opacity: ${processedText.opacity}`);
          await updateElementInTemplate(uuid, text.uuid, 'text', processedText);
          
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
          console.log(`Saving image element ${image.uuid} with position: (${processedImage.positionX}, ${processedImage.positionY}), opacity: ${processedImage.opacity}`);
          await updateElementInTemplate(uuid, image.uuid, 'image', processedImage);
          
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
          console.log(`Saving shape element ${shape.uuid} with position: (${processedShape.positionX}, ${processedShape.positionY}), shapeType: ${processedShape.shapeType}, opacity: ${processedShape.opacity}`);
          await updateElementInTemplate(uuid, shape.uuid, 'shape', processedShape);
          
          // Update the element in our local copy
          updatedTemplateData.shapes = updatedTemplateData.shapes?.map(s => 
            s.uuid === shape.uuid ? processedShape : s
          );
        }
      }
      
      // Generate thumbnail before saving the template
      let thumbnailDataURL = '';
      if (stageRef.current) {
        console.log('Generating thumbnail for template');
        const stage = stageRef.current.getStage();
        if (stage) {
          // Generate a smaller thumbnail image (e.g., 300x300 max)
          const [width, height] = template.size.split('x').map(Number) || [1080, 1080];
          const maxThumbnailSize = 300;
          const scale = Math.min(maxThumbnailSize / width, maxThumbnailSize / height);
          const thumbnailWidth = Math.round(width * scale);
          const thumbnailHeight = Math.round(height * scale);
          
          thumbnailDataURL = stage.toDataURL({
            pixelRatio: 1,
            mimeType: 'image/png',
            width: width,
            height: height,
            quality: 0.8
          });
          console.log(`Generated thumbnail with dimensions: ${thumbnailWidth}x${thumbnailHeight}`);
        }
      }
      
      // Then save the template name and thumbnail
      console.log(`Saving template name: ${templateName} and thumbnail`);
      const updatedTemplate = await updateTemplate(uuid, { 
        name: templateName,
        thumbnail: thumbnailDataURL || undefined
      });
      
      // Merge the updated template with our local copy to ensure all properties are preserved
      updatedTemplateData = {
        ...updatedTemplateData,
        name: updatedTemplate.name,
        isDefault: updatedTemplate.isDefault,
        size: updatedTemplate.size,
        thumbnail: updatedTemplate.thumbnail || updatedTemplateData.thumbnail
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
    if (element) {
      // Create a deep clone of the element to avoid reference issues
      const processedElement = JSON.parse(JSON.stringify(element));
      
      // Ensure all numeric properties are properly converted to numbers
      if ('positionX' in processedElement) {
        processedElement.positionX = Number(processedElement.positionX);
        processedElement.positionY = Number(processedElement.positionY);
        processedElement.zIndex = Number(processedElement.zIndex);
        processedElement.rotation = Number(processedElement.rotation);
      }
      
      // Process additional properties based on element type
      if ('text' in processedElement) {
        processedElement.fontSize = Number(processedElement.fontSize);
      } else if ('width' in processedElement) {
        processedElement.width = Number(processedElement.width);
        processedElement.height = Number(processedElement.height);
      }
      
      // Update the local state of the selected element
      setSelectedElement(processedElement);
      
      // Also update the element in the template to ensure consistency
      const updatedTemplate = { ...template };
      if ('text' in processedElement && updatedTemplate.texts) {
        updatedTemplate.texts = updatedTemplate.texts.map(text => 
          text.uuid === processedElement.uuid ? processedElement : text
        );
      } else if ('image' in processedElement && updatedTemplate.images) {
        updatedTemplate.images = updatedTemplate.images.map(image => 
          image.uuid === processedElement.uuid ? processedElement : image
        );
      } else if ('shapeType' in processedElement && updatedTemplate.shapes) {
        updatedTemplate.shapes = updatedTemplate.shapes.map(shape => 
          shape.uuid === processedElement.uuid ? processedElement : shape
        );
      }
      
      // Don't update the entire template as this could cause unnecessary re-renders
      // Just ensure the selected element is up to date
      setSelectedElement(processedElement);
      
      // Log the current state for debugging
      console.log("Selected element updated:", processedElement);
    } else {
      setSelectedElement(null);
    }
  };

  const handleUpdateElements = useCallback((updatedTemplate: Template) => {
    // Create a deep copy of the current template to ensure we don't lose any properties
    const currentTemplate = template ? JSON.parse(JSON.stringify(template)) : null;
    if (!currentTemplate) {
      // If there's no current template, just use the updated one
      setTemplate(updatedTemplate);
      addElementToHistory(updatedTemplate);
      return;
    }
    
    // Create a deep clone of the current template to avoid reference issues
    const mergedTemplate = JSON.parse(JSON.stringify(currentTemplate));
    
    // Process shapes - create maps for efficient lookup and merging
    if (updatedTemplate.shapes && updatedTemplate.shapes.length > 0) {
      // Create a map of existing shapes by UUID for efficient lookup
      const shapeMap = new Map(
        (mergedTemplate.shapes || []).map((shape: ShapeElement) => [shape.uuid, shape])
      );
      
      // Process each shape in the updated template
      updatedTemplate.shapes.forEach((shape: ShapeElement) => {
        // Get existing shape if it exists and properly cast the type
        const existingShape = shapeMap.get(shape.uuid) as ShapeElement | undefined;
        
        // Normalize numeric values and ensure they are valid
        const processedShape = {
          ...(existingShape || {}), // Start with existing properties if available
          ...shape, // Then apply updated properties
          positionX: shape.positionX !== null && shape.positionX !== undefined && !isNaN(Number(shape.positionX)) 
            ? Number(shape.positionX) 
            : existingShape?.positionX !== null && existingShape?.positionX !== undefined && !isNaN(Number(existingShape?.positionX))
              ? Number(existingShape.positionX)
              : 0,
          positionY: shape.positionY !== null && shape.positionY !== undefined && !isNaN(Number(shape.positionY)) 
            ? Number(shape.positionY) 
            : existingShape?.positionY !== null && existingShape?.positionY !== undefined && !isNaN(Number(existingShape?.positionY))
              ? Number(existingShape.positionY)
              : 0,
          width: shape.width !== null && shape.width !== undefined && !isNaN(Number(shape.width)) 
            ? Number(shape.width) 
            : existingShape?.width !== null && existingShape?.width !== undefined && !isNaN(Number(existingShape?.width))
              ? Number(existingShape.width)
              : 100,
          height: shape.height !== null && shape.height !== undefined && !isNaN(Number(shape.height)) 
            ? Number(shape.height) 
            : existingShape?.height !== null && existingShape?.height !== undefined && !isNaN(Number(existingShape?.height))
              ? Number(existingShape.height)
              : 100,
          zIndex: shape.zIndex !== null && shape.zIndex !== undefined && !isNaN(Number(shape.zIndex)) 
            ? Number(shape.zIndex) 
            : existingShape?.zIndex !== null && existingShape?.zIndex !== undefined && !isNaN(Number(existingShape?.zIndex))
              ? Number(existingShape.zIndex)
              : 0,
          rotation: shape.rotation !== null && shape.rotation !== undefined && !isNaN(Number(shape.rotation)) 
            ? Number(shape.rotation) 
            : existingShape?.rotation !== null && existingShape?.rotation !== undefined && !isNaN(Number(existingShape?.rotation))
              ? Number(existingShape.rotation)
              : 0,
          shapeType: shape.shapeType || existingShape?.shapeType || 'rectangle',
          color: shape.color || existingShape?.color || '#000000'
        };
        
        // Update the shape in our map
        shapeMap.set(shape.uuid, processedShape);
      });
      
      // Convert the map back to an array
      mergedTemplate.shapes = Array.from(shapeMap.values());
    }
    
    // Process texts - similar approach as with shapes
    if (updatedTemplate.texts && updatedTemplate.texts.length > 0) {
      // Create a map of existing texts by UUID for efficient lookup
      const textMap = new Map(
        (mergedTemplate.texts || []).map((text: TextElement) => [text.uuid, text])
      );
      
      // Process each text in the updated template
      updatedTemplate.texts.forEach((text: TextElement) => {
        // Get existing text if it exists and properly cast the type
        const existingText = textMap.get(text.uuid) as TextElement | undefined;
        
        // Normalize numeric values and ensure they are valid
        const processedText = {
          ...(existingText || {}), // Start with existing properties if available
          ...text, // Then apply updated properties
          positionX: text.positionX !== null && text.positionX !== undefined && !isNaN(Number(text.positionX)) 
            ? Number(text.positionX) 
            : existingText?.positionX !== null && existingText?.positionX !== undefined && !isNaN(Number(existingText?.positionX))
              ? Number(existingText.positionX)
              : 0,
          positionY: text.positionY !== null && text.positionY !== undefined && !isNaN(Number(text.positionY)) 
            ? Number(text.positionY) 
            : existingText?.positionY !== null && existingText?.positionY !== undefined && !isNaN(Number(existingText?.positionY))
              ? Number(existingText.positionY)
              : 0,
          fontSize: text.fontSize !== null && text.fontSize !== undefined && !isNaN(Number(text.fontSize)) 
            ? Number(text.fontSize) 
            : existingText?.fontSize !== null && existingText?.fontSize !== undefined && !isNaN(Number(existingText?.fontSize))
              ? Number(existingText.fontSize)
              : 16,
          zIndex: text.zIndex !== null && text.zIndex !== undefined && !isNaN(Number(text.zIndex)) 
            ? Number(text.zIndex) 
            : existingText?.zIndex !== null && existingText?.zIndex !== undefined && !isNaN(Number(existingText?.zIndex))
              ? Number(existingText.zIndex)
              : 0,
          rotation: text.rotation !== null && text.rotation !== undefined && !isNaN(Number(text.rotation)) 
            ? Number(text.rotation) 
            : existingText?.rotation !== null && existingText?.rotation !== undefined && !isNaN(Number(existingText?.rotation))
              ? Number(existingText.rotation)
              : 0,
          text: text.text || existingText?.text || '',
          font: text.font || existingText?.font || 'Arial',
          color: text.color || existingText?.color || '#000000'
        };
        
        // Update the text in our map
        textMap.set(text.uuid, processedText);
      });
      
      // Convert the map back to an array
      mergedTemplate.texts = Array.from(textMap.values());
    }
    
    // Process images - similar approach as with shapes and texts
    if (updatedTemplate.images && updatedTemplate.images.length > 0) {
      // Create a map of existing images by UUID for efficient lookup
      const imageMap = new Map(
        (mergedTemplate.images || []).map((image: ImageAsset) => [image.uuid, image])
      );
      
      // Process each image in the updated template
      updatedTemplate.images.forEach((image: ImageAsset) => {
        // Get existing image if it exists and properly cast the type
        const existingImage = imageMap.get(image.uuid) as ImageAsset | undefined;
        
        // Normalize numeric values and ensure they are valid
        const processedImage = {
          ...(existingImage || {}), // Start with existing properties if available
          ...image, // Then apply updated properties
          positionX: image.positionX !== null && image.positionX !== undefined && !isNaN(Number(image.positionX)) 
            ? Number(image.positionX) 
            : existingImage?.positionX !== null && existingImage?.positionX !== undefined && !isNaN(Number(existingImage?.positionX))
              ? Number(existingImage.positionX)
              : 0,
          positionY: image.positionY !== null && image.positionY !== undefined && !isNaN(Number(image.positionY)) 
            ? Number(image.positionY) 
            : existingImage?.positionY !== null && existingImage?.positionY !== undefined && !isNaN(Number(existingImage?.positionY))
              ? Number(existingImage.positionY)
              : 0,
          width: image.width !== null && image.width !== undefined && !isNaN(Number(image.width)) 
            ? Number(image.width) 
            : existingImage?.width !== null && existingImage?.width !== undefined && !isNaN(Number(existingImage?.width))
              ? Number(existingImage.width)
              : 100,
          height: image.height !== null && image.height !== undefined && !isNaN(Number(image.height)) 
            ? Number(image.height) 
            : existingImage?.height !== null && existingImage?.height !== undefined && !isNaN(Number(existingImage?.height))
              ? Number(existingImage.height)
              : 100,
          zIndex: image.zIndex !== null && image.zIndex !== undefined && !isNaN(Number(image.zIndex)) 
            ? Number(image.zIndex) 
            : existingImage?.zIndex !== null && existingImage?.zIndex !== undefined && !isNaN(Number(existingImage?.zIndex))
              ? Number(existingImage.zIndex)
              : 0,
          rotation: image.rotation !== null && image.rotation !== undefined && !isNaN(Number(image.rotation)) 
            ? Number(image.rotation) 
            : existingImage?.rotation !== null && existingImage?.rotation !== undefined && !isNaN(Number(existingImage?.rotation))
              ? Number(existingImage.rotation)
              : 0,
          image: image.image || existingImage?.image || ''
        };
        
        // Update the image in our map
        imageMap.set(image.uuid, processedImage);
      });
      
      // Convert the map back to an array
      mergedTemplate.images = Array.from(imageMap.values());
    }
    
    // Preserve background image from updated template if it exists
    if (updatedTemplate.backgroundImage) {
      mergedTemplate.backgroundImage = updatedTemplate.backgroundImage;
    }
    
    // Update the template state and history
    setTemplate(mergedTemplate);
    addElementToHistory(mergedTemplate);
  }, [addElementToHistory, template]);

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
          if (['positionX', 'positionY', 'width', 'height', 'zIndex', 'rotation', 'fontSize', 'opacity'].includes(key)) {
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
        
        // Ensure opacity is always included
        if ('opacity' in element) {
          processedElement.opacity = Number((element as any).opacity);
        } else {
          processedElement.opacity = 1.0;
        }
        
        console.log('Updating element with properties:', processedElement);
        
        // Send the processed element directly
        await updateElementInTemplate(
          templateId,
          element.uuid,
          elementType,
          processedElement
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
      // Calculate center of canvas for default position if not specified
      const templateSize = template.size.split('x').map(Number);
      const centerX = templateSize[0] / 2;
      const centerY = templateSize[1] / 2;
      
      // Store a deep clone of the current template state
      const currentTemplate = JSON.parse(JSON.stringify(template));
      
      // Variable to hold the updated template after adding the element
      let updatedTemplate;
      
      // Add element based on type
      switch (elementType) {
        case 'text':
          // Default text properties
          const text = data?.text || 'New Text';
          const font = data?.font || 'Arial';
          const fontSize = data?.fontSize || 100;
          const color = data?.color || '#000000';
          
          updatedTemplate = await createTextElement(
            uuid,
            text,
            font,
            fontSize,
            color,
            data?.positionX || 500,
            data?.positionY || 500
          );
          
          // Immediately save the element properties
          if (updatedTemplate.texts && updatedTemplate.texts.length > 0) {
            const newText = updatedTemplate.texts[updatedTemplate.texts.length - 1];
            const processedText = processElementForSaving(newText, 'text');
            await updateElementInTemplate(uuid, newText.uuid, 'text', processedText);
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
            data?.positionX || 500,
            data?.positionY || 500,
            data?.width || 200,
            data?.height || 200,
            -1 // zIndex - set to -1 to place behind other elements
          );
          
          // Immediately save the element properties
          if (updatedTemplate.images && updatedTemplate.images.length > 0) {
            const newImage = updatedTemplate.images[updatedTemplate.images.length - 1];
            const processedImage = processElementForSaving(newImage, 'image');
            await updateElementInTemplate(uuid, newImage.uuid, 'image', processedImage);
          }
          break;
        
        case 'shape':
          // Default shape properties
          // Use the shapeType from data, or default to 'rectangle' if not provided
          const shapeType = data?.shapeType || 'rectangle';
          console.log('Creating shape element with type:', shapeType);
          console.log('Full shape data received:', data);
          
          // Ensure position values are valid numbers
          const shapePositionX = data?.positionX !== null && 
                                  data?.positionX !== undefined && 
                                  !isNaN(Number(data?.positionX)) 
                                ? Number(data?.positionX) 
                                : centerX;
          
          const shapePositionY = data?.positionY !== null && 
                                  data?.positionY !== undefined && 
                                  !isNaN(Number(data?.positionY)) 
                                ? Number(data?.positionY) 
                                : centerY;
          
          console.log(`Using validated position: (${shapePositionX}, ${shapePositionY}) for new shape`);
          
          try {
            updatedTemplate = await createShapeElement(
              uuid,
              shapeType,  // Use the provided shapeType
              data?.color || '#000000',
              shapePositionX || 500, // Use validated position X or 500
              shapePositionY || 500, // Use validated position Y or 500
              data?.width || 100,
              data?.height || 100,
              data?.zIndex || 0,
              data?.rotation || 0
            );
            
            // Immediately save the element properties
            if (updatedTemplate.shapes && updatedTemplate.shapes.length > 0) {
              const newShape = updatedTemplate.shapes[updatedTemplate.shapes.length - 1];
              // Ensure position values are explicitly set in the processed shape
              const processedShape = {
                ...processElementForSaving(newShape, 'shape'),
                positionX: shapePositionX,
                positionY: shapePositionY,
                width: data?.width || 100,
                height: data?.height || 100,
                zIndex: data?.zIndex || 0,
                rotation: data?.rotation || 0
              };
              await updateElementInTemplate(uuid, newShape.uuid, 'shape', processedShape);
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
      
      // Now we need to merge the new element with the current template state
      // This ensures we don't lose any existing element properties
      
      // Create a fresh template that starts with our current state
      const freshTemplate = JSON.parse(JSON.stringify(currentTemplate));
      
      // Merge in the new element based on its type
      if (elementType === 'text' && updatedTemplate.texts) {
        const newText = updatedTemplate.texts[updatedTemplate.texts.length - 1];
        // Ensure the new text has all properties properly converted to numbers
        if (newText) {
          const processedNewText = processElementForSaving(newText, 'text');
          // Add the new text to our existing texts array
          freshTemplate.texts = [...(freshTemplate.texts || []), processedNewText];
        }
      } else if (elementType === 'image' && updatedTemplate.images) {
        const newImage = updatedTemplate.images[updatedTemplate.images.length - 1];
        if (newImage) {
          const processedNewImage = processElementForSaving(newImage, 'image');
          freshTemplate.images = [...(freshTemplate.images || []), processedNewImage];
        }
      } else if (elementType === 'shape' && updatedTemplate.shapes) {
        const newShape = updatedTemplate.shapes[updatedTemplate.shapes.length - 1];
        if (newShape) {
          const processedNewShape = processElementForSaving(newShape, 'shape');
          freshTemplate.shapes = [...(freshTemplate.shapes || []), processedNewShape];
        }
      }
      
      // Preserve the background image
      if (updatedTemplate.backgroundImage) {
        freshTemplate.backgroundImage = updatedTemplate.backgroundImage;
      }
      
      // Update the template in state
      console.log('Updated template after adding element:', freshTemplate);
      
      // Set the processed template
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
      // Store a deep clone of the current template state
      const currentTemplate = JSON.parse(JSON.stringify(template));
      
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
      
      // Call the backend API to delete the element
      const serverUpdatedTemplate = await deleteElementFromTemplate(
        uuid,
        selectedElement.uuid,
        elementType
      );
      
      // Create a fresh template based on our current state
      const freshTemplate = JSON.parse(JSON.stringify(currentTemplate));
      
      // Remove the deleted element from the appropriate array
      if (elementType === 'image' && freshTemplate.images) {
        freshTemplate.images = freshTemplate.images.filter(
          (img: ImageAsset) => img.uuid !== selectedElement.uuid
        );
      } else if (elementType === 'text' && freshTemplate.texts) {
        freshTemplate.texts = freshTemplate.texts.filter(
          (txt: TextElement) => txt.uuid !== selectedElement.uuid
        );
      } else if (elementType === 'shape' && freshTemplate.shapes) {
        freshTemplate.shapes = freshTemplate.shapes.filter(
          (shape: ShapeElement) => shape.uuid !== selectedElement.uuid
        );
      }
      
      // Preserve the background image from server response
      if (serverUpdatedTemplate.backgroundImage) {
        freshTemplate.backgroundImage = serverUpdatedTemplate.backgroundImage;
      }
      
      // Update the template state
      setTemplate(freshTemplate);
      setSelectedElement(null);
      addElementToHistory(freshTemplate);
      message.success(`${elementType} element deleted`);
    } catch (error: any) {
      console.error('Error deleting element:', error);
      message.error(`Failed to delete element: ${error.message || 'Unknown error'}`);
    }
  };

  // Function to save the canvas as an image and update the post
  const handleSaveToPost = async () => {
    // Check if we're coming from a post or post media
    const sourceType = queryParams.get('source');
    const postId = queryParams.get('postId');
    const mediaId = queryParams.get('mediaId');
    
    // Handle both cases: coming from post or from post media
    const isFromPost = sourceType === 'post' && postId;
    const isFromPostMedia = sourceType === 'postMedia' && postId && mediaId;
    
    if (!uuid || !(isFromPost || isFromPostMedia)) return;
    
    try {
      setIsSavingToPost(true);
      
      // First, save the template to ensure all changes are persisted
      await handleSave();
      
      // Get the token from cookies
      const token = Cookies.get('token');
      
      console.log('Preparing to capture canvas and send to server...');
      console.log('Template UUID:', uuid);
      console.log('Post ID:', postId);
      if (isFromPostMedia) {
        console.log('Media ID:', mediaId);
      }
      
      // Skip updating with the template UUID if it's already set to this template
      let shouldUpdateTemplate = true;
      
      try {
        if (isFromPostMedia && mediaId) {
          // Check if the media already has this template
          const mediaResponse = await fetch(`${baseURL}post-media/${mediaId}/`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
          });
          
          if (mediaResponse.ok) {
            const mediaData = await mediaResponse.json();
            if (mediaData.template === uuid) {
              console.log(`Post media ${mediaId} already has template ${uuid}, skipping update`);
              shouldUpdateTemplate = false;
            }
          }
        } else if (isFromPost) {
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
              shouldUpdateTemplate = false;
            }
          }
        }
      } catch (error) {
        console.error('Error checking template:', error);
      }
      
      // Only update the template UUID if needed
      if (shouldUpdateTemplate) {
        try {
          const formData = new URLSearchParams();
          formData.append('template_uuid', uuid);
          
          if (isFromPostMedia && mediaId) {
            // Send the request to update the post media with the template UUID
            await fetch(`${baseURL}post-media/${mediaId}/update-template/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${token}`,
              },
              body: formData,
              credentials: 'include',
            });
            
            console.log(`Post media ${mediaId} updated with template ${uuid}`);
          } else if (isFromPost) {
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
          }
        } catch (error) {
          console.error('Error updating template UUID:', error);
        }
      }
      
      // CAPTURE THE CANVAS AS PNG IMAGE WITHOUT BLACK BORDERS
      if (!stageRef.current) {
        throw new Error('Canvas stage reference is not available');
      }
      
      console.log('Capturing canvas as clean image...');
      const stage = stageRef.current;
      
      // Parse the template size
      const templateSize = template?.size ? template.size.split('x').map(Number) : [1080, 1080];
      const canvasWidth = templateSize[0] || 1080;
      const canvasHeight = templateSize[1] || 1080;
      
      // Remove transformer temporarily if it exists to avoid including it in the capture
      const transformer = stage.findOne('Transformer');
      if (transformer) {
        transformer.visible(false);
        transformer.getLayer()?.batchDraw();
      }
      
      // We'll create a new temporary in-memory Konva stage with exact template dimensions
      // This ensures we get just the contents without any stage padding/positioning
      const tempStage = new Konva.Stage({
        container: document.createElement('div'), // This won't be added to the DOM
        width: canvasWidth,
        height: canvasHeight
      });
      
      // Create a new layer for our content
      const tempLayer = new Konva.Layer();
      tempStage.add(tempLayer);
      
      // First, add the background image or color
      if (template?.backgroundImage && template.backgroundImage !== 'no_image.jpg') {
        // If there's a background image, we need to clone it
        const bgImage = stage.findOne('.background-image') || 
                       stage.findOne('Image');  // fallback to first image
        
        if (bgImage) {
          // Clone the background image
          const clonedBg = bgImage.clone({
            x: 0,
            y: 0,
            width: canvasWidth,
            height: canvasHeight,
            draggable: false
          });
          tempLayer.add(clonedBg);
        }
      } else {
        // Add a white background if no background image
        const bg = new Konva.Rect({
          x: 0,
          y: 0,
          width: canvasWidth,
          height: canvasHeight,
          fill: 'white'
        });
        tempLayer.add(bg);
      }
      
      // Next, we'll manually clone all elements from the original stage
      // Sort elements by z-index and clone them to our temp stage
      const allElements = [
        ...((template?.shapes || []).map(shape => ({ element: shape, type: 'shape', zIndex: shape.zIndex || 0 }))),
        ...((template?.texts || []).map(text => ({ element: text, type: 'text', zIndex: text.zIndex || 0 }))),
        ...((template?.images || []).map(image => ({ element: image, type: 'image', zIndex: image.zIndex || 0 })))
      ].sort((a, b) => a.zIndex - b.zIndex);
      
      // For each element in the sorted list, find its Konva node and clone it
      allElements.forEach(item => {
        const node = stage.findOne(`.${item.element.uuid}`);
        if (node) {
          const clone = node.clone();
          tempLayer.add(clone);
        }
      });
      
      // Draw the temporary stage
      tempStage.draw();
      
      // Export the temp stage to PNG
      const dataURL = tempStage.toDataURL({
        pixelRatio: 2,  // Higher quality
        mimeType: 'image/png'
      });
      
      // Generate a smaller thumbnail for the template
      const maxThumbnailSize = 300;
      const scale = Math.min(maxThumbnailSize / canvasWidth, maxThumbnailSize / canvasHeight);
      const thumbnailWidth = Math.round(canvasWidth * scale);
      const thumbnailHeight = Math.round(canvasHeight * scale);
      
      const thumbnailDataURL = tempStage.toDataURL({
        pixelRatio: 1,
        mimeType: 'image/png',
        width: canvasWidth,
        height: canvasHeight,
        quality: 0.8
      });
      
      console.log(`Generated thumbnail with dimensions: ${thumbnailWidth}x${thumbnailHeight}`);
      
      // Update the template with the thumbnail
      await updateTemplate(uuid, { thumbnail: thumbnailDataURL });
      
      // Clean up
      tempStage.destroy();
      
      // Restore transformer visibility
      if (transformer) {
        transformer.visible(true);
        transformer.getLayer()?.batchDraw();
      }
      
      console.log('Canvas captured successfully without black borders');
      
      // Convert data URL to Blob
      const binaryString = atob(dataURL.split(',')[1]);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'image/png' });
      
      // Create a FormData object
      const formData = new FormData();
      formData.append('template_uuid', uuid);
      formData.append('post_id', postId);
      
      if (isFromPostMedia && mediaId) {
        // If coming from post media, update the existing media instead of creating a new one
        formData.append('media_id', mediaId);
        formData.append('operation', 'update_post_media');
      } else {
        // If coming from post directly, update the post image
        formData.append('operation', 'update_post_image');
      }
      
      formData.append('image', blob, 'canvas_capture.png');
      
      // Send the form data to the server
      const response = await fetch(`${baseURL}designs/template-to-post/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('Server response:', responseData);
      
      if (responseData && responseData.success) {
        message.success(t('save_to_post_success'));
        
        // Check if we came from a post query details page
        const postQueryId = queryParams.get('postQueryId');
        
        // Get the new image URL from the response
        const newImageUrl = responseData.picture_url || responseData.media_url;
        const oldImageUrl = responseData.old_picture_url || responseData.old_media_url;
        
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
        throw new Error(responseData.message || 'Failed to update post image');
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

  // Function to copy the current template
  const handleCopyTemplate = async () => {
    if (!template || !uuid) return;
    
    try {
      setIsSaving(true);
      
      // Create a new name for the copied template
      const newName = `Copy of ${templateName}`;
      
      // Get current user ID from Redux store
      const userId = user?.profile?.user?.id;
      
      if (!userId) {
        message.error('You must be logged in to copy a template.');
        return;
      }
      
      // Copy the template with all its elements
      const newTemplate = await copyTemplate(uuid, newName, userId);
      
      message.success('Template copied successfully!');
      
      // Navigate to the new template in the editor
      navigate(`/design/editor/${newTemplate.uuid}`);
    } catch (error) {
      console.error('Error copying template:', error);
      message.error('Failed to copy template. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Function to download the template as an image
  const handleDownloadImage = async () => {
    if (!stageRef.current) {
      message.error('Canvas not ready. Please try again.');
      return;
    }

    try {
      setIsDownloading(true);
      console.log('Starting download process');
      
      // Get the Konva stage node
      const stage = stageRef.current.getStage();
      if (!stage) {
        console.error('Stage reference is invalid');
        message.error('Could not access canvas. Please try again.');
        return;
      }
      
      // Get canvas dimensions from template
      const [width, height] = template?.size.split('x').map(Number) || [1080, 1080];
      console.log(`Using dimensions: ${width}x${height}`);
      
      // Convert stage directly to data URL
      const dataURL = stage.toDataURL({
        pixelRatio: 2, // Higher quality
        mimeType: 'image/png',
        quality: 1,
        width: width,
        height: height
      });
      
      console.log(`Generated data URL of length: ${dataURL.length}`);
      
      if (!dataURL || dataURL.length < 1000) {
        console.error('Generated image is too small or empty');
        message.error('Failed to generate image. Please try again.');
        return;
      }
      
      // Create download link
      const link = document.createElement('a');
      const fileName = `${templateName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.png`;
      
      link.download = fileName;
      link.href = dataURL;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Download triggered successfully');
      message.success('Template downloaded successfully');
    } catch (error) {
      console.error('Error downloading template as image:', error);
      message.error('Failed to download template as image');
    } finally {
      setIsDownloading(false);
    }
  };

  // Add this function to handle element order changes
  const handleElementsOrderChange = useCallback(() => {
    if (!template || !uuid) return;
    
    // Fetch the latest template data to refresh the canvas
    fetchTemplateWithElements(uuid)
      .then((updatedTemplate) => {
        if (updatedTemplate) {
          setTemplate(updatedTemplate);
        }
      })
      .catch((error) => {
        console.error('Error refreshing template:', error);
        message.error('Failed to refresh the canvas');
      });
  }, [template, uuid]);

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
          <Tooltip title="Download Template">
            <Button 
              icon={<DownloadOutlined />}
              loading={isDownloading}
              onClick={handleDownloadImage}
              className="header-button"
            />
          </Tooltip>
          <Tooltip title="Copy Template">
            <Button 
              icon={<CopyOutlined />}
              loading={isSaving}
              onClick={handleCopyTemplate}
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
          
          {/* Show different save buttons based on source */}
          {sourceType === 'post' && postId && (
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
          
          {sourceType === 'postMedia' && postId && mediaId && (
            <Button 
              type="primary" 
              icon={<CloudUploadOutlined />} 
              loading={isSavingToPost}
              onClick={handleSaveToPost}
              className="header-button save-to-post-button"
            >
              Save to Post Media
            </Button>
          )}
        </div>
      </Header>
      
      <Layout>
        <Sider width={250} className="editor-sider left-sider">
          <ElementsPanel 
            onAddElement={handleAddElement}
            template={template}
            selectedElement={selectedElement}
            onSelectElement={handleSelectElement}
            onElementsOrderChange={handleElementsOrderChange}
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