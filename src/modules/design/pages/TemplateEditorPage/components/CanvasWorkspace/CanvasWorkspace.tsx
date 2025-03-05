import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Image as KonvaImage, Star, Group, Transformer } from 'react-konva';
import { Button, Tooltip, Slider } from 'antd';
import { ZoomInOutlined, ZoomOutOutlined, UndoOutlined, RedoOutlined } from '@ant-design/icons';
import { Template, DesignElement, ElementType, ImageAsset, TextElement, ShapeElement } from '../../../../types';
import { v4 as uuidv4 } from 'uuid';
import { createImageAsset, createTextElement, createShapeElement } from '../../../../services/designService';
import './CanvasWorkspace.scss';

interface CanvasWorkspaceProps {
  template: Template;
  selectedElement: DesignElement | null;
  onSelectElement: (element: DesignElement | null) => void;
  onUpdateElements: (updatedTemplate: Template) => void;
}

const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  template,
  selectedElement,
  onSelectElement,
  onUpdateElements,
}) => {
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const [scale, setScale] = useState<number>(1);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});

  // Parse template size
  const templateSize = template.size ? template.size.split('x').map(Number) : [1080, 1080];
  const canvasWidth = templateSize[0] || 1080;  // Add fallback values
  const canvasHeight = templateSize[1] || 1080; // Add fallback values

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
    onSelectElement(element);
  };

  const handleStageClick = (e: any) => {
    // If clicked on the stage background, deselect
    if (e.target === e.currentTarget) {
      onSelectElement(null);
    }
  };

  const handleTransformEnd = (element: DesignElement, e: any) => {
    const node = e.currentTarget;
    const updatedElement = { ...element };
    
    // Update position
    const { x, y } = node.position();
    updatedElement.positionX = x;
    updatedElement.positionY = y;
    
    // Update size if applicable
    if ('width' in updatedElement && 'height' in node.size()) {
      const { width, height } = node.size();
      updatedElement.width = width;
      updatedElement.height = height;
    }
    
    // Update rotation
    updatedElement.rotation = node.rotation();
    
    // Update the element in the template
    updateElement(updatedElement);
  };

  const updateElement = (updatedElement: DesignElement) => {
    const updatedTemplate = { ...template };
    
    if ('image' in updatedElement) {
      updatedTemplate.images = template.images?.map(img => 
        img.uuid === updatedElement.uuid ? updatedElement as ImageAsset : img
      ) || [];
    } else if ('text' in updatedElement) {
      updatedTemplate.texts = template.texts?.map(txt => 
        txt.uuid === updatedElement.uuid ? updatedElement as TextElement : txt
      ) || [];
    } else if ('shapeType' in updatedElement) {
      updatedTemplate.shapes = template.shapes?.map(shape => 
        shape.uuid === updatedElement.uuid ? updatedElement as ShapeElement : shape
      ) || [];
    }
    
    onUpdateElements(updatedTemplate);
  };

  const renderImageElement = (image: ImageAsset) => {
    const imageObj = images[image.uuid];
    if (!imageObj) return null;
    
    // Ensure all position and size values are valid numbers
    const x = isNaN(Number(image.positionX)) ? 0 : Number(image.positionX);
    const y = isNaN(Number(image.positionY)) ? 0 : Number(image.positionY);
    const width = isNaN(Number(image.width)) ? 100 : Number(image.width);
    const height = isNaN(Number(image.height)) ? 100 : Number(image.height);
    const rotation = isNaN(Number(image.rotation)) ? 0 : Number(image.rotation);
    
    return (
      <KonvaImage
        key={image.uuid}
        name={image.uuid}
        image={imageObj}
        x={x}
        y={y}
        width={width}
        height={height}
        rotation={rotation}
        draggable
        onClick={() => handleElementClick(image)}
        onTap={() => handleElementClick(image)}
        onDragEnd={(e) => handleTransformEnd(image, e)}
        onTransformEnd={(e) => handleTransformEnd(image, e)}
        className={image.uuid}
      />
    );
  };

  const renderTextElement = (text: TextElement) => {
    // Ensure all position and text values are valid
    const x = isNaN(Number(text.positionX)) ? 0 : Number(text.positionX);
    const y = isNaN(Number(text.positionY)) ? 0 : Number(text.positionY);
    const fontSize = isNaN(Number(text.fontSize)) ? 16 : Number(text.fontSize);
    const rotation = isNaN(Number(text.rotation)) ? 0 : Number(text.rotation);
    
    return (
      <Text
        key={text.uuid}
        name={text.uuid}
        text={text.text || "Text"}
        x={x}
        y={y}
        fontSize={fontSize}
        fontFamily={text.font || "Arial"}
        fill={text.color || "#000000"}
        rotation={rotation}
        draggable
        onClick={() => handleElementClick(text)}
        onTap={() => handleElementClick(text)}
        onDragEnd={(e) => handleTransformEnd(text, e)}
        onTransformEnd={(e) => handleTransformEnd(text, e)}
        className={text.uuid}
      />
    );
  };

  const renderShapeElement = (shape: ShapeElement) => {
    // Ensure all position and size values are valid numbers
    const x = isNaN(Number(shape.positionX)) ? 0 : Number(shape.positionX);
    const y = isNaN(Number(shape.positionY)) ? 0 : Number(shape.positionY);
    const width = isNaN(Number(shape.width)) ? 100 : Number(shape.width);
    const height = isNaN(Number(shape.height)) ? 100 : Number(shape.height);
    const rotation = isNaN(Number(shape.rotation)) ? 0 : Number(shape.rotation);
    
    switch (shape.shapeType) {
      case 'rectangle':
        return (
          <Rect
            key={shape.uuid}
            name={shape.uuid}
            x={x}
            y={y}
            width={width}
            height={height}
            fill={shape.color || "#1890ff"}
            rotation={rotation}
            draggable
            onClick={() => handleElementClick(shape)}
            onTap={() => handleElementClick(shape)}
            onDragEnd={(e) => handleTransformEnd(shape, e)}
            onTransformEnd={(e) => handleTransformEnd(shape, e)}
            className={shape.uuid}
          />
        );
      
      case 'circle':
        return (
          <Circle
            key={shape.uuid}
            name={shape.uuid}
            x={x + width / 2}
            y={y + height / 2}
            radius={Math.min(width, height) / 2}
            fill={shape.color || "#1890ff"}
            rotation={rotation}
            draggable
            onClick={() => handleElementClick(shape)}
            onTap={() => handleElementClick(shape)}
            onDragEnd={(e) => handleTransformEnd(shape, e)}
            onTransformEnd={(e) => handleTransformEnd(shape, e)}
            className={shape.uuid}
          />
        );
      
      case 'star':
        return (
          <Star
            key={shape.uuid}
            name={shape.uuid}
            x={x + width / 2}
            y={y + height / 2}
            numPoints={5}
            innerRadius={width / 4}
            outerRadius={width / 2}
            fill={shape.color || "#1890ff"}
            rotation={rotation}
            draggable
            onClick={() => handleElementClick(shape)}
            onTap={() => handleElementClick(shape)}
            onDragEnd={(e) => handleTransformEnd(shape, e)}
            onTransformEnd={(e) => handleTransformEnd(shape, e)}
            className={shape.uuid}
          />
        );
      
      case 'line':
        return (
          <Line
            key={shape.uuid}
            name={shape.uuid}
            points={[0, 0, width, 0]}
            x={x}
            y={y}
            stroke={shape.color || "#1890ff"}
            strokeWidth={height}
            rotation={rotation}
            draggable
            onClick={() => handleElementClick(shape)}
            onTap={() => handleElementClick(shape)}
            onDragEnd={(e) => handleTransformEnd(shape, e)}
            onTransformEnd={(e) => handleTransformEnd(shape, e)}
            className={shape.uuid}
          />
        );
      
      case 'triangle':
        return (
          <Line
            key={shape.uuid}
            name={shape.uuid}
            points={[width / 2, 0, width, height, 0, height]}
            x={x}
            y={y}
            fill={shape.color || "#1890ff"}
            closed
            rotation={rotation}
            draggable
            onClick={() => handleElementClick(shape)}
            onTap={() => handleElementClick(shape)}
            onDragEnd={(e) => handleTransformEnd(shape, e)}
            onTransformEnd={(e) => handleTransformEnd(shape, e)}
            className={shape.uuid}
          />
        );
      
      default:
        return null;
    }
  };

  const addNewElement = async (elementType: ElementType, data: any = {}) => {
    const templateId = template.uuid;
    
    if (!canvasWidth || !canvasHeight) {
      console.error('Canvas dimensions are not properly defined');
      return;
    }
    
    try {
      switch (elementType) {
        case ElementType.TEXT:
          const fontStyle = data || {};
          const fontSize = fontStyle.fontSize || 24;
          const font = fontStyle.fontFamily || 'Arial';
          const color = fontStyle.color || '#000000';
          
          const textElement = await createTextElement(
            templateId,
            'New Text',
            font,
            fontSize,
            color,
            Math.round(canvasWidth / 2 - 50),  // Round positions to integers
            Math.round(canvasHeight / 2 - 20)
          ) as TextElement;
          
          if (textElement) {
            const updatedTemplate = { ...template };
            updatedTemplate.texts = [...(template.texts || []), textElement];
            onUpdateElements(updatedTemplate);
            onSelectElement(textElement);
          }
          break;
          
        case ElementType.IMAGE:
          const imageUrl = data?.image || '';
          if (!imageUrl) return;
          
          const imageElement = await createImageAsset(
            templateId,
            imageUrl,
            Math.round(canvasWidth / 2 - 100),  // Round positions to integers
            Math.round(canvasHeight / 2 - 100),
            200,
            200
          ) as ImageAsset;
          
          if (imageElement) {
            // Preload the image
            const img = new window.Image();
            img.src = imageUrl;
            img.onload = () => {
              setImages(prev => ({ ...prev, [imageElement.uuid]: img }));
              
              const updatedTemplate = { ...template };
              updatedTemplate.images = [...(template.images || []), imageElement];
              onUpdateElements(updatedTemplate);
              onSelectElement(imageElement);
            };
          }
          break;
          
        case ElementType.SHAPE:
          const shapeType = data?.shapeType || 'rectangle';
          
          const shapeElement = await createShapeElement(
            templateId,
            shapeType,
            '#1890ff',
            Math.round(canvasWidth / 2 - 50),  // Round positions to integers
            Math.round(canvasHeight / 2 - 50),
            100,
            100
          ) as ShapeElement;
          
          if (shapeElement) {
            const updatedTemplateWithShape = { ...template };
            updatedTemplateWithShape.shapes = [...(template.shapes || []), shapeElement];
            onUpdateElements(updatedTemplateWithShape);
            onSelectElement(shapeElement);
          }
          break;
      }
    } catch (error) {
      console.error('Error adding new element:', error);
    }
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
          >
            <Layer>
              {/* Background */}
              <Rect
                x={0}
                y={0}
                width={canvasWidth}
                height={canvasHeight}
                fill="white"
                stroke="#ddd"
              />
              
              {/* Design Elements - render only when ready */}
              {template.shapes?.map((shape) => renderShapeElement(shape))}
              {template.texts?.map((text) => renderTextElement(text))}
              {isLoaded && template.images?.map((image) => renderImageElement(image))}
              
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
              />
            </Layer>
          </Stage>
        )}
      </div>
    </div>
  );
};

export default CanvasWorkspace; 