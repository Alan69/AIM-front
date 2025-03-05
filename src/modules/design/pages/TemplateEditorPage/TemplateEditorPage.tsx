import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Button, Input, Spin, message, Tooltip, Modal } from 'antd';
import { 
  ArrowLeftOutlined, 
  SaveOutlined, 
  UndoOutlined, 
  RedoOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import { 
  fetchTemplateWithElements, 
  updateTemplate, 
  deleteTemplate,
  createTextElement,
  createImageAsset,
  createShapeElement,
  deleteElementFromTemplate
} from '../../services/designService';
import { Template, ElementType, DesignElement } from '../../types';
import CanvasWorkspace from './components/CanvasWorkspace';
import ElementsPanel from './components/ElementsPanel';
import PropertiesPanel from './components/PropertiesPanel';
import './TemplateEditorPage.scss';

const { Header, Sider, Content } = Layout;

const TemplateEditorPage: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [templateName, setTemplateName] = useState<string>('');
  const [selectedElement, setSelectedElement] = useState<DesignElement | null>(null);
  const [history, setHistory] = useState<Template[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load template data on mount
  useEffect(() => {
    if (uuid) {
      loadTemplate(uuid);
    }
  }, [uuid]);

  // Initialize history when template is loaded
  useEffect(() => {
    if (template) {
      setTemplateName(template.name);
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

  const loadTemplate = async (uuid: string) => {
    try {
      setLoading(true);
      const data = await fetchTemplateWithElements(uuid);
      setTemplate(data);
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

  const handleSave = async () => {
    if (!template || !uuid) return;
    
    try {
      setIsSaving(true);
      await updateTemplate(uuid, { name: templateName });
      message.success('Template saved successfully');
    } catch (error: any) {
      console.error('Error saving template:', error);
      
      // More helpful error message
      if (error?.message && error.message.includes('Authentication required')) {
        message.error('Please log in to save your template.');
      } else {
        message.error('Failed to save template. Please try again.');
      }
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
    setSelectedElement(element);
  };

  const handleUpdateElements = useCallback((updatedTemplate: Template) => {
    setTemplate(updatedTemplate);
    addElementToHistory(updatedTemplate);
  }, [addElementToHistory]);

  // Add functions to handle creating new elements
  const handleAddElement = async (elementType: ElementType, data?: any) => {
    if (!template || !uuid) return;
    
    try {
      let updatedTemplate: Template;
      
      switch(elementType) {
        case 'text':
          // Default text properties
          const text = data?.text || 'New Text';
          const font = data?.font || 'Arial';
          const fontSize = data?.fontSize || 24;
          const color = data?.color || '#000000';
          // Center the text on the canvas based on template size
          const positionX = data?.positionX || 300;
          const positionY = data?.positionY || 300;
          
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
            data?.positionX || 300,
            data?.positionY || 300,
            data?.width || 200,
            data?.height || 200
          );
          break;
        
        case 'shape':
          // Default shape properties
          const shapeType = data?.shapeType || 'rectangle';
          updatedTemplate = await createShapeElement(
            uuid,
            shapeType,
            data?.color || '#000000',
            data?.positionX || 300,
            data?.positionY || 300,
            data?.width || 100,
            data?.height || 100
          );
          break;
          
        default:
          message.error(`Unknown element type: ${elementType}`);
          return;
      }
      
      setTemplate(updatedTemplate);
      addElementToHistory(updatedTemplate);
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
          {selectedElement && (
            <Tooltip title="Delete Element">
              <Button 
                icon={<DeleteOutlined />} 
                onClick={handleDeleteElement}
                danger
                className="header-button"
              />
            </Tooltip>
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
          />
        </Content>
        
        <Sider width={300} className="editor-sider right-sider">
          <PropertiesPanel 
            selectedElement={selectedElement}
            onUpdateElement={(updatedElement: DesignElement) => {
              if (!template || !selectedElement) return;
              
              let updatedTemplate: Template = { ...template };
              
              if ('image' in selectedElement) {
                updatedTemplate.images = template.images?.map(img => 
                  img.uuid === selectedElement.uuid ? updatedElement as any : img
                );
              } else if ('text' in selectedElement) {
                updatedTemplate.texts = template.texts?.map(txt => 
                  txt.uuid === selectedElement.uuid ? updatedElement as any : txt
                );
              } else if ('shapeType' in selectedElement) {
                updatedTemplate.shapes = template.shapes?.map(shape => 
                  shape.uuid === selectedElement.uuid ? updatedElement as any : shape
                );
              }
              
              handleUpdateElements(updatedTemplate);
            }}
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