import React from 'react';
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
  if (!selectedElement) {
    return (
      <div className="properties-panel empty-panel">
        <p>Select an element to edit its properties</p>
      </div>
    );
  }

  const handleNumberChange = (key: string, value: number | null) => {
    if (value !== null && selectedElement) {
      onUpdateElement({
        ...selectedElement,
        [key]: value
      });
    }
  };

  const handleTextChange = (key: string, value: string) => {
    if (selectedElement) {
      onUpdateElement({
        ...selectedElement,
        [key]: value
      });
    }
  };

  const handleColorChange = (key: string, value: any) => {
    if (selectedElement) {
      onUpdateElement({
        ...selectedElement,
        [key]: value.toHexString()
      });
    }
  };

  const renderCommonProperties = () => (
    <Panel header="Position and Size" key="position">
      <Form layout="vertical" className="properties-form">
        <div className="form-row">
          <Form.Item label="X Position" className="form-item-half">
            <InputNumber
              value={'positionX' in selectedElement ? selectedElement.positionX : 0}
              onChange={(value) => handleNumberChange('positionX', value)}
              className="full-width"
            />
          </Form.Item>
          <Form.Item label="Y Position" className="form-item-half">
            <InputNumber
              value={'positionY' in selectedElement ? selectedElement.positionY : 0}
              onChange={(value) => handleNumberChange('positionY', value)}
              className="full-width"
            />
          </Form.Item>
        </div>

        {'width' in selectedElement && 'height' in selectedElement && (
          <div className="form-row">
            <Form.Item label="Width" className="form-item-half">
              <InputNumber
                value={selectedElement.width}
                onChange={(value) => handleNumberChange('width', value)}
                className="full-width"
                min={10}
              />
            </Form.Item>
            <Form.Item label="Height" className="form-item-half">
              <InputNumber
                value={selectedElement.height}
                onChange={(value) => handleNumberChange('height', value)}
                className="full-width"
                min={10}
              />
            </Form.Item>
          </div>
        )}

        <Form.Item label="Rotation (degrees)">
          <Slider
            value={'rotation' in selectedElement ? selectedElement.rotation : 0}
            onChange={(value) => handleNumberChange('rotation', value)}
            min={0}
            max={360}
          />
        </Form.Item>

        <Form.Item label="Layer (Z-Index)">
          <InputNumber
            value={'zIndex' in selectedElement ? selectedElement.zIndex : 0}
            onChange={(value) => handleNumberChange('zIndex', value)}
            className="full-width"
          />
        </Form.Item>
      </Form>
    </Panel>
  );

  const renderTextProperties = () => {
    if (!('text' in selectedElement)) return null;
    
    return (
      <Panel header="Text Properties" key="text">
        <Form layout="vertical" className="properties-form">
          <Form.Item label="Text Content">
            <Input.TextArea
              value={selectedElement.text}
              onChange={(e) => handleTextChange('text', e.target.value)}
              rows={3}
            />
          </Form.Item>
          
          <Form.Item label="Font Family">
            <Select
              value={selectedElement.font}
              onChange={(value) => handleTextChange('font', value)}
              className="full-width"
            >
              <Option value="Arial">Arial</Option>
              <Option value="Times New Roman">Times New Roman</Option>
              <Option value="Helvetica">Helvetica</Option>
              <Option value="Courier New">Courier New</Option>
              <Option value="Georgia">Georgia</Option>
              <Option value="Verdana">Verdana</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="Font Size">
            <InputNumber
              value={selectedElement.fontSize}
              onChange={(value) => handleNumberChange('fontSize', value)}
              className="full-width"
              min={8}
              max={72}
            />
          </Form.Item>
          
          <Form.Item label="Text Color">
            <ColorPicker
              value={selectedElement.color}
              onChange={(value) => handleColorChange('color', value)}
              className="full-width"
            />
          </Form.Item>
        </Form>
      </Panel>
    );
  };

  const renderShapeProperties = () => {
    if (!('shapeType' in selectedElement)) return null;
    
    return (
      <Panel header="Shape Properties" key="shape">
        <Form layout="vertical" className="properties-form">
          <Form.Item label="Shape Type">
            <Select
              value={selectedElement.shapeType}
              onChange={(value) => handleTextChange('shapeType', value)}
              className="full-width"
            >
              <Option value="rectangle">Rectangle</Option>
              <Option value="circle">Circle</Option>
              <Option value="triangle">Triangle</Option>
              <Option value="line">Line</Option>
              <Option value="star">Star</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="Fill Color">
            <ColorPicker
              value={selectedElement.color}
              onChange={(value) => handleColorChange('color', value)}
              className="full-width"
            />
          </Form.Item>
        </Form>
      </Panel>
    );
  };

  const renderImageProperties = () => {
    if (!('image' in selectedElement)) return null;
    
    return (
      <Panel header="Image Properties" key="image">
        <Form layout="vertical" className="properties-form">
          <div className="image-preview">
            <img src={selectedElement.image} alt="Preview" />
          </div>
        </Form>
      </Panel>
    );
  };

  const renderElementType = () => {
    if ('text' in selectedElement) {
      return 'Text Element';
    } else if ('image' in selectedElement) {
      return 'Image Element';
    } else if ('shapeType' in selectedElement) {
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
            onClick={() => onDuplicateElement(selectedElement.uuid)}
          >
            Duplicate
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => onDeleteElement(selectedElement.uuid)}
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