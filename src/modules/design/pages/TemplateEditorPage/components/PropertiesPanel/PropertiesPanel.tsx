import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { Collapse, Input, Slider, Form, Select, Typography, InputNumber, Button, Divider, ColorPicker } from 'antd';
import { DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { DesignElement, ElementType } from '../../../../types';
import './PropertiesPanel.scss';

const { Panel } = Collapse;
const { Title } = Typography;
const { Option } = Select;

interface PropertiesPanelProps {
  selectedElement: DesignElement | null;
  onUpdateElement: (updatedElement: DesignElement) => void;
  onDeleteElement?: (elementId: string) => void;
  onDuplicateElement?: (elementId: string) => void;
}

function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  selectedElement, 
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement
}) => {
  // Keep track of the latest element state with a ref for immediate access
  const latestElementRef = useRef<DesignElement | null>(null);
  
  // Force re-renders when element changes
  const [updateTrigger, setUpdateTrigger] = useState(0);
  
  // Process the selected element to ensure valid values
  const processedElement = useMemo(() => {
    if (!selectedElement) return null;
    
    const processed = { ...selectedElement };
    
    // Ensure position values are numbers, not null
    if ('positionX' in processed) {
      processed.positionX = processed.positionX !== null ? Number(processed.positionX) : 0;
      processed.positionY = processed.positionY !== null ? Number(processed.positionY) : 0;
      
      if ('width' in processed) {
        processed.width = processed.width !== null ? Number(processed.width) : 100;
        processed.height = processed.height !== null ? Number(processed.height) : 100;
      }
      
      if ('zIndex' in processed) {
        processed.zIndex = processed.zIndex !== null ? Number(processed.zIndex) : 0;
      }
      
      if ('rotation' in processed) {
        processed.rotation = processed.rotation !== null ? Number(processed.rotation) : 0;
      }

      if ('fontSize' in processed) {
        processed.fontSize = processed.fontSize !== null ? Number(processed.fontSize) : 16;
      }
    }
    
    console.log("Processed element:", processed);
    return processed;
  }, [selectedElement]);
  
  // Create debounced version of update function to prevent rapid updates
  const debouncedUpdate = useCallback(
    debounce((element: DesignElement) => {
      console.log("Sending update to parent component:", element);
      onUpdateElement(element);
    }, 50), // Short delay to batch updates
    [onUpdateElement]
  );

  // Update our ref whenever the selected element changes from the canvas
  useEffect(() => {
    if (processedElement) {
      console.log("Updating element ref from selected element changes:", processedElement);
      // Store the normalized element in our ref
      latestElementRef.current = { ...processedElement };
      
      // Force re-render to update all form fields
      setUpdateTrigger(prev => prev + 1);
    }
  }, [
    // Only track basic properties and the element itself
    processedElement?.positionX,
    processedElement?.positionY,
    processedElement?.zIndex,
    processedElement?.rotation,
    processedElement?.uuid,
    // Use a stringified version of the element to detect all changes
    JSON.stringify(processedElement)
  ]);

  // Helper function to get current value
  const getCurrentValue = (key: string, defaultValue: any = 0) => {
    // Always use the latest reference to ensure up-to-date values
    const element = latestElementRef.current;
    
    if (element && key in element) {
      const value = (element as any)[key];
      return value !== null && value !== undefined ? value : defaultValue;
    }
    
    return defaultValue;
  };

  if (!processedElement) {
    return (
      <div className="properties-panel empty-panel">
        <p>Select an element to edit its properties</p>
      </div>
    );
  }

  // Handle updates from user input in the property panel
  const handlePropertyChange = (key: string, value: any) => {
    if (!latestElementRef.current) return;
    
    // Log the change
    console.log(`Updating property ${key} to:`, value);
    
    // Get the current state of the element
    const currentElement = { ...latestElementRef.current };
    
    // Process the value based on its type
    if (typeof value === 'number' || 
        key === 'zIndex' || key === 'fontSize' || 
        key === 'width' || key === 'height' || 
        key === 'positionX' || key === 'positionY' || 
        key === 'rotation') {
      // Ensure numeric values are stored as numbers
      (currentElement as any)[key] = Number(value);
    } else {
      // Other values (strings, etc)
      (currentElement as any)[key] = value;
    }
    
    // Update our ref first to ensure it has the latest state
    latestElementRef.current = currentElement;
    
    // Force a re-render to update all fields
    setUpdateTrigger(prev => prev + 1);
    
    // Send the update to the parent component with a clone to avoid reference issues
    debouncedUpdate({ ...currentElement });
  };

  // Specialized handlers for different property types
  const handleNumberChange = (key: string, value: number | null) => {
    if (value !== null) {
      handlePropertyChange(key, value);
    }
  };

  const handleTextChange = (key: string, value: string) => {
    handlePropertyChange(key, value);
  };

  const handleColorChange = (key: string, value: any) => {
    // Handle both string colors and ColorPicker's color objects
    const colorValue = typeof value === 'string' ? value : value.toHexString();
    handlePropertyChange(key, colorValue);
  };

  // Improved color picker component that better handles hex colors
  const renderColorPicker = (key: string, defaultValue: string = '#000000') => {
    const currentValue = getCurrentValue(key, defaultValue);
    console.log(`Rendering color picker for ${key} with value:`, currentValue);
    
    return (
      <ColorPicker
        value={currentValue}
        onChange={(value) => handleColorChange(key, value)}
        className="full-width"
        format="hex"
      />
    );
  };

  const renderCommonProperties = () => (
    <Panel header="Position and Size" key="position">
      <Form layout="vertical" className="properties-form">
        <div className="form-row">
          <Form.Item label="X Position" className="form-item-half">
            <InputNumber
              value={getCurrentValue('positionX', 0)}
              onChange={(value) => handleNumberChange('positionX', value)}
              className="full-width"
            />
          </Form.Item>
          <Form.Item label="Y Position" className="form-item-half">
            <InputNumber
              value={getCurrentValue('positionY', 0)}
              onChange={(value) => handleNumberChange('positionY', value)}
              className="full-width"
            />
          </Form.Item>
        </div>

        {'width' in processedElement && 'height' in processedElement && (
          <div className="form-row">
            <Form.Item label="Width" className="form-item-half">
              <InputNumber
                value={getCurrentValue('width', 100)}
                onChange={(value) => handleNumberChange('width', value)}
                className="full-width"
                min={1}
              />
            </Form.Item>
            <Form.Item label="Height" className="form-item-half">
              <InputNumber
                value={getCurrentValue('height', 100)}
                onChange={(value) => handleNumberChange('height', value)}
                className="full-width"
                min={1}
              />
            </Form.Item>
          </div>
        )}

        <Form.Item label="Rotation (degrees)">
          <Slider
            value={getCurrentValue('rotation', 0)}
            onChange={(value) => handleNumberChange('rotation', value)}
            min={0}
            max={360}
          />
        </Form.Item>

        <Form.Item 
          label="Layer (Z-Index)"
          tooltip="Negative values place elements behind others, positive values place elements in front. Higher values appear on top."
        >
          <InputNumber
            value={getCurrentValue('zIndex', 0)}
            onChange={(value) => handleNumberChange('zIndex', value)}
            className="full-width"
            step={1}
          />
        </Form.Item>

        <Form.Item 
          label="Opacity"
          tooltip="Controls the transparency of the element. 0 is completely transparent, 1 is fully opaque."
        >
          <div className="form-row">
            <Slider
              value={getCurrentValue('opacity', 1.0)}
              onChange={(value) => handleNumberChange('opacity', value)}
              min={0}
              max={1}
              step={0.01}
              className="slider-with-input"
            />
            <InputNumber
              value={getCurrentValue('opacity', 1.0)}
              onChange={(value) => handleNumberChange('opacity', value)}
              min={0}
              max={1}
              step={0.01}
              className="input-with-slider"
              formatter={value => `${Math.round((Number(value) || 0) * 100)}%`}
              parser={value => Number(value?.replace('%', '')) / 100}
            />
          </div>
        </Form.Item>
      </Form>
    </Panel>
  );

  const renderTextProperties = () => {
    if (!processedElement || !('text' in processedElement)) return null;
    
    return (
      <Collapse.Panel header="Text Properties" key="text">
        <Form.Item label="Text Content">
          <Input.TextArea
            value={getCurrentValue('text', '')}
            onChange={(e) => handleTextChange('text', e.target.value)}
            rows={4}
          />
        </Form.Item>
        
        <Form.Item label="Font Family">
          <Select
            value={getCurrentValue('font', 'Arial')}
            onChange={(value) => handleTextChange('font', value)}
            className="full-width"
          >
            <Select.Option value="Arial">Arial</Select.Option>
            <Select.Option value="Times New Roman">Times New Roman</Select.Option>
            <Select.Option value="Courier New">Courier New</Select.Option>
            <Select.Option value="Georgia">Georgia</Select.Option>
            <Select.Option value="Verdana">Verdana</Select.Option>
          </Select>
        </Form.Item>
        
        <Form.Item label="Font Size">
          <InputNumber
            value={getCurrentValue('fontSize', 50)}
            onChange={(value) => {
              console.log(`Font size changed to: ${value}`);
              // Ensure value is never null or undefined
              const processedValue = value !== null && value !== undefined ? Number(value) : 50;
              // Ensure it's at least 8 and a valid number
              const finalValue = isNaN(processedValue) || processedValue < 8 ? 50 : processedValue;
              console.log(`Processed font size: ${finalValue}`);
              handleNumberChange('fontSize', finalValue);
            }}
            className="full-width"
            min={8}
            max={500}
          />
        </Form.Item>
        
        <Form.Item label="Text Color">
          {renderColorPicker('color', '#000000')}
        </Form.Item>
      </Collapse.Panel>
    );
  };

  const renderShapeProperties = () => {
    if (!processedElement || !('shapeType' in processedElement)) return null;
    
    return (
      <Collapse.Panel header="Shape Properties" key="shape">
        <Form.Item label="Shape Type">
          <Select
            value={getCurrentValue('shapeType', 'rectangle')}
            onChange={(value) => handleTextChange('shapeType', value)}
            className="full-width"
          >
            <Select.Option value="rectangle">Rectangle</Select.Option>
            <Select.Option value="circle">Circle</Select.Option>
            <Select.Option value="triangle">Triangle</Select.Option>
            <Select.Option value="star">Star</Select.Option>
            <Select.Option value="line">Line</Select.Option>
          </Select>
        </Form.Item>
        
        <Form.Item label="Fill Color">
          {renderColorPicker('color', '#000000')}
        </Form.Item>
      </Collapse.Panel>
    );
  };

  const renderImageProperties = () => {
    if (!('image' in processedElement)) return null;
    
    return (
      <Panel header="Image Properties" key="image">
        <Form layout="vertical" className="properties-form">
          <div className="image-preview">
            <img src={processedElement.image} alt="Preview" />
          </div>
        </Form>
      </Panel>
    );
  };

  const renderElementType = () => {
    if ('text' in processedElement) {
      return 'Text Element';
    } else if ('image' in processedElement) {
      return 'Image Element';
    } else if ('shapeType' in processedElement) {
      return 'Shape Element';
    }
    return 'Unknown Element';
  };

  return (
    <div className="properties-panel">
      <div className="panel-header">
        <Title level={4}>Element Properties</Title>
        <div className="element-type">{renderElementType()}</div>
      </div>

      {onDeleteElement && onDuplicateElement && (
        <div className="element-actions">
          <Button 
            icon={<CopyOutlined />} 
            onClick={() => onDuplicateElement(processedElement.uuid)}
          >
            Duplicate
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => onDeleteElement(processedElement.uuid)}
          >
            Delete
          </Button>
        </div>
      )}
      
      <Divider />
      
      <Collapse defaultActiveKey={['position', 'text', 'shape', 'image']} ghost>
        {renderCommonProperties()}
        {renderTextProperties()}
        {renderShapeProperties()}
        {renderImageProperties()}
      </Collapse>
    </div>
  );
};

export default PropertiesPanel; 