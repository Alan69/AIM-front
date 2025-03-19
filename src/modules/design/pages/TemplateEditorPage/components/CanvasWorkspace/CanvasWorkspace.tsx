import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Image as KonvaImage, Star, Group, Transformer } from 'react-konva';
import { Button, Tooltip, Slider } from 'antd';
import { ZoomInOutlined, ZoomOutOutlined, UndoOutlined, RedoOutlined } from '@ant-design/icons';
import { Template, DesignElement, ElementType, ImageAsset, TextElement, ShapeElement } from '../../../../types';
import { v4 as uuidv4 } from 'uuid';
import { 
  createImageAsset, 
  createTextElement, 
  createShapeElement, 
  updateElementInTemplate 
} from '../../../../services/designService';
import './CanvasWorkspace.scss';
import Konva from 'konva';

// Define the KonvaEvent type
type KonvaEvent = Konva.KonvaEventObject<Event>;

interface CanvasWorkspaceProps {
  template: Template;
  selectedElement: DesignElement | null;
  onSelectElement: (element: DesignElement | null) => void;
  onUpdateElements: (updatedTemplate: Template) => void;
  onStageRef?: (ref: any) => void; // Optional callback to get the stage ref
}

const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  template,
  selectedElement,
  onSelectElement,
  onUpdateElements,
  onStageRef,
}) => {
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const [scale, setScale] = useState<number>(1);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [lastBackgroundImageUrl, setLastBackgroundImageUrl] = useState<string | null>(null);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);

  // Parse template size
  const templateSize = template.size ? template.size.split('x').map(Number) : [1080, 1080];
  const canvasWidth = templateSize[0] || 1080;  // Add fallback values
  const canvasHeight = templateSize[1] || 1080; // Add fallback values
  
  // Extract the template ID for API calls
  const templateId = template.uuid;

  // Pass the stageRef to the parent component if onStageRef is provided
  useEffect(() => {
    if (onStageRef && stageRef.current) {
      onStageRef(stageRef.current);
    }
  }, [onStageRef, stageRef.current]);

  // Load background image if available
  useEffect(() => {
    const preloadBackgroundImage = async () => {
      if (template.backgroundImage && template.backgroundImage !== 'no_image.jpg') {
        console.log('Loading background image:', template.backgroundImage);
        
        // Check if we already have this image loaded in our ref
        if (backgroundImageRef.current && lastBackgroundImageUrl === template.backgroundImage) {
          console.log('Using cached background image');
          setBackgroundImage(backgroundImageRef.current);
          return;
        }
        
        try {
          const img = new window.Image();
          img.crossOrigin = 'Anonymous';
          
          // Create a promise to wait for the image to load
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              console.log('Background image loaded successfully');
              setBackgroundImage(img);
              backgroundImageRef.current = img; // Cache the loaded image
              if (template.backgroundImage) {
                setLastBackgroundImageUrl(template.backgroundImage);
              }
              resolve();
            };
            
            img.onerror = async (e) => {
              console.error('Error loading background image:', e);
              
              // Try multiple URL formats
              const urlsToTry: string[] = [];
              
              // If the image fails to load, try to load it from different URL formats
              if (template.backgroundImage) {
                // Original URL
                urlsToTry.push(template.backgroundImage);
                
                // Extract filename
                const filename = template.backgroundImage.split('/').pop();
                
                if (filename) {
                  // Use environment-aware URLs
                  const baseUrl = 'https://api.aimmagic.com'
                  
                  // Try with media prefix
                  urlsToTry.push(`${baseUrl}/media/${filename}`);
                  
                  // Try with direct media path
                  if (template.backgroundImage.includes('/media/')) {
                    const mediaPath = template.backgroundImage.split('/media/')[1];
                    if (mediaPath) {
                      urlsToTry.push(`${baseUrl}/media/${mediaPath}`);
                    }
                  }
                  
                  // Try with relative path
                  urlsToTry.push(`/media/${filename}`);
                }
              }
              
              // For development fallbacks, you can still include:
              // if (process.env.NODE_ENV !== 'production') {
              //   urlsToTry.push(`http://127.0.0.1:8000/media/${filename}`);
              // }
              
              console.log('Trying alternative URLs:', urlsToTry);
              
              // Try each URL in sequence
              for (let i = 1; i < urlsToTry.length; i++) {
                try {
                  const altImg = new window.Image();
                  altImg.crossOrigin = 'Anonymous';
                  
                  const success = await new Promise<boolean>((resolveAlt) => {
                    altImg.onload = () => {
                      console.log(`Successfully loaded from alternative URL: ${urlsToTry[i]}`);
                      setBackgroundImage(altImg);
                      backgroundImageRef.current = altImg;
                      if (template.backgroundImage) {
                        setLastBackgroundImageUrl(template.backgroundImage);
                      }
                      resolveAlt(true);
                    };
                    
                    altImg.onerror = () => {
                      console.log(`Failed to load from alternative URL: ${urlsToTry[i]}`);
                      resolveAlt(false);
                    };
                    
                    altImg.src = urlsToTry[i];
                  });
                  
                  if (success) {
                    resolve();
                    return;
                  }
                } catch (altError) {
                  console.error(`Error trying alternative URL ${urlsToTry[i]}:`, altError);
                }
              }
              
              // If all alternatives fail, reject
              console.error('All alternative URLs failed to load');
              setBackgroundImage(null);
              backgroundImageRef.current = null;
              reject(e);
            };
            
            if (template.backgroundImage) {
              img.src = template.backgroundImage;
            } else {
              reject(new Error('Background image URL is undefined'));
            }
          });
        } catch (error) {
          console.error('Failed to load background image:', error);
          setBackgroundImage(null);
          backgroundImageRef.current = null;
        }
      } else {
        setBackgroundImage(null);
        backgroundImageRef.current = null;
      }
    };

    preloadBackgroundImage();
  }, [template.backgroundImage]);

  // Store the current background image URL to detect changes
  useEffect(() => {
    if (template.backgroundImage && template.backgroundImage !== 'no_image.jpg') {
      setLastBackgroundImageUrl(template.backgroundImage);
    } else {
      setLastBackgroundImageUrl(null);
    }
  }, [template.backgroundImage]);

  // Log when template changes to help with debugging
  useEffect(() => {
    // Force re-render when template changes
    if (stageRef.current) {
      stageRef.current.batchDraw();
    }
  }, [template]);

  // Calculate container size on mount and on window resize
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.querySelector('.canvas-container');
      if (container) {
        const { width, height } = container.getBoundingClientRect();
        setStageSize({ width: Math.max(width, 100), height: Math.max(height, 100) });
        
        // Auto-scale to fit the canvas
        const scaleX = width / canvasWidth;
        const scaleY = height / canvasHeight;
        const newScale = Math.min(scaleX, scaleY, 1) * 0.9; // 90% to leave some padding, max scale of 1
        setScale(Math.max(newScale, 0.1)); // Ensure minimum scale of 0.1
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, [canvasWidth, canvasHeight]);

  // Update transformer when selected element changes
  useEffect(() => {
    if (selectedElement && transformerRef.current) {
      // Find the node by name (uuid)
      const stage = stageRef.current;
      if (!stage) return;
      
      const node = stage.findOne(`.${selectedElement.uuid}`);
      if (node) {
        // Configure transformer based on element type
        if ('text' in selectedElement) {
          // For text elements, disable all anchors to prevent resizing, only allow movement and rotation
          transformerRef.current.enabledAnchors([]); // Disable all resize anchors
          transformerRef.current.resizeEnabled(false); // Disable resizing completely
          transformerRef.current.rotateEnabled(true); // Keep rotation enabled
          transformerRef.current.keepRatio(true); // Maintain aspect ratio (though resizing is disabled)
          
          // Set padding to give more space around text for easier selection
          transformerRef.current.padding(5);
          
          console.log("Text element selected: Disabled resizing, enabled rotation only");
        } else {
          // For shapes and images, use default anchors
          transformerRef.current.enabledAnchors([
            'top-left', 'top-right', 'bottom-left', 'bottom-right'
          ]);
          transformerRef.current.resizeEnabled(true);
          transformerRef.current.rotateEnabled(true);
          transformerRef.current.keepRatio(false);
          transformerRef.current.padding(0);
        }
        
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer().batchDraw();
      }
    } else if (transformerRef.current) {
      // Clear transformer if no element is selected
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedElement]);
  
  // Ensure images are preloaded before rendering
  useEffect(() => {
    if (template.images && template.images.length > 0) {
      const loadAllImages = async () => {
        const newImages: Record<string, HTMLImageElement> = {};
        const promises = template.images?.map(async (image) => {
          return new Promise<void>((resolve) => {
            const img = new window.Image();
            img.src = image.image;
            img.onload = () => {
              newImages[image.uuid] = img;
              resolve();
            };
            img.onerror = () => {
              console.error(`Failed to load image: ${image.image}`);
              resolve();
            };
          });
        }) || [];
        
        await Promise.all(promises);
        setImages(newImages);
        setIsLoaded(true);
      };
      
      loadAllImages();
    } else {
      setIsLoaded(true);
    }
  }, [template.images]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.3));
  };

  const handleScaleChange = (value: number) => {
    setScale(value);
  };

  const handleElementClick = (element: DesignElement) => {
    // Create a deep copy of the element to avoid reference issues
    const processedElement = { ...element };
    
    // Ensure all numeric values are properly converted to numbers
    if ('positionX' in processedElement) processedElement.positionX = Number(processedElement.positionX || 0);
    if ('positionY' in processedElement) processedElement.positionY = Number(processedElement.positionY || 0);
    if ('width' in processedElement) processedElement.width = Number(processedElement.width || 100);
    if ('height' in processedElement) processedElement.height = Number(processedElement.height || 100);
    if ('zIndex' in processedElement) processedElement.zIndex = Number(processedElement.zIndex || 0);
    if ('rotation' in processedElement) processedElement.rotation = Number(processedElement.rotation || 0);
    if ('fontSize' in processedElement) processedElement.fontSize = Number(processedElement.fontSize || 16);
    
    // Update the selected element
    onSelectElement(processedElement);
  };

  const handleStageClick = (e: any) => {
    // If clicked on the stage background, deselect
    if (e.target === e.currentTarget) {
      onSelectElement(null);
    }
  };

  const handleTransformEnd = (element: DesignElement) => {
    // Create a deep copy of the element to avoid reference issues
    const updatedElement = { ...element };
    
    // Get the element type
    const elementType = 
      'text' in element ? 'text' : 
      'image' in element ? 'image' : 
      'shapeType' in element ? 'shape' : null;
    
    if (elementType) {
      try {
        // Create a processed element for saving to backend
        const processedElement: any = { ...updatedElement };
        
        // Ensure all numeric values are properly converted to numbers
        if ('positionX' in processedElement) processedElement.positionX = Number(processedElement.positionX);
        if ('positionY' in processedElement) processedElement.positionY = Number(processedElement.positionY);
        if ('width' in processedElement) processedElement.width = Number(processedElement.width);
        if ('height' in processedElement) processedElement.height = Number(processedElement.height);
        if ('zIndex' in processedElement) processedElement.zIndex = Number(processedElement.zIndex);
        if ('rotation' in processedElement) processedElement.rotation = Number(processedElement.rotation);
        
        // Save to backend
        updateElementInTemplate(
          template.uuid,
          updatedElement.uuid,
          elementType,
          JSON.stringify(processedElement)
        );
      } catch (error) {
        console.error('Error saving element after transform:', error);
      }
    }
  };

  // Helper function to ensure background image is preserved in template updates
  const ensureBackgroundImagePreserved = (templateObj: Template): Template => {
    // Always check if we have a cached background image URL
    if (lastBackgroundImageUrl && (!templateObj.backgroundImage || templateObj.backgroundImage === 'no_image.jpg')) {
      console.log('Preserving background image URL:', lastBackgroundImageUrl);
      return {
        ...templateObj,
        backgroundImage: lastBackgroundImageUrl
      };
    }
    
    // If the template has a background image, make sure it's preserved
    if (templateObj.backgroundImage && templateObj.backgroundImage !== 'no_image.jpg') {
      console.log('Template has background image:', templateObj.backgroundImage);
      
      // Update our cached URL
      if (templateObj.backgroundImage !== lastBackgroundImageUrl) {
        setLastBackgroundImageUrl(templateObj.backgroundImage);
      }
    }
    
    return templateObj;
  };

  const updateElement = (updatedElement: DesignElement) => {
    // Determine the element type to know which array to update
    let elementType: 'text' | 'image' | 'shape';
    let clonedElement = { ...updatedElement } as DesignElement; // Create a deep copy with proper typing
    
    if ('text' in updatedElement) {
      elementType = 'text';
    } else if ('image' in updatedElement) {
      elementType = 'image';
    } else if ('shapeType' in updatedElement) {
      elementType = 'shape';
    } else {
      console.error('Unknown element type');
      return;
    }
    
    // Ensure numeric properties are correctly formatted as numbers
    if ('positionX' in clonedElement) {
      clonedElement.positionX = Number(clonedElement.positionX);
      clonedElement.positionY = Number(clonedElement.positionY);
    }
    
    if ('zIndex' in clonedElement) {
      clonedElement.zIndex = Number(clonedElement.zIndex);
    }
    
    if ('rotation' in clonedElement) {
      clonedElement.rotation = Number(clonedElement.rotation);
    }
    
    if ('opacity' in clonedElement) {
      clonedElement.opacity = Number(clonedElement.opacity);
    } else {
      // Ensure opacity is set if it doesn't exist
      (clonedElement as any).opacity = 1.0;
    }
    
    if ('width' in clonedElement) {
      clonedElement.width = Number(clonedElement.width);
      clonedElement.height = Number(clonedElement.height);
    }
    
    if ('fontSize' in clonedElement) {
      // Handle fontSize with special care to ensure it's a valid number
      const rawFontSize = clonedElement.fontSize;
      clonedElement.fontSize = Number(clonedElement.fontSize);
      
      // Make sure it's a valid number and reasonable size
      if (isNaN(clonedElement.fontSize) || clonedElement.fontSize <= 0) {
        clonedElement.fontSize = 50; // Default to 50 if invalid
        console.log(`Fixed invalid fontSize: ${rawFontSize} → 50`);
      }
      
      // Log the fontSize being used
      console.log(`Using fontSize: ${clonedElement.fontSize} for text element ${clonedElement.uuid}`);
    }
    
    // Create a new template with the updated element
    let updatedTemplate = { ...template };
    
    // Update the appropriate array in the template
    if (elementType === 'image' && updatedTemplate.images) {
      updatedTemplate.images = updatedTemplate.images.map((img: ImageAsset) => 
        img.uuid === clonedElement.uuid ? { ...img, ...clonedElement } : img
      );
    } else if (elementType === 'text' && updatedTemplate.texts) {
      updatedTemplate.texts = updatedTemplate.texts.map((txt: TextElement) => 
        txt.uuid === clonedElement.uuid ? { ...txt, ...clonedElement } : txt
      );
    } else if (elementType === 'shape' && updatedTemplate.shapes) {
      updatedTemplate.shapes = updatedTemplate.shapes.map((shape: ShapeElement) => 
        shape.uuid === clonedElement.uuid ? { ...shape, ...clonedElement } : shape
      );
    }
    
    // Ensure background image is preserved
    if (lastBackgroundImageUrl) {
      updatedTemplate.backgroundImage = lastBackgroundImageUrl;
    } else if (backgroundImage) {
      // If we have a background image loaded but no URL cached, use the template's URL
      updatedTemplate.backgroundImage = template.backgroundImage;
    }
    
    // Pass the updated template to the parent component
    onUpdateElements(updatedTemplate);
    
    // Also select the updated element to update the properties panel
    onSelectElement(clonedElement);
  };

  const renderImageElement = (image: ImageAsset) => {
    // Ensure image is loaded in the images dictionary
    const img = images[image.uuid];
    if (!img) {
      console.error(`Image ${image.uuid} not loaded yet`);
      return null;
    }
    
    // Ensure all position and size values are valid numbers
    const x = image.positionX !== null && !isNaN(Number(image.positionX)) ? Number(image.positionX) : 0;
    const y = image.positionY !== null && !isNaN(Number(image.positionY)) ? Number(image.positionY) : 0;
    const width = image.width !== null && !isNaN(Number(image.width)) ? Number(image.width) : 100;
    const height = image.height !== null && !isNaN(Number(image.height)) ? Number(image.height) : 100;
    const rotation = image.rotation !== null && !isNaN(Number(image.rotation)) ? Number(image.rotation) : 0;
    const zIndex = image.zIndex !== null && !isNaN(Number(image.zIndex)) ? Number(image.zIndex) : 0;
    const opacity = image.opacity !== null && !isNaN(Number(image.opacity)) ? Number(image.opacity) : 1.0;
    
    // Create a copy of the image with correct position values
    const imageWithCorrectPosition = {
      ...image,
      positionX: x,
      positionY: y,
      width: width,
      height: height,
      rotation: rotation,
      zIndex: zIndex,
      opacity: opacity
    };

    return (
      <KonvaImage
        key={image.uuid}
        name={image.uuid}
        image={img}
        x={x}
        y={y}
        width={width}
        height={height}
        rotation={rotation}
        zIndex={zIndex}
        opacity={opacity}
        draggable
        onClick={() => handleElementClick(imageWithCorrectPosition)}
        onTap={() => handleElementClick(imageWithCorrectPosition)}
        onDragEnd={(e) => handleElementTransform(e, imageWithCorrectPosition)}
        onTransformEnd={(e) => handleElementTransform(e, imageWithCorrectPosition)}
        className={image.uuid}
      />
    );
  };

  const renderTextElement = (text: TextElement) => {
    // Ensure all position and size values are valid numbers
    const x = text.positionX !== null && !isNaN(Number(text.positionX)) ? Number(text.positionX) : 0;
    const y = text.positionY !== null && !isNaN(Number(text.positionY)) ? Number(text.positionY) : 0;
    
    // Use the exact fontSize as stored in the database without any validation
    // This ensures consistent rendering with what was saved
    const fontSize = Number(text.fontSize);
    
    // Log the fontSize being used for rendering
    console.log(`Rendering text "${text.text}" with exact fontSize: ${fontSize}`);
    
    const rotation = text.rotation !== null && !isNaN(Number(text.rotation)) ? Number(text.rotation) : 0;
    const zIndex = text.zIndex !== null && !isNaN(Number(text.zIndex)) ? Number(text.zIndex) : 0;
    const opacity = text.opacity !== null && !isNaN(Number(text.opacity)) ? Number(text.opacity) : 1.0;
    
    // Create a copy of the text with correct position values
    const textWithCorrectPosition = {
      ...text,
      positionX: x,
      positionY: y,
      fontSize: fontSize,
      rotation: rotation,
      zIndex: zIndex,
      opacity: opacity
    };

    return (
      <Text
        key={text.uuid}
        name={text.uuid}
        x={x}
        y={y}
        text={text.text || ''}
        fontSize={fontSize}
        fontFamily={text.font || 'Arial'}
        fill={text.color || '#000000'}
        rotation={rotation}
        zIndex={zIndex}
        opacity={opacity}
        draggable
        onClick={() => handleElementClick(textWithCorrectPosition)}
        onTap={() => handleElementClick(textWithCorrectPosition)}
        onDragEnd={(e) => handleElementTransform(e, textWithCorrectPosition)}
        onTransformEnd={(e) => handleElementTransform(e, textWithCorrectPosition)}
        className={text.uuid}
      />
    );
  };

  const renderShapeElement = (shape: ShapeElement) => {
    if (!shape) {
      console.error('Attempted to render null or undefined shape');
      return null;
    }
    
    console.log(`Rendering shape ${shape.uuid} with position: (${shape.positionX}, ${shape.positionY})`);
    
    // Force position values to be numbers and don't default to 0 - this is critical
    // Only default to 0 if the value is null, undefined, or NaN after conversion
    const x = shape.positionX !== null && shape.positionX !== undefined ? 
      (isNaN(Number(shape.positionX)) ? 0 : Number(shape.positionX)) : 0;
    
    const y = shape.positionY !== null && shape.positionY !== undefined ? 
      (isNaN(Number(shape.positionY)) ? 0 : Number(shape.positionY)) : 0;
    
    const width = shape.width !== null && shape.width !== undefined ? 
      (isNaN(Number(shape.width)) ? 100 : Number(shape.width)) : 100;
    
    const height = shape.height !== null && shape.height !== undefined ? 
      (isNaN(Number(shape.height)) ? 100 : Number(shape.height)) : 100;
    
    const rotation = shape.rotation !== null && shape.rotation !== undefined ? 
      (isNaN(Number(shape.rotation)) ? 0 : Number(shape.rotation)) : 0;
    
    const zIndex = shape.zIndex !== null && shape.zIndex !== undefined ? 
      (isNaN(Number(shape.zIndex)) ? 0 : Number(shape.zIndex)) : 0;
    
    const opacity = shape.opacity !== null && shape.opacity !== undefined ? 
      (isNaN(Number(shape.opacity)) ? 1.0 : Number(shape.opacity)) : 1.0;
    
    // If shapeType is null or invalid, default to rectangle
    const shapeType = shape.shapeType || 'rectangle';
    
    // Log the processed values for debugging
    console.log(`Processed shape ${shape.uuid} position: (${x}, ${y}), size: ${width}x${height}`);
    
    // Create a copy of the shape with correct position values to ensure it's properly rendered
    const shapeWithCorrectPosition = {
      ...shape,
      positionX: x,
      positionY: y,
      width: width,
      height: height,
      rotation: rotation,
      zIndex: zIndex,
      shapeType: shapeType,
      opacity: opacity
    };
    
    // Instead of using a Group with nested elements at (0,0),
    // directly render shapes at their actual positions
    // This ensures the position data is preserved correctly
    switch (shapeType) {
      case 'rectangle':
        return (
          <Rect
            key={shape.uuid}
            name={shape.uuid}
            x={x}
            y={y}
            width={width}
            height={height}
            fill={shape.color || "#4A90E2"}
            rotation={rotation}
            zIndex={zIndex}
            opacity={opacity}
            draggable
            onClick={() => handleElementClick(shapeWithCorrectPosition)}
            onTap={() => handleElementClick(shapeWithCorrectPosition)}
            onDragEnd={(e) => handleElementTransform(e, shapeWithCorrectPosition)}
            onTransformEnd={(e) => handleElementTransform(e, shapeWithCorrectPosition)}
            className={shape.uuid}
          />
        );
      
      case 'circle':
        return (
          <Circle
            key={shape.uuid}
            name={shape.uuid}
            x={x}  // Use the position directly - handleElementTransform will handle the adjustment
            y={y}  // Use the position directly - handleElementTransform will handle the adjustment
            radius={width / 2}  // Use width for consistent sizing
            fill={shape.color || "#7ED321"}
            rotation={rotation}
            zIndex={zIndex}
            opacity={opacity}
            draggable
            onClick={() => handleElementClick(shapeWithCorrectPosition)}
            onTap={() => handleElementClick(shapeWithCorrectPosition)}
            onDragEnd={(e) => handleElementTransform(e, shapeWithCorrectPosition)}
            onTransformEnd={(e) => handleElementTransform(e, shapeWithCorrectPosition)}
            className={shape.uuid}
          />
        );
      
      case 'triangle':
        // For a triangle, we need to define the points
        const points = [
          width / 2, 0,       // top point
          0, height,          // bottom left
          width, height       // bottom right
        ];
        
        return (
          <Line
            key={shape.uuid}
            name={shape.uuid}
            x={x}
            y={y}
            points={points}
            closed={true}
            fill={shape.color || "#F5A623"}
            rotation={rotation}
            zIndex={zIndex}
            opacity={opacity}
            draggable
            onClick={() => handleElementClick(shapeWithCorrectPosition)}
            onTap={() => handleElementClick(shapeWithCorrectPosition)}
            onDragEnd={(e) => handleElementTransform(e, shapeWithCorrectPosition)}
            onTransformEnd={(e) => handleElementTransform(e, shapeWithCorrectPosition)}
            className={shape.uuid}
          />
        );
      
      case 'line':
        // For a line, we create a horizontal line
        const linePoints = [
          0, height / 2,      // left point
          width, height / 2   // right point
        ];
        
        return (
          <Line
            key={shape.uuid}
            name={shape.uuid}
            x={x}
            y={y}
            points={linePoints}
            stroke={shape.color || "#9013FE"}
            strokeWidth={4}
            rotation={rotation}
            zIndex={zIndex}
            opacity={opacity}
            draggable
            onClick={() => handleElementClick(shapeWithCorrectPosition)}
            onTap={() => handleElementClick(shapeWithCorrectPosition)}
            onDragEnd={(e) => handleElementTransform(e, shapeWithCorrectPosition)}
            onTransformEnd={(e) => handleElementTransform(e, shapeWithCorrectPosition)}
            className={shape.uuid}
          />
        );
      
      case 'star':
        return (
          <Star
            key={shape.uuid}
            name={shape.uuid}
            x={x + width / 2}  // Center the star at its position coordinates
            y={y + height / 2} // Center the star at its position coordinates
            numPoints={5}
            innerRadius={width / 4}
            outerRadius={width / 2}
            fill={shape.color || "#F8E71C"}
            rotation={rotation}
            zIndex={zIndex}
            opacity={opacity}
            draggable
            onClick={() => handleElementClick(shapeWithCorrectPosition)}
            onTap={() => handleElementClick(shapeWithCorrectPosition)}
            onDragEnd={(e) => handleElementTransform(e, shapeWithCorrectPosition)}
            onTransformEnd={(e) => handleElementTransform(e, shapeWithCorrectPosition)}
            className={shape.uuid}
          />
        );
        
      default:
        // Fallback to rectangle
        return (
          <Rect
            key={shape.uuid}
            name={shape.uuid}
            x={x}
            y={y}
            width={width}
            height={height}
            fill={shape.color || "#4A90E2"}
            rotation={rotation}
            zIndex={zIndex}
            opacity={opacity}
            draggable
            onClick={() => handleElementClick(shapeWithCorrectPosition)}
            onTap={() => handleElementClick(shapeWithCorrectPosition)}
            onDragEnd={(e) => handleElementTransform(e, shapeWithCorrectPosition)}
            onTransformEnd={(e) => handleElementTransform(e, shapeWithCorrectPosition)}
            className={shape.uuid}
          />
        );
    }
  };

  const addNewElement = async (elementType: ElementType, data: any = {}) => {
    const templateId = template.uuid;
    
    if (!canvasWidth || !canvasHeight) {
      console.error('Canvas dimensions are not properly defined');
      return;
    }
    
    try {
      // Create a copy of the template to preserve the background image
      const updatedTemplate = { ...template };
      
      // Ensure background image is preserved before any operations
      if (lastBackgroundImageUrl) {
        updatedTemplate.backgroundImage = lastBackgroundImageUrl;
      } else if (backgroundImage) {
        // If we have a background image loaded but no URL cached, use the template's URL
        updatedTemplate.backgroundImage = template.backgroundImage;
      }
      
      switch (elementType) {
        case ElementType.TEXT:
          const fontStyle = data || {};
          const fontSize = fontStyle.fontSize || 100;
          const font = fontStyle.fontFamily || 'Arial';
          const color = fontStyle.color || '#000000';
          
          const textElement = await createTextElement(
            templateId,
            'New Text',
            font,
            fontSize,
            color,
            500,  // Fixed X position at 500
            500   // Fixed Y position at 500
          ) as TextElement;
          
          if (textElement) {
            updatedTemplate.texts = [...(template.texts || []), textElement];
            // Double-check background image is preserved
            if (lastBackgroundImageUrl) {
              updatedTemplate.backgroundImage = lastBackgroundImageUrl;
            }
            
            // Use the helper function to ensure background image is preserved
            const finalTemplate = ensureBackgroundImagePreserved(updatedTemplate);
            
            onUpdateElements(finalTemplate);
            onSelectElement(textElement);
          }
          break;
          
        case ElementType.IMAGE:
          const imageUrl = data?.image || '';
          if (!imageUrl) return;
          
          const imageElement = await createImageAsset(
            templateId,
            imageUrl,
            500,  // Fixed X position at 500
            500,  // Fixed Y position at 500
            200,
            200,
            -1 // zIndex - set to -1 to place behind other elements
          ) as ImageAsset;
          
          if (imageElement) {
            // Preload the image
            const img = new window.Image();
            img.src = imageUrl;
            img.onload = () => {
              setImages(prev => ({ ...prev, [imageElement.uuid]: img }));
              
              // Double-check background image is preserved
              if (lastBackgroundImageUrl) {
                updatedTemplate.backgroundImage = lastBackgroundImageUrl;
              }
              updatedTemplate.images = [...(template.images || []), imageElement];
              
              // Use the helper function to ensure background image is preserved
              const finalTemplate = ensureBackgroundImagePreserved(updatedTemplate);
              
              onUpdateElements(finalTemplate);
              onSelectElement(imageElement);
            };
          }
          break;
          
        case ElementType.SHAPE:
          const shapeType = data?.shapeType || 'rectangle';
          // Use the provided color or a default based on shape type
          let shapeColor;
          switch(shapeType) {
            case 'rectangle':
              shapeColor = data?.color || '#4A90E2';
              break;
            case 'circle':
              shapeColor = data?.color || '#7ED321';
              break;
            case 'triangle':
              shapeColor = data?.color || '#F5A623';
              break;
            case 'line':
              shapeColor = data?.color || '#9013FE';
              break;
            case 'star':
              shapeColor = data?.color || '#F8E71C';
              break;
            default:
              shapeColor = data?.color || '#4A90E2';
          }
          
          // Use fixed position for new shapes
          const posX = 500;
          const posY = 500;
          
          console.log(`Creating shape at position: (${posX}, ${posY})`);
          
          try {
            const shapeElement = await createShapeElement(
              templateId,
              shapeType,
              shapeColor,
              posX,  // Fixed X position at 500
              posY,  // Fixed Y position at 500
              100,      // Width
              100,      // Height
              0,        // Z-Index
              0         // Initial rotation
            ) as ShapeElement;
            
            if (shapeElement) {
              // Double-check background image is preserved
              if (lastBackgroundImageUrl) {
                updatedTemplate.backgroundImage = lastBackgroundImageUrl;
              }
              updatedTemplate.shapes = [...(template.shapes || []), shapeElement];
              
              // Use the helper function to ensure background image is preserved
              const finalTemplate = ensureBackgroundImagePreserved(updatedTemplate);
              
              onUpdateElements(finalTemplate);
              onSelectElement(shapeElement);
              
              // Immediately update the element to ensure all properties are saved
              const processedShape = {
                ...shapeElement,
                positionX: Number(posX),
                positionY: Number(posY),
                width: 100,
                height: 100,
                zIndex: 0,
                rotation: 0
              };
              
              // Save the element properties to ensure they persist
              try {
                await updateElementInTemplate(
                  templateId,
                  shapeElement.uuid,
                  'shape',
                  JSON.stringify(processedShape)
                );
              } catch (error) {
                console.error('Error saving initial shape properties:', error);
              }
            }
          } catch (error) {
            console.error('Error creating shape element:', error);
          }
          break;
      }
    } catch (error) {
      console.error('Error adding new element:', error);
    }
  };

  // Event handler for transform and drag events
  const handleElementTransform = (e: KonvaEvent, element: DesignElement) => {
    if (!element) return;
    
    // Get the node from the event target
    const node = e.target;
    
    // Create a copy of the element to avoid modifying the original directly
    const updatedElement = { ...element };
    
    // Update position, size, and rotation
    if (node) {
      const nodeAttrs = node.attrs;
      
      // For positions, directly use node.x() and node.y() which will be accurate
      if ('positionX' in updatedElement) {
        updatedElement.positionX = node.x();
        updatedElement.positionY = node.y();
      }
      
      // For text elements, preserve the fontSize and prevent resizing
      if ('text' in updatedElement) {
        // Preserve the original fontSize
        if ('fontSize' in updatedElement && 'fontSize' in element) {
          // Keep the original fontSize, don't allow changes
          updatedElement.fontSize = element.fontSize;
          console.log(`Preserving original fontSize: ${updatedElement.fontSize} during text transform`);
        }
        
        // Only update rotation for text elements
        if ('rotation' in updatedElement) {
          updatedElement.rotation = node.rotation();
        }
      } else if ('width' in updatedElement && node.width) {
        // For images and shapes, they have width and height
        updatedElement.width = node.width() * node.scaleX();
        updatedElement.height = node.height() * node.scaleY();
        
        // Reset scale after applying it to the dimensions
        node.scaleX(1);
        node.scaleY(1);
        
        // If rotation is a property of the element, update it
        if ('rotation' in updatedElement) {
          updatedElement.rotation = node.rotation();
        }
      }
      
      // If opacity is a property of the element, ensure it's preserved
      if ('opacity' in updatedElement) {
        // Keep the existing opacity value
        updatedElement.opacity = Number(updatedElement.opacity);
      } else {
        // Ensure opacity exists and has a default value
        (updatedElement as any).opacity = 1.0;
      }
      
      // Handle NaN values
      if ('positionX' in updatedElement && (updatedElement.positionX === null || isNaN(updatedElement.positionX))) 
        updatedElement.positionX = 0;
      if ('positionY' in updatedElement && (updatedElement.positionY === null || isNaN(updatedElement.positionY))) 
        updatedElement.positionY = 0;
      if ('width' in updatedElement && (updatedElement.width === null || isNaN(updatedElement.width))) 
        updatedElement.width = 100;
      if ('height' in updatedElement && (updatedElement.height === null || isNaN(updatedElement.height))) 
        updatedElement.height = 100;
      if ('rotation' in updatedElement && (updatedElement.rotation === null || isNaN(updatedElement.rotation))) 
        updatedElement.rotation = 0;
      if ('opacity' in updatedElement && (updatedElement.opacity === null || isNaN(updatedElement.opacity))) 
        updatedElement.opacity = 1.0;
    }
    
    // Update the element in the template
    updateElement(updatedElement);
    
    // Create a copy of the template with the updated element
    const updatedTemplate = { ...template };
    
    // Ensure background image is preserved
    if (lastBackgroundImageUrl) {
      updatedTemplate.backgroundImage = lastBackgroundImageUrl;
    } else if (backgroundImage) {
      // If we have a background image loaded but no URL cached, use the template's URL
      updatedTemplate.backgroundImage = template.backgroundImage;
    }
    
    // Update the appropriate array in the template
    if ('text' in updatedElement) {
      updatedTemplate.texts = template.texts?.map(txt => 
        txt.uuid === updatedElement.uuid ? updatedElement as TextElement : txt
      ) || [];
    } else if ('image' in updatedElement) {
      updatedTemplate.images = template.images?.map(img => 
        img.uuid === updatedElement.uuid ? updatedElement as ImageAsset : img
      ) || [];
    } else if ('shapeType' in updatedElement) {
      updatedTemplate.shapes = template.shapes?.map(shape => 
        shape.uuid === updatedElement.uuid ? updatedElement as ShapeElement : shape
      ) || [];
    }
    
    // Use the helper function to ensure background image is preserved
    const finalTemplate = ensureBackgroundImagePreserved(updatedTemplate);
    
    // Update the template
    onUpdateElements(finalTemplate);
    
    // Also update the selected element to refresh the properties panel
    onSelectElement(updatedElement);
  };

  return (
    <div className="canvas-workspace">
      <div className="canvas-tools">
        <div className="zoom-controls">
          <Tooltip title="Zoom Out">
            <Button 
              icon={<ZoomOutOutlined />} 
              onClick={handleZoomOut}
              disabled={scale <= 0.3}
            />
          </Tooltip>
          
          <Slider 
            min={0.3} 
            max={3} 
            step={0.1} 
            value={scale} 
            onChange={handleScaleChange} 
            className="zoom-slider"
          />
          
          <Tooltip title="Zoom In">
            <Button 
              icon={<ZoomInOutlined />} 
              onClick={handleZoomIn}
              disabled={scale >= 3}
            />
          </Tooltip>
        </div>
      </div>
      
      <div className="canvas-container">
        {stageSize.width > 0 && stageSize.height > 0 && (
          <Stage
            ref={stageRef}
            width={stageSize.width}
            height={stageSize.height}
            scaleX={scale}
            scaleY={scale}
            onClick={handleStageClick}
            onTap={handleStageClick}
            className="konva-stage"
            x={stageSize.width / 2 - (canvasWidth * scale) / 2}
            y={stageSize.height / 2 - (canvasHeight * scale) / 2}
          >
            <Layer>
              {/* Background */}
              {backgroundImage ? (
                <KonvaImage
                  x={0}
                  y={0}
                  width={canvasWidth}
                  height={canvasHeight}
                  image={backgroundImage}
                  listening={false} // Make it non-interactive
                />
              ) : (
                <Rect
                  x={0}
                  y={0}
                  width={canvasWidth}
                  height={canvasHeight}
                  fill="white"
                  stroke="#ddd"
                />
              )}
              
              {/* Design Elements - render only when ready */}
              {/* Sort all elements by z-index and render them in order */}
              {[
                ...(template.shapes || []).map(shape => ({ element: shape, type: 'shape', zIndex: shape.zIndex || 0 })),
                ...(template.texts || []).map(text => ({ element: text, type: 'text', zIndex: text.zIndex || 0 })),
                ...(isLoaded ? (template.images || []).map(image => ({ element: image, type: 'image', zIndex: image.zIndex || 0 })) : [])
              ]
                .sort((a, b) => a.zIndex - b.zIndex) // Sort by z-index (ascending order)
                .map(item => {
                  switch (item.type) {
                    case 'shape':
                      return renderShapeElement(item.element as ShapeElement);
                    case 'text':
                      return renderTextElement(item.element as TextElement);
                    case 'image':
                      return renderImageElement(item.element as ImageAsset);
                    default:
                      return null;
                  }
                })}
              
              {/* Transformer for selected element */}
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  // Limit minimum size
                  if (newBox.width < 10 || newBox.height < 10) {
                    return oldBox;
                  }
                  return newBox;
                }}
                rotateEnabled={true}
                resizeEnabled={true}
              />
            </Layer>
          </Stage>
        )}
      </div>
    </div>
  );
};

export default CanvasWorkspace; 