import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Col, Row, Input, Tabs, Select, Typography, Spin, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { fetchAllTemplates, createTemplate } from '../../services/designService';
import { Template, TemplateSizeType } from '../../types';
import './TemplateListPage.scss';

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const TemplateListPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<TemplateSizeType>('1080x1080');
  const navigate = useNavigate();

  useEffect(() => {
    loadTemplates();
  }, [selectedSize]);

  useEffect(() => {
    if (templates.length > 0) {
      filterTemplates();
    }
  }, [templates, searchQuery, activeTab]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await fetchAllTemplates(selectedSize);
      setTemplates(data);
      setFilteredTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      message.error('Failed to load templates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = [...templates];
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by tab
    if (activeTab === 'my') {
      filtered = filtered.filter(template => !template.isDefault);
    }
    
    setFilteredTemplates(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleSizeChange = (value: TemplateSizeType) => {
    setSelectedSize(value);
  };

  const handleCreateTemplate = async () => {
    try {
      const newTemplate = await createTemplate(`New Template ${new Date().toLocaleTimeString()}`, selectedSize);
      navigate(`/design/editor/${newTemplate.uuid}`);
    } catch (error) {
      console.error('Error creating template:', error);
      message.error('Failed to create template. Please try again.');
    }
  };

  const handleTemplateClick = (uuid: string) => {
    navigate(`/design/editor/${uuid}`);
  };

  return (
    <div className="template-list-page">
      <div className="template-list-header">
        <Title level={2}>Design Templates</Title>
        <div className="template-actions">
          <Select 
            value={selectedSize} 
            onChange={handleSizeChange}
            style={{ width: 150, marginRight: 16 }}
          >
            <Option value="1080x1080">Square 1080×1080</Option>
            <Option value="1080x1920">Portrait 1080×1920</Option>
          </Select>
          
          <Input
            placeholder="Search templates"
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={handleSearchChange}
            style={{ width: 250, marginRight: 16 }}
          />
          
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleCreateTemplate}
          >
            Create New
          </Button>
        </div>
      </div>

      <Tabs activeKey={activeTab} onChange={handleTabChange} className="template-tabs">
        <TabPane tab="All Templates" key="all" />
        <TabPane tab="My Templates" key="my" />
      </Tabs>

      {loading ? (
        <div className="templates-loading">
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]} className="templates-grid">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map(template => (
              <Col xs={24} sm={12} md={8} lg={6} key={template.uuid}>
                <Card
                  hoverable
                  className="template-card"
                  onClick={() => handleTemplateClick(template.uuid)}
                >
                  <div className="template-preview">
                    <div 
                      className={`preview-container ${template.size === '1080x1920' ? 'portrait' : 'square'}`}
                    >
                      {/* Template Preview Placeholder */}
                      <div className="template-placeholder">
                        {template.name}
                      </div>
                    </div>
                  </div>
                  <div className="template-info">
                    <div className="template-name">{template.name}</div>
                    <div className="template-size">{template.size}</div>
                  </div>
                </Card>
              </Col>
            ))
          ) : (
            <Col span={24} className="no-templates">
              <p>No templates found. Try adjusting your search or create a new template.</p>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTemplate}>
                Create New Template
              </Button>
            </Col>
          )}
        </Row>
      )}
    </div>
  );
};

export default TemplateListPage; 