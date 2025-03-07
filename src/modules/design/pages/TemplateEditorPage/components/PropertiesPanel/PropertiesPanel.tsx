import React, { useEffect, useMemo, useState } from 'react';
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

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  selectedElement, 
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement
}) => {
  // Local state for input values
  const [localValues, setLocalValues] = useState<Record<string, any>>({});
  
  // Ensure position values are properly displayed - hooks must be called at the top level
  useEffect(() => {
    if (selectedElement && 'positionX' in selectedElement) {
      // Force re-render when selected element changes to ensure position values are displayed correctly
      console.log(`Properties panel received element with position: (${selectedElement.positionX}, ${selectedElement.positionY})`);
      
      // If position values are null, log a warning
      if (selectedElement.positionX === null || selectedElement.positionY === null) {
        console.warn(`Element has null position values, this may cause display issues`);
      }
      
      // Reset local values when selected element changes
      setLocalValues({});
    }
  }, [selectedElement]);

  // Create a local copy of the selected element with guaranteed non-null position values
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
      
      console.log(`Properties panel using processed element with position: (${processed.positionX}, ${processed.positionY}), zIndex: ${processed.zIndex}, rotation: ${processed.rotation}`);
    }
    
    return processed;
  }, [selectedElement]);

  // Helper function to get the current value (from local state or processed element)
  const getCurrentValue = (key: string, defaultValue: any = 0) => {
    // First check if we have a local value (which takes precedence)
    if (key in localValues) {
      console.log(`Using local value for ${key}:`, localValues[key]);
      return localValues[key];
    }
    
    // Otherwise use the value from the processed element
    if (processedElement && key in processedElement) {
      const value = (processedElement as any)[key];
      console.log(`Using element value for ${key}:`, value);
      return value;
    }
    
    // Fall back to default value if neither exists
    console.log(`Using default value for ${key}:`, defaultValue);
    return defaultValue;
  };

  if (!processedElement) {
    return (
      <div className="properties-panel empty-panel">
        <p>Select an element to edit its properties</p>
      </div>
    );
  }

  // Log only critical information
  if (('positionX' in processedElement && processedElement.positionX === 0 && processedElement.positionY === 0)) {
    console.log(`Warning: Selected element has position (0,0) which may indicate a problem`);
  }

  const handleNumberChange = (key: string, value: number | null) => {
    if (value !== null && processedElement) {
      // Update local state immediately for responsive UI
      setLocalValues(prev => ({ ...prev, [key]: value }));
      
      // Create a deep copy of the selected element
      const updatedElement = { ...processedElement };
      
      // Ensure the value is a number
      (updatedElement as any)[key] = Number(value);
      
      // Update the parent component
      onUpdateElement(updatedElement);
    }
  };

  const handleTextChange = (key: string, value: string) => {
    if (processedElement) {
      // Update local state immediately for responsive UI
      setLocalValues(prev => ({ ...prev, [key]: value }));
      
      // Create a deep copy of the element
      const updatedElement = { ...processedElement };
      
      // Update the property
      (updatedElement as any)[key] = value;
      
      // Log the change for debugging
      console.log(`Text changed for ${key}:`, value);
      
      // Update the element
      onUpdateElement(updatedElement);
    }
  };

  const handleColorChange = (key: string, value: any) => {
    if (processedElement) {
      // Update local state immediately for responsive UI
      setLocalValues(prev => ({ ...prev, [key]: value }));
      
      // Create a deep copy of the element
      const updatedElement = { ...processedElement };
      
      // Ensure we're using a string color value
      const colorValue = typeof value === 'string' ? value : value.toHexString();
      
      // Update the property
      (updatedElement as any)[key] = colorValue;
      
      // Log the change for debugging
      console.log(`Color changed for ${key}:`, colorValue);
      
      // Update the element
      onUpdateElement(updatedElement);
    }
  };

  const handleInputFinish = (key: string, value: any) => {
    if (processedElement) {
      // First, ensure the value is applied to the element
      const updatedElement = { ...processedElement };
      
      // Apply the value based on its type
      if (typeof value === 'number' || key === 'zIndex' || key === 'fontSize' || 
          key === 'width' || key === 'height' || key === 'positionX' || key === 'positionY' || 
          key === 'rotation') {
        (updatedElement as any)[key] = Number(value);
      } else {
        (updatedElement as any)[key] = value;
      }
      
      // Update the element with the final value
      onUpdateElement(updatedElement);
      
      // Then clear local state for this key
      setLocalValues(prev => {
        const newValues = { ...prev };
        delete newValues[key];
        return newValues;
      });
      
      console.log(`Input finished for ${key}, final value:`, value);
    }
  };

  const renderCommonProperties = () => (
    <Panel header="Position and Size" key="position">
      <Form layout="vertical" className="properties-form">
        <div className="form-row">
          <Form.Item label="X Position" className="form-item-half">
            <InputNumber
              value={getCurrentValue('positionX', 0)}
              onChange={(value) => handleNumberChange('positionX', value)}
              onPressEnter={() => handleInputFinish('positionX', getCurrentValue('positionX', 0))}
              onBlur={() => handleInputFinish('positionX', getCurrentValue('positionX', 0))}
              className="full-width"
            />
          </Form.Item>
          <Form.Item label="Y Position" className="form-item-half">
            <InputNumber
              value={getCurrentValue('positionY', 0)}
              onChange={(value) => handleNumberChange('positionY', value)}
              onPressEnter={() => handleInputFinish('positionY', getCurrentValue('positionY', 0))}
              onBlur={() => handleInputFinish('positionY', getCurrentValue('positionY', 0))}
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
                onPressEnter={() => handleInputFinish('width', getCurrentValue('width', 100))}
                onBlur={() => handleInputFinish('width', getCurrentValue('width', 100))}
                className="full-width"
                min={1}
              />
            </Form.Item>
            <Form.Item label="Height" className="form-item-half">
              <InputNumber
                value={getCurrentValue('height', 100)}
                onChange={(value) => handleNumberChange('height', value)}
                onPressEnter={() => handleInputFinish('height', getCurrentValue('height', 100))}
                onBlur={() => handleInputFinish('height', getCurrentValue('height', 100))}
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
            onAfterChange={(value) => handleInputFinish('rotation', value)}
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
            onPressEnter={() => handleInputFinish('zIndex', getCurrentValue('zIndex', 0))}
            onBlur={() => handleInputFinish('zIndex', getCurrentValue('zIndex', 0))}
            className="full-width"
            step={1}
          />
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
            onPressEnter={(e) => {
              // Prevent default behavior (which might submit a form)
              e.preventDefault();
              // Get the current value from the input
              const currentValue = (e.target as HTMLTextAreaElement).value;
              // Apply the final value
              handleInputFinish('text', currentValue);
            }}
            onBlur={(e) => {
              // Get the current value from the input
              const currentValue = e.target.value;
              // Apply the final value
              handleInputFinish('text', currentValue);
            }}
            rows={4}
          />
        </Form.Item>
        
        <Form.Item label="Font Family">
          <Select
            value={getCurrentValue('font', 'Arial')}
            onChange={(value) => handleTextChange('font', value)}
            onBlur={() => handleInputFinish('font', getCurrentValue('font', 'Arial'))}
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
            value={getCurrentValue('fontSize', 16)}
            onChange={(value) => handleNumberChange('fontSize', value)}
            onPressEnter={() => handleInputFinish('fontSize', getCurrentValue('fontSize', 16))}
            onBlur={() => handleInputFinish('fontSize', getCurrentValue('fontSize', 16))}
            className="full-width"
            min={8}
            max={72}
          />
        </Form.Item>
        
        <Form.Item label="Text Color">
          <ColorPicker
            value={getCurrentValue('color', '#000000')}
            onChange={(value) => handleColorChange('color', value.toHexString())}
            onChangeComplete={(value) => handleInputFinish('color', value.toHexString())}
            className="full-width"
          />
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
            onBlur={() => handleInputFinish('shapeType', getCurrentValue('shapeType', 'rectangle'))}
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
          <ColorPicker
            value={getCurrentValue('color', '#000000')}
            onChange={(value) => handleColorChange('color', value.toHexString())}
            onChangeComplete={(value) => handleInputFinish('color', value.toHexString())}
            className="full-width"
          />
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