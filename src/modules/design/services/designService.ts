import { ApolloClient, InMemoryCache, gql, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Cookies from 'js-cookie';
import axios from 'axios';
import { baseURL, graphqlURL } from 'types/baseUrl';
import { UserAsset, Template, TemplateSizeType } from '../types';
import { gql as gqlClient } from '@apollo/client';

// Create the HTTP link
const httpLink = createHttpLink({
  uri: graphqlURL || (process.env.NODE_ENV === 'production' 
    ? 'https://api.aimmagic.com/graphql/' 
    : 'http://127.0.0.1:8000/graphql/'),
});

// Add the authorization headers to the request
const authLink = setContext((_, { headers }) => {
  // Get the token from cookies
  const token = Cookies.get('token');
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

// Create Apollo Client with auth link
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
    query: {
      fetchPolicy: 'network-only',
    },
  },
});

// Query to get all templates with pagination
export const GET_TEMPLATES = gql`
  query GetTemplates($size: String) {
    templates(size: $size) {
      uuid
      name
      isDefault
      size
      backgroundImage
      thumbnail
      createdAt
      like
      assignable
      user {
        id
        username
      }
      imageAssets {
        uuid
        image
        positionX
        positionY
        width
        height
        zIndex
        rotation
        opacity
        borderRadius
      }
      textElements {
        uuid
        text
        font
        fontSize
        color
        positionX
        positionY
        zIndex
        rotation
        opacity
      }
      shapeElements {
        uuid
        shapeType
        color
        positionX
        positionY
        width
        height
        zIndex
        rotation
        opacity
      }
    }
  }
`;

// Query to get a template with all its elements
export const GET_TEMPLATE_WITH_ELEMENTS = gqlClient`
  query GetTemplateWithElements($uuid: UUID!) {
    template(uuid: $uuid) {
      uuid
      name
      isDefault
      size
      backgroundImage
      thumbnail
      like
      assignable
      createdAt
      user {
        id
        username
      }
      images {
        uuid
        image
        positionX
        positionY
        width
        height
        zIndex
        rotation
        opacity
        borderRadius
      }
      texts {
        uuid
        text
        font
        fontSize
        color
        positionX
        positionY
        zIndex
        rotation
        opacity
      }
      shapes {
        uuid
        shapeType
        color
        positionX
        positionY
        width
        height
        zIndex
        rotation
        opacity
      }
    }
  }
`;

// Mutation to create a template
export const CREATE_TEMPLATE = gqlClient`
  mutation CreateTemplate($name: String!, $size: String!, $userId: UUID!, $isDefault: Boolean, $backgroundImage: String, $assignable: Boolean) {
    createTemplate(name: $name, size: $size, userId: $userId, isDefault: $isDefault, backgroundImage: $backgroundImage, assignable: $assignable) {
      template {
        uuid
        name
        isDefault
        size
        backgroundImage
        assignable
        createdAt
      }
    }
  }
`;

// Mutation to add an image to a template
export const ADD_IMAGE_TO_TEMPLATE = gqlClient`
  mutation AddImageToTemplate(
    $templateId: UUID!, 
    $image: String!, 
    $positionX: Float!, 
    $positionY: Float!, 
    $width: Float!, 
    $height: Float!, 
    $zIndex: Int!,
    $rotation: Float!,
    $opacity: Float!,
    $borderRadius: Float!
  ) {
    addImageToTemplate(
      templateId: $templateId, 
      image: $image, 
      positionX: $positionX, 
      positionY: $positionY, 
      width: $width, 
      height: $height, 
      zIndex: $zIndex,
      rotation: $rotation,
      opacity: $opacity,
      borderRadius: $borderRadius
    ) {
      template {
        uuid
        name
        images {
          uuid
          image
          positionX
          positionY
          width
          height
          zIndex
          rotation
          opacity
          borderRadius
        }
      }
    }
  }
`;

// Mutation to add a text element to a template
export const ADD_TEXT_TO_TEMPLATE = gqlClient`
  mutation AddTextToTemplate(
    $templateId: UUID!, 
    $text: String!, 
    $font: String!, 
    $fontSize: Int!, 
    $color: String!, 
    $positionX: Float!, 
    $positionY: Float!, 
    $zIndex: Int!,
    $rotation: Float!,
    $opacity: Float!
  ) {
    addTextToTemplate(
      templateId: $templateId, 
      text: $text, 
      font: $font, 
      fontSize: $fontSize, 
      color: $color, 
      positionX: $positionX, 
      positionY: $positionY, 
      zIndex: $zIndex,
      rotation: $rotation,
      opacity: $opacity
    ) {
      template {
        uuid
        name
        texts {
          uuid
          text
          font
          fontSize
          color
          positionX
          positionY
          zIndex
          rotation
          opacity
        }
      }
    }
  }
`;

// Mutation to add a shape element to a template
export const ADD_SHAPE_TO_TEMPLATE = gqlClient`
  mutation AddShapeToTemplate(
    $templateId: UUID!, 
    $shapeType: String!, 
    $color: String!, 
    $positionX: Float!, 
    $positionY: Float!, 
    $width: Float!, 
    $height: Float!, 
    $zIndex: Int!,
    $rotation: Float!,
    $opacity: Float!
  ) {
    addShapeToTemplate(
      templateId: $templateId, 
      shapeType: $shapeType, 
      color: $color, 
      positionX: $positionX, 
      positionY: $positionY, 
      width: $width, 
      height: $height, 
      zIndex: $zIndex,
      rotation: $rotation,
      opacity: $opacity
    ) {
      template {
        uuid
        name
        shapes {
          uuid
          shapeType
          color
          positionX
          positionY
          width
          height
          zIndex
          rotation
          opacity
        }
      }
    }
  }
`;

// Mutation to update a template
export const UPDATE_TEMPLATE = gqlClient`
  mutation UpdateTemplate(
    $uuid: UUID!
    $name: String
    $is_default: Boolean
    $size: String
    $background_image: String
    $thumbnail: String
    $like: Boolean
    $assignable: Boolean
  ) {
    updateTemplate(
      uuid: $uuid
      name: $name
      isDefault: $is_default
      size: $size
      backgroundImage: $background_image
      thumbnail: $thumbnail
      like: $like
      assignable: $assignable
    ) {
      template {
        uuid
        name
        isDefault
        size
        backgroundImage
        thumbnail
        like
        assignable
        createdAt
      }
    }
  }
`;

// Mutation to delete a template
export const DELETE_TEMPLATE = gqlClient`
  mutation DeleteTemplate($uuid: UUID!) {
    deleteTemplate(uuid: $uuid) {
      success
    }
  }
`;

// Mutation to update a template element
export const UPDATE_ELEMENT_IN_TEMPLATE = gqlClient`
  mutation UpdateElementInTemplate(
    $templateId: UUID!, 
    $elementUuid: UUID!, 
    $elementType: String!, 
    $updates: JSONString!
  ) {
    updateElementInTemplate(
      templateId: $templateId, 
      elementUuid: $elementUuid, 
      elementType: $elementType, 
      updates: $updates
    ) {
      template {
        uuid
        name
        images {
          uuid
          image
          positionX
          positionY
          width
          height
          zIndex
          rotation
          opacity
          borderRadius
        }
        texts {
          uuid
          text
          font
          fontSize
          color
          positionX
          positionY
          zIndex
          rotation
          opacity
        }
        shapes {
          uuid
          shapeType
          color
          positionX
          positionY
          width
          height
          zIndex
          rotation
          opacity
        }
      }
    }
  }
`;

// Mutation to delete a template element
export const DELETE_ELEMENT_FROM_TEMPLATE = gqlClient`
  mutation DeleteElementFromTemplate(
    $templateId: UUID!
    $elementUuid: UUID!
    $elementType: String!
  ) {
    deleteElementFromTemplate(
      templateId: $templateId
      elementUuid: $elementUuid
      elementType: $elementType
    ) {
      template {
        uuid
        name
        size
        isDefault
        images {
          uuid
          image
          positionX
          positionY
          width
          height
          zIndex
          rotation
          opacity
          borderRadius
        }
        texts {
          uuid
          text
          font
          fontSize
          color
          positionX
          positionY
          zIndex
          rotation
          opacity
        }
        shapes {
          uuid
          shapeType
          color
          positionX
          positionY
          width
          height
          zIndex
          rotation
          opacity
        }
      }
    }
  }
`;

// Mutation to debug element properties
export const DEBUG_ELEMENT_PROPERTIES = gqlClient`
  mutation DebugElementProperties(
    $templateId: UUID!
    $elementUuid: UUID!
    $elementType: String!
  ) {
    debugElementProperties(
      templateId: $templateId
      elementUuid: $elementUuid
      elementType: $elementType
    ) {
      elementData
      success
    }
  }
`;

// Utility function to ensure image data is properly formatted
export const processImageData = (imageData: string): string => {
  // Check if input is valid
  if (!imageData || typeof imageData !== 'string') {
    console.warn('Invalid image data received:', typeof imageData);
    return '';
  }

  try {
    // If it's already a data URL, return as is
    if (imageData.startsWith('data:')) {
      console.log('Image is already a data URL, length:', imageData.length);
      // For debugging, log a small part of the data URL
      console.log('Data URL preview:', imageData.substring(0, 50) + '...');
      return imageData;
    }
    
    // If it's an HTTP URL, return as is
    if (imageData.startsWith('http')) {
      console.log('Image is an HTTP URL:', imageData);
      return imageData;
    }

    // If it's a base64 string without the data: prefix
    if (imageData.match(/^[A-Za-z0-9+/=]+$/)) {
      // Clean the base64 string
      let cleanBase64 = imageData.replace(/\s/g, ''); // Remove whitespace
      
      // Ensure the length is a multiple of 4 by padding with =
      while (cleanBase64.length % 4 !== 0) {
        cleanBase64 += '=';
      }
      
      // Try to detect image type from the first few bytes
      let mimeType = 'image/jpeg'; // Default to JPEG
      
      // Check for PNG signature
      if (cleanBase64.startsWith('iVBORw0KGg')) {
        mimeType = 'image/png';
      }
      // Check for JPEG signature
      else if (cleanBase64.startsWith('/9j/') || cleanBase64.startsWith('/9J/')) {
        mimeType = 'image/jpeg';
      }
      // Check for SVG signature (less reliable in base64)
      else if (cleanBase64.includes('PHN2Zz') || cleanBase64.includes('PHN2Zy')) {
        mimeType = 'image/svg+xml';
      }
      
      const result = `data:${mimeType};base64,${cleanBase64}`;
      console.log(`Processed base64 image with mime type: ${mimeType}, length: ${cleanBase64.length}`);
      // For debugging, log a small part of the result
      console.log('Result preview:', result.substring(0, 50) + '...');
      return result;
    }

    // Extract the filename for better handling
    const filename = imageData.split('/').pop();
    
    // If it's a relative path, construct the URL
    const baseUrl = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' 
      ? 'https://api.aimmagic.com' 
      : 'http://localhost:8000');

    const mediaUrl = baseUrl.replace('/api/', '').replace('/graphql/', '');
    
    // Check if the path already starts with /media/
    if (imageData.startsWith('/media/')) {
      const result = `${mediaUrl}${imageData}`;
      console.log(`Constructed URL from media path: ${result}`);
      return result;
    }
    
    // Try to handle special cases for media files
    if (filename) {
      // If the filename contains media path information, extract just the filename
      const cleanFilename = filename.split('/').pop() || filename;
      
      // Try with direct URL based on environment
      const hostUrl = process.env.NODE_ENV === 'production' 
        ? 'https://api.aimmagic.com' 
        : `http://${window.location.hostname === 'localhost' ? 'localhost' : '127.0.0.1'}:8000`;
        
      const mediaPath = `${hostUrl}/media/${cleanFilename}`;
      console.log(`Constructed environment-specific URL: ${mediaPath}`);
      return mediaPath;
    }
    
    // Otherwise, assume it's a relative path that needs /media/ prefix
    const result = `${mediaUrl}/media/${imageData}`;
    console.log(`Constructed URL with media prefix: ${result}`);
    return result;
  } catch (error) {
    console.error('Error processing image data:', error);
    return '';
  }
};

// Function to fetch all templates
export const fetchAllTemplates = async (
  size: TemplateSizeType,
  page: number = 1,
  pageSize: number = 12,
  searchQuery: string = '',
  tab: string = 'all'
) => {
  try {
    const { data } = await client.query({
      query: GET_TEMPLATES,
      variables: {
        size
      }
    });

    // Handle client-side filtering and pagination
    let filteredTemplates = [...data.templates];
    
    // Filter by search query
    if (searchQuery) {
      filteredTemplates = filteredTemplates.filter(template => 
        template.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by tab
    if (tab === 'all') {
      filteredTemplates = filteredTemplates.filter(template => 
        template.isDefault
      );
      
      // Separate assignable and non-assignable templates
      const assignableTemplates = filteredTemplates.filter(template => !!template.assignable);
      const nonAssignableTemplates = filteredTemplates.filter(template => !template.assignable);
      
      // Sort assignable templates first
      filteredTemplates = [...assignableTemplates, ...nonAssignableTemplates];
    } else if (tab === 'my') {
      // Get user ID from multiple sources
      const userId = getUserIdFromMultipleSources();
      
      filteredTemplates = filteredTemplates.filter(template => 
        !template.isDefault && template.user?.id === userId
      );
    } else if (tab === 'liked') {
      filteredTemplates = filteredTemplates.filter(template => 
        template.like
      );
    }

    // Get total count before pagination
    const total = filteredTemplates.length;
    
    // Apply pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    filteredTemplates = filteredTemplates.slice(start, end);

    return {
      templates: filteredTemplates,
      total: total
    };
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
};

// Helper function to get user ID from multiple sources
const getUserIdFromMultipleSources = (): string | null => {
  let userId = null;
  
  // Try from window.__USER_ID__
  if (typeof window !== 'undefined' && (window as any).__USER_ID__) {
    userId = (window as any).__USER_ID__;
  }
  
  // Try from localStorage
  if (!userId) {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const userObj = JSON.parse(userData);
        userId = userObj.id;
      }
    } catch (e) {
      console.warn('Failed to get user ID from localStorage:', e);
    }
  }
  
  // Try from cookies
  if (!userId) {
    const userCookie = Cookies.get('user');
    if (userCookie) {
      try {
        const userObj = JSON.parse(userCookie);
        userId = userObj.id;
      } catch (e) {
        console.warn('Failed to parse user cookie:', e);
      }
    }
  }
  
  return userId;
}

// Helper function to get user info object
const getUserInfo = () => {
  const userId = getUserIdFromMultipleSources();
  if (!userId) return null;
  
  return {
    uuid: userId
  };
}

// Function to fetch a template with all its elements
export const fetchTemplateWithElements = async (uuid: string) => {
  console.log(`Fetching template with uuid: ${uuid}`);
  const { data } = await client.query({
    query: GET_TEMPLATE_WITH_ELEMENTS,
    variables: { uuid },
    fetchPolicy: 'network-only',
  });
  
  // Process numeric values to ensure they're properly converted
  const processedTemplate = { ...data.template };
  
  // Process background image if it exists and is not the default
  if (processedTemplate.backgroundImage && processedTemplate.backgroundImage !== 'no_image.jpg') {
    processedTemplate.backgroundImage = processImageData(processedTemplate.backgroundImage);
  }
  
  // Process thumbnail if it exists
  if (processedTemplate.thumbnail) {
    // For thumbnails, we can just directly use them if they are data URLs
    if (!processedTemplate.thumbnail.startsWith('data:')) {
      processedTemplate.thumbnail = processImageData(processedTemplate.thumbnail);
    }
  }
  
  // Process shapes
  if (processedTemplate.shapes && processedTemplate.shapes.length > 0) {
    processedTemplate.shapes = processedTemplate.shapes.map((shape: any) => {
      // Check for potential issues
      if (shape.positionX === 0 && shape.positionY === 0) {
        console.log(`Warning: Shape ${shape.uuid} has position (0,0) in the database`);
      }
      
      return {
        ...shape,
        positionX: shape.positionX !== null ? Number(shape.positionX) : 0,
        positionY: shape.positionY !== null ? Number(shape.positionY) : 0,
        width: shape.width !== null ? Number(shape.width) : 100,
        height: shape.height !== null ? Number(shape.height) : 100,
        zIndex: shape.zIndex !== null ? parseInt(String(shape.zIndex)) : 0,
        rotation: shape.rotation !== null ? Number(shape.rotation) : 0,
        opacity: shape.opacity !== null ? Number(shape.opacity) : 1.0
      };
    });
  }
  
  // Process texts
  if (processedTemplate.texts && processedTemplate.texts.length > 0) {
    processedTemplate.texts = processedTemplate.texts.map((text: any) => {
      // Check for potential issues
      if (text.positionX === 0 && text.positionY === 0) {
        console.log(`Warning: Text ${text.uuid} has position (0,0) in the database`);
      }
      
      return {
        ...text,
        positionX: text.positionX !== null ? Number(text.positionX) : 0,
        positionY: text.positionY !== null ? Number(text.positionY) : 0,
        fontSize: text.fontSize !== null ? Number(text.fontSize) : 16,
        zIndex: text.zIndex !== null ? parseInt(String(text.zIndex)) : 0,
        rotation: text.rotation !== null ? Number(text.rotation) : 0,
        opacity: text.opacity !== null ? Number(text.opacity) : 1.0
      };
    });
  }
  
  // Process images
  if (processedTemplate.images && processedTemplate.images.length > 0) {
    processedTemplate.images = processedTemplate.images.map((image: any) => {
      // Check for potential issues
      if (image.positionX === 0 && image.positionY === 0) {
        console.log(`Warning: Image ${image.uuid} has position (0,0) in the database`);
      }
      
      return {
        ...image,
        positionX: image.positionX !== null ? Number(image.positionX) : 0,
        positionY: image.positionY !== null ? Number(image.positionY) : 0,
        width: image.width !== null ? Number(image.width) : 100,
        height: image.height !== null ? Number(image.height) : 100,
        zIndex: image.zIndex !== null ? parseInt(String(image.zIndex)) : 0,
        rotation: image.rotation !== null ? Number(image.rotation) : 0,
        opacity: image.opacity !== null ? Number(image.opacity) : 1.0,
        borderRadius: image.borderRadius !== null ? Number(image.borderRadius) : 0
      };
    });
  }
  
  return processedTemplate;
};

// Function to create a template
export const createTemplate = async (templateData: Partial<Template>): Promise<Template> => {
  try {
    console.log('Creating new template with data:', templateData);
    
    // Get token
    const token = Cookies.get('token');
    if (!token) {
      console.error('Authentication token not found');
      throw new Error('Authentication token not found');
    }

    // Get user info to ensure it's included in the template
    const userInfo = getUserInfo();
    console.log('User info for new template:', userInfo);
    
    if (!userInfo || !userInfo.uuid) {
      console.error('User information missing or invalid');
      throw new Error('User information is required to create a template');
    }

    // Create API URL
    const createUrl = `${baseURL}designs/templates/`;
    console.log(`Create template API URL: ${createUrl}`);
    
    // Ensure user field is set in the template data
    const enrichedTemplateData = {
      ...templateData,
      userId: userInfo.uuid, // Make sure userId field is explicitly set
    };
    
    console.log('Sending template data with user:', enrichedTemplateData);

    // Make the request
    const response = await fetch(createUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(enrichedTemplateData)
    });
    
    console.log(`Create template response status: ${response.status}`);
    
    // Handle errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Create template error response text: ${errorText}`);
      throw new Error(`Failed to create template: ${response.status} ${response.statusText}`);
    }
    
    const newTemplate = await response.json();
    console.log('Create template response:', newTemplate);
    
    return newTemplate;
  } catch (error) {
    console.error('Error creating template:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to create template: ${error.message}`);
    }
    throw error;
  }
};

// Function to add an image asset to template
export const createImageAsset = async (
  templateId: string,
  imageUrl: string,
  positionX: number = 500,
  positionY: number = 500,
  width: number = 100,
  height: number = 100,
  zIndex: number = 0,
  rotation: number = 0,
  opacity: number = 1.0,
  borderRadius: number = 0
) => {
  try {
    // Ensure the user is authenticated
    const token = Cookies.get('token');
    if (!token) {
      console.error('User not authenticated');
      throw new Error('User not authenticated');
    }

    // Make the GraphQL request
    const result = await client.mutate({
      mutation: gqlClient`
        mutation AddImageToTemplate(
          $templateId: UUID!
          $image: String!
          $positionX: Float
          $positionY: Float
          $width: Float
          $height: Float
          $zIndex: Int
          $rotation: Float
          $opacity: Float
          $borderRadius: Float
        ) {
          addImageToTemplate(
            templateId: $templateId
            image: $image
            positionX: $positionX
            positionY: $positionY
            width: $width
            height: $height
            zIndex: $zIndex
            rotation: $rotation
            opacity: $opacity
            borderRadius: $borderRadius
          ) {
            template {
              uuid
              name
              size
              backgroundImage
              like
              images {
                uuid
                image
                positionX
                positionY
                width
                height
                zIndex
                rotation
                opacity
                borderRadius
              }
              texts {
                uuid
                text
                font
                fontSize
                color
                positionX
                positionY
                zIndex
                rotation
                opacity
              }
              shapes {
                uuid
                shapeType
                color
                positionX
                positionY
                width
                height
                zIndex
                rotation
                opacity
              }
            }
          }
        }
      `,
      variables: {
        templateId,
        image: imageUrl,
        positionX,
        positionY,
        width,
        height,
        zIndex,
        rotation,
        opacity,
        borderRadius
      },
      context: {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    });

    return result.data.addImageToTemplate.template;
  } catch (error) {
    console.error('Error creating image asset:', error);
    throw error;
  }
};

// Function to add a text element to template
export const createTextElement = async (
  templateId: string,
  text: string,
  font: string = 'Arial',
  fontSize: number = 100,
  color: string = '#000000',
  positionX: number = 500,
  positionY: number = 500,
  zIndex: number = 0,
  rotation: number = 0,
  opacity: number = 1.0
) => {
  try {
    // First, get the current template to preserve the background image
    const currentTemplate = await fetchTemplateWithElements(templateId);
    const backgroundImage = currentTemplate.backgroundImage;
    
    const { data } = await client.mutate({
      mutation: ADD_TEXT_TO_TEMPLATE,
      variables: { 
        templateId,
        text,
        font,
        fontSize: Number(fontSize), 
        color,
        positionX: Number(positionX), 
        positionY: Number(positionY),
        zIndex: parseInt(String(zIndex)),
        rotation: Number(rotation),
        opacity: Number(opacity)
      },
    });

    // Ensure the background image is preserved in the returned template
    if (backgroundImage && backgroundImage !== 'no_image.jpg' && 
        (!data.addTextToTemplate.template.backgroundImage || 
         data.addTextToTemplate.template.backgroundImage === 'no_image.jpg')) {
      data.addTextToTemplate.template.backgroundImage = backgroundImage;
      
      // Update the template with the preserved background image
      await client.mutate({
        mutation: UPDATE_TEMPLATE,
        variables: {
          uuid: templateId,
          background_image: backgroundImage
        }
      });
    }
    
    return data.addTextToTemplate.template;
  } catch (error) {
    console.error('Error creating text element:', error);
    throw error;
  }
};

// Function to add a shape element to template
export const createShapeElement = async (
  templateId: string,
  shapeType: string,
  color: string = '#000000',
  positionX: number = 500,
  positionY: number = 500,
  width: number = 100,
  height: number = 100,
  zIndex: number = 0,
  rotation: number = 0,
  opacity: number = 1.0
) => {
  // Ensure shapeType is valid
  if (!shapeType || shapeType.trim() === '') {
    shapeType = 'rectangle'; // Default to rectangle if no valid type
  }

  // Ensure position values are never null or NaN
  const validPositionX = positionX !== null && positionX !== undefined && !isNaN(Number(positionX)) 
    ? Number(positionX) 
    : 0;
  
  const validPositionY = positionY !== null && positionY !== undefined && !isNaN(Number(positionY)) 
    ? Number(positionY) 
    : 0;
  
  // Ensure other numeric values are valid
  const validWidth = width !== null && width !== undefined && !isNaN(Number(width)) 
    ? Number(width) 
    : 100;
  
  const validHeight = height !== null && height !== undefined && !isNaN(Number(height)) 
    ? Number(height) 
    : 100;
  
  const validZIndex = zIndex !== null && zIndex !== undefined && !isNaN(Number(zIndex)) 
    ? parseInt(String(zIndex)) 
    : 0;
  
  const validRotation = rotation !== null && rotation !== undefined && !isNaN(Number(rotation)) 
    ? Number(rotation) 
    : 0;
    
  const validOpacity = opacity !== null && opacity !== undefined && !isNaN(Number(opacity)) 
    ? Number(opacity) 
    : 1.0;
  
  try {
    console.log(`Creating shape with positionX: ${validPositionX}, positionY: ${validPositionY}`);
    
    // First, get the current template to preserve the background image
    const currentTemplate = await fetchTemplateWithElements(templateId);
    const backgroundImage = currentTemplate.backgroundImage;
    
    const { data } = await client.mutate({
      mutation: ADD_SHAPE_TO_TEMPLATE,
      variables: { 
        templateId,
        shapeType,  // Use the provided shapeType
        color,
        positionX: validPositionX, // Use validated position X
        positionY: validPositionY, // Use validated position Y
        width: validWidth,
        height: validHeight,
        zIndex: validZIndex,
        rotation: validRotation,
        opacity: validOpacity
      },
    });

    // Ensure the background image is preserved in the returned template
    if (backgroundImage && backgroundImage !== 'no_image.jpg' && 
        (!data.addShapeToTemplate.template.backgroundImage || 
         data.addShapeToTemplate.template.backgroundImage === 'no_image.jpg')) {
      data.addShapeToTemplate.template.backgroundImage = backgroundImage;
      
      // Update the template with the preserved background image
      await client.mutate({
        mutation: UPDATE_TEMPLATE,
        variables: {
          uuid: templateId,
          background_image: backgroundImage
        }
      });
    }
    
    return data.addShapeToTemplate.template;
  } catch (error) {
    console.error('Error creating shape:', error);
    throw error;
  }
};

// Function to update an element in a template
export const updateElementInTemplate = async (
  templateId: string,
  elementUuid: string,
  elementType: 'image' | 'text' | 'shape',
  updates: any
) => {
  try {
    console.log(`Updating ${elementType} element: ${elementUuid} with updates:`, updates);
    
    // Ensure the updates contain valid property names
    const updatesToSend = { ...updates };
    
    // Convert property names to match the API convention if needed
    if ('positionX' in updatesToSend) {
      // Update for backward compatibility with front-end naming
      updatesToSend.positionX = Number(updatesToSend.positionX);
    }
    
    if ('positionY' in updatesToSend) {
      // Update for backward compatibility with front-end naming
      updatesToSend.positionY = Number(updatesToSend.positionY);
    }
    
    if ('zIndex' in updatesToSend) {
      // Update for backward compatibility with front-end naming
      updatesToSend.zIndex = parseInt(String(updatesToSend.zIndex));
    }
    
    if ('shapeType' in updatesToSend) {
      // Update for backward compatibility with front-end naming
      // updatesToSend.shapeType = updatesToSend.shapeType;
    }
    
    // Special handling for text elements and fontSize
    if (elementType === 'text') {
      // Ensure fontSize is always included for text elements
      if ('fontSize' in updatesToSend) {
        const rawFontSize = updatesToSend.fontSize;
        updatesToSend.fontSize = parseInt(String(updatesToSend.fontSize));
        
        // Handle invalid values
        if (isNaN(updatesToSend.fontSize) || updatesToSend.fontSize <= 0) {
          updatesToSend.fontSize = 50; // Sensible default
          console.warn(`Invalid fontSize value: ${rawFontSize}, using default: 50`);
        }
        
        console.log(`Setting fontSize to: ${updatesToSend.fontSize} (from: ${rawFontSize})`);
      } else if (updates.fontSize) {
        // Try to get fontSize from the updates object directly
        const rawFontSize = updates.fontSize;
        updatesToSend.fontSize = parseInt(String(updates.fontSize));
        
        // Handle invalid values
        if (isNaN(updatesToSend.fontSize) || updatesToSend.fontSize <= 0) {
          updatesToSend.fontSize = 50; // Sensible default
          console.warn(`Invalid fontSize value: ${rawFontSize}, using default: 50`);
        }
        
        console.log(`Retrieved fontSize from updates: ${updatesToSend.fontSize} (from: ${rawFontSize})`);
      } else {
        // If no fontSize is found, set a reasonable default
        updatesToSend.fontSize = 50;
        console.log(`No fontSize found, using default: ${updatesToSend.fontSize}`);
      }
      
      // Clamp fontSize to reasonable limits
      updatesToSend.fontSize = Math.max(8, Math.min(500, updatesToSend.fontSize));
      console.log(`Final fontSize after clamping: ${updatesToSend.fontSize}`);
    }
    
    if ('width' in updatesToSend) {
      updatesToSend.width = Number(updatesToSend.width);
    }
    
    if ('height' in updatesToSend) {
      updatesToSend.height = Number(updatesToSend.height);
    }
    
    if ('rotation' in updatesToSend) {
      updatesToSend.rotation = Number(updatesToSend.rotation);
    }
    
    if ('opacity' in updatesToSend) {
      updatesToSend.opacity = Number(updatesToSend.opacity);
    } else {
      // Ensure opacity is always sent with a default value if missing
      updatesToSend.opacity = 1.0;
    }
    
    // Convert the updates to a JSON string (GraphQL requirement)
    const updatesJson = JSON.stringify(updatesToSend);
    
    console.log(`Sending ${elementType} element updates to server:`, updatesJson);
    
    const { data } = await client.mutate({
      mutation: UPDATE_ELEMENT_IN_TEMPLATE,
      variables: {
        templateId,
        elementUuid,
        elementType,
        updates: updatesJson
      }
    });
    
    console.log(`Updated ${elementType} element successfully`);
    return data.updateElementInTemplate.template;
  } catch (error) {
    console.error(`Error updating ${elementType} element:`, error);
    throw error;
  }
};

// Function to delete an element from a template
export const deleteElementFromTemplate = async (
  templateId: string,
  elementUuid: string,
  elementType: 'image' | 'text' | 'shape'
) => {
  try {
    // First, get the current template to preserve the background image
    const currentTemplate = await fetchTemplateWithElements(templateId);
    const backgroundImage = currentTemplate.backgroundImage;
    
    const { data } = await client.mutate({
      mutation: DELETE_ELEMENT_FROM_TEMPLATE,
      variables: { templateId, elementUuid, elementType },
    });
    
    // Ensure the background image is preserved in the returned template
    if (backgroundImage && backgroundImage !== 'no_image.jpg' && 
        (!data.deleteElementFromTemplate.template.backgroundImage || 
         data.deleteElementFromTemplate.template.backgroundImage === 'no_image.jpg')) {
      data.deleteElementFromTemplate.template.backgroundImage = backgroundImage;
      
      // Update the template with the preserved background image
      await client.mutate({
        mutation: UPDATE_TEMPLATE,
        variables: {
          uuid: templateId,
          background_image: backgroundImage
        }
      });
    }
    
    return data.deleteElementFromTemplate.template;
  } catch (error) {
    console.error('Error deleting element:', error);
    throw error;
  }
};

// Function to update a template
export const updateTemplate = async (uuid: string, updates: any) => {
  console.log(`Updating template ${uuid} with:`, updates);
  
  const { data } = await client.mutate({
    mutation: UPDATE_TEMPLATE,
    variables: { uuid, ...updates },
  });
  
  // Process the template data to ensure all position values are numbers
  const template = data.updateTemplate.template;
  
  // Process shapes
  if (template.shapes) {
    template.shapes = template.shapes.map((shape: any) => ({
      ...shape,
      positionX: shape.positionX !== null ? Number(shape.positionX) : 0,
      positionY: shape.positionY !== null ? Number(shape.positionY) : 0,
      width: shape.width !== null ? Number(shape.width) : 100,
      height: shape.height !== null ? Number(shape.height) : 100,
      zIndex: shape.zIndex !== null ? parseInt(String(shape.zIndex)) : 0,
      rotation: shape.rotation !== null ? Number(shape.rotation) : 0,
      opacity: shape.opacity !== null ? Number(shape.opacity) : 1.0,
      shapeType: shape.shapeType || 'rectangle'
    }));
  }
  
  // Process texts
  if (template.texts) {
    template.texts = template.texts.map((text: any) => ({
      ...text,
      positionX: text.positionX !== null ? Number(text.positionX) : 0,
      positionY: text.positionY !== null ? Number(text.positionY) : 0,
      fontSize: text.fontSize !== null ? Number(text.fontSize) : 16,
      zIndex: text.zIndex !== null ? parseInt(String(text.zIndex)) : 0,
      rotation: text.rotation !== null ? Number(text.rotation) : 0,
      opacity: text.opacity !== null ? Number(text.opacity) : 1.0
    }));
  }
  
  // Process images
  if (template.images) {
    template.images = template.images.map((image: any) => ({
      ...image,
      positionX: image.positionX !== null ? Number(image.positionX) : 0,
      positionY: image.positionY !== null ? Number(image.positionY) : 0,
      width: image.width !== null ? Number(image.width) : 100,
      height: image.height !== null ? Number(image.height) : 100,
      zIndex: image.zIndex !== null ? parseInt(String(image.zIndex)) : 0,
      rotation: image.rotation !== null ? Number(image.rotation) : 0,
      opacity: image.opacity !== null ? Number(image.opacity) : 1.0,
      borderRadius: image.borderRadius !== null ? Number(image.borderRadius) : 0
    }));
  }
  
  return template;
};

// Function to delete a template
export const deleteTemplate = async (uuid: string) => {
  const { data } = await client.mutate({
    mutation: DELETE_TEMPLATE,
    variables: { uuid },
  });
  return data.deleteTemplate.success;
};

// Function to debug element properties
export const debugElementProperties = async (
  templateId: string,
  elementUuid: string,
  elementType: 'image' | 'text' | 'shape'
) => {
  const { data } = await client.mutate({
    mutation: DEBUG_ELEMENT_PROPERTIES,
    variables: { templateId, elementUuid, elementType },
  });
  return data.debugElementProperties;
};

// Function to fetch all templates using REST API (alternative to GraphQL)
export const fetchTemplatesREST = async (size?: string) => {
  try {
    const token = Cookies.get('token');
    const params = size ? { size } : {};
    
    const response = await axios({
      method: 'get',
      url: `${baseURL}designs/templates/`,
      params,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    // Process the response data to match the expected template format
    const templates = response.data.map((template: any) => {
      // Process image assets - ensure numeric properties are properly converted to numbers
      const images = (template.image_assets || []).map((img: any) => ({
        uuid: img.uuid,
        image: img.image,
        positionX: Number(img.position_x),
        positionY: Number(img.position_y),
        width: Number(img.width),
        height: Number(img.height),
        zIndex: Number(img.z_index),
        rotation: Number(img.rotation || 0),
        opacity: Number(img.opacity || 1.0),
        borderRadius: Number(img.border_radius || 0)
      }));
      
      // Process text elements - ensure numeric properties are properly converted to numbers
      const texts = (template.text_elements || []).map((text: any) => ({
        uuid: text.uuid,
        text: text.text,
        font: text.font,
        fontSize: Number(text.font_size),
        color: text.color,
        positionX: Number(text.position_x),
        positionY: Number(text.position_y),
        zIndex: Number(text.z_index),
        rotation: Number(text.rotation || 0),
        opacity: Number(text.opacity || 1.0)
      }));

      // Process shape elements - ensure numeric properties are properly converted to numbers
      const shapes = (template.shape_elements || []).map((shape: any) => ({
        uuid: shape.uuid,
        shapeType: shape.shape_type,
        color: shape.color,
        positionX: Number(shape.position_x),
        positionY: Number(shape.position_y),
        width: Number(shape.width),
        height: Number(shape.height),
        zIndex: Number(shape.z_index),
        rotation: Number(shape.rotation || 0),
        opacity: Number(shape.opacity || 1.0)
      }));

      return {
        uuid: template.uuid,
        name: template.name,
        isDefault: template.is_default,
        size: template.size,
        backgroundImage: template.background_image,
        createdAt: template.created_at,
        imageAssets: images,
        textElements: texts,
        shapeElements: shapes,
        // For backward compatibility
        images: template.images || [],
        texts: template.texts || [],
        shapes: template.shapes || []
      };
    });
    
    console.log('Processed templates from REST API:', templates);
    return templates;
  } catch (error) {
    console.error('Error fetching templates from REST API:', error);
    throw error;
  }
};

// Function to copy a template with all its elements
export const copyTemplate = async (sourceTemplateId: string, newName: string, userId: string) => {
  try {
    // Fetch the source template with all elements
    const sourceTemplate = await fetchTemplateWithElements(sourceTemplateId);
    
    console.log('Copying template:', sourceTemplate);
    console.log('Source template size:', sourceTemplate.size);
    
    // Make sure the size is correct format and not undefined
    const templateSize = sourceTemplate.size === '1080x1920' ? '1080x1920' : '1080x1080';
    console.log('Using template size:', templateSize);
    
    // Get user info
    const userInfo = getUserInfo();
    if (!userInfo) {
      throw new Error('User information is required to copy a template');
    }
    
    // Create a new template with the same properties
    const newTemplate = await createTemplate({
      name: newName,
      size: templateSize, // Use our validated size
      backgroundImage: sourceTemplate.backgroundImage,
      user: { id: userId }, // Pass as object with id field based on the type error
      isDefault: false // Not a default template
    });
    
    console.log('New template created with ID:', newTemplate.uuid);
    console.log('New template size after creation:', newTemplate.size);
    
    // Immediately update the template to ensure correct size
    console.log('Explicitly setting template size to:', templateSize);
    await client.mutate({
      mutation: UPDATE_TEMPLATE,
      variables: {
        uuid: newTemplate.uuid,
        size: templateSize
      }
    });
    
    // Copy all text elements
    if (sourceTemplate.texts && sourceTemplate.texts.length > 0) {
      for (const text of sourceTemplate.texts) {
        await createTextElement(
          newTemplate.uuid,
          text.text,
          text.font,
          text.fontSize,
          text.color,
          text.positionX,
          text.positionY,
          text.zIndex,
          text.rotation,
          text.opacity
        );
      }
    }
    
    // Copy all image elements
    if (sourceTemplate.images && sourceTemplate.images.length > 0) {
      for (const image of sourceTemplate.images) {
        await createImageAsset(
          newTemplate.uuid,
          image.image,
          image.positionX,
          image.positionY,
          image.width,
          image.height,
          image.zIndex,
          image.rotation,
          image.opacity,
          image.borderRadius
        );
      }
    }
    
    // Copy all shape elements
    if (sourceTemplate.shapes && sourceTemplate.shapes.length > 0) {
      for (const shape of sourceTemplate.shapes) {
        await createShapeElement(
          newTemplate.uuid,
          shape.shapeType,
          shape.color,
          shape.positionX,
          shape.positionY,
          shape.width,
          shape.height,
          shape.zIndex,
          shape.rotation,
          shape.opacity
        );
      }
    }
    
    // Double-check size after all elements are added
    const finalTemplate = await fetchTemplateWithElements(newTemplate.uuid);
    if (finalTemplate.size !== templateSize) {
      console.log('Final size check - fixing template size from', finalTemplate.size, 'to', templateSize);
      await updateTemplate(newTemplate.uuid, { 
        size: templateSize 
      });
    }
    
    // Fetch the final template with all copied elements and correct size
    return await fetchTemplateWithElements(newTemplate.uuid);
  } catch (error) {
    console.error('Error copying template:', error);
    throw error;
  }
};

// Function to create a user asset (independent of templates)
export const createUserAsset = async (
  imageUrl: string,
  name?: string,
  thumbnail?: string
) => {
  try {
    // Ensure the user is authenticated
    const token = Cookies.get('token');
    if (!token) {
      console.error('User not authenticated');
      throw new Error('User not authenticated');
    }

    // Try multiple sources to get the user ID
    let userId;
    
    // First try from the user_id cookie
    const userIdCookie = Cookies.get('user_id');
    if (userIdCookie) {
      userId = userIdCookie;
    } else {
      // Try from the window.__USER_ID__ property that may be set by components
      if (typeof window !== 'undefined' && (window as any).__USER_ID__) {
        userId = (window as any).__USER_ID__;
      }
      
      // Try from userData cookie (which contains the user object)
      if (!userId) {
        const userDataCookie = Cookies.get('userData');
        if (userDataCookie) {
          try {
            const userData = JSON.parse(userDataCookie);
            if (userData && userData.id) {
              userId = userData.id;
            }
          } catch (error) {
            console.warn('Error parsing userData cookie:', error);
          }
        }
      }
      
      // If still no user ID, try to get it from localStorage
      if (!userId) {
        const userDataString = localStorage.getItem('userData');
        if (userDataString) {
          try {
            const userData = JSON.parse(userDataString);
            if (userData && userData.id) {
              userId = userData.id;
            }
          } catch (error) {
            console.warn('Error parsing userData from localStorage:', error);
          }
        }
      }
      
      // Try to get from auth Redux store via window.__REDUX_STATE__
      if (!userId && typeof window !== 'undefined' && (window as any).__REDUX_STATE__) {
        try {
          const reduxState = (window as any).__REDUX_STATE__;
          if (reduxState.auth && reduxState.auth.user && 
              reduxState.auth.user.profile && 
              reduxState.auth.user.profile.user && 
              reduxState.auth.user.profile.user.id) {
            userId = reduxState.auth.user.profile.user.id;
          }
        } catch (error) {
          console.warn('Error accessing Redux state:', error);
        }
      }
    }
    
    // If we still don't have a user ID, we can't create the asset
    if (!userId) {
      console.error('User ID not found in any storage location, cannot create asset');
      throw new Error('User ID not found');
    }

    // Make the GraphQL request
    const result = await client.mutate({
      mutation: gqlClient`
        mutation CreateUserAsset(
          $userId: UUID!
          $image: String!
          $name: String
          $thumbnail: String
        ) {
          createUserAsset(
            userId: $userId
            image: $image
            name: $name
            thumbnail: $thumbnail
          ) {
            asset {
              uuid
              image
              name
              thumbnail
              createdAt
            }
          }
        }
      `,
      variables: {
        userId,
        image: imageUrl,
        name,
        thumbnail
      },
      context: {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    });

    return result.data.createUserAsset.asset;
  } catch (error) {
    console.error('Error creating user asset:', error);
    throw error;
  }
};

// Function to get all user assets
export const getUserAssets = async () => {
  try {
    // Ensure the user is authenticated
    const token = Cookies.get('token');
    if (!token) {
      console.error('User not authenticated');
      throw new Error('User not authenticated');
    }

    // Try multiple sources to get the user ID
    let userId;
    
    // First try from the user_id cookie
    const userIdCookie = Cookies.get('user_id');
    if (userIdCookie) {
      userId = userIdCookie;
    } else {
      // Try from the window.__USER_ID__ property that may be set by components
      if (typeof window !== 'undefined' && (window as any).__USER_ID__) {
        userId = (window as any).__USER_ID__;
      }
      
      // Try from userData cookie (which contains the user object)
      if (!userId) {
        const userDataCookie = Cookies.get('userData');
        if (userDataCookie) {
          try {
            const userData = JSON.parse(userDataCookie);
            if (userData && userData.id) {
              userId = userData.id;
            }
          } catch (error) {
            console.warn('Error parsing userData cookie:', error);
          }
        }
      }
      
      // If still no user ID, try to get it from localStorage
      if (!userId) {
        const userDataString = localStorage.getItem('userData');
        if (userDataString) {
          try {
            const userData = JSON.parse(userDataString);
            if (userData && userData.id) {
              userId = userData.id;
            }
          } catch (error) {
            console.warn('Error parsing userData from localStorage:', error);
          }
        }
      }
      
      // Try to get from auth Redux store via window.__REDUX_STATE__
      if (!userId && typeof window !== 'undefined' && (window as any).__REDUX_STATE__) {
        try {
          const reduxState = (window as any).__REDUX_STATE__;
          if (reduxState.auth && reduxState.auth.user && 
              reduxState.auth.user.profile && 
              reduxState.auth.user.profile.user && 
              reduxState.auth.user.profile.user.id) {
            userId = reduxState.auth.user.profile.user.id;
          }
        } catch (error) {
          console.warn('Error accessing Redux state:', error);
        }
      }
    }
    
    // If we still don't have a user ID, return an empty array
    if (!userId) {
      console.warn('User ID not found in any storage location, returning empty assets list');
      return [];
    }

    // Make the GraphQL request
    const result = await client.query({
      query: gqlClient`
        query GetUserAssets($userId: UUID!) {
          userAssets(userId: $userId) {
            uuid
            image
            name
            thumbnail
            createdAt
          }
        }
      `,
      variables: {
        userId
      },
      context: {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
      fetchPolicy: 'network-only' // Don't use cache for this query
    });

    return result.data.userAssets as UserAsset[];
  } catch (error) {
    console.error('Error fetching user assets:', error);
    // Return empty array instead of throwing to avoid breaking the UI
    return [];
  }
};

/**
 * Helper function to construct consistent API URLs
 * @param baseUrl - The base URL from environment
 * @param endpoint - The API endpoint path
 * @returns Properly formatted URL
 */
export const formatApiUrl = (baseUrl: string, endpoint: string): string => {
  // Clean up input values
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  console.log(`formatApiUrl: base="${cleanBase}", endpoint="${cleanEndpoint}"`);
  
  // Check if baseUrl already includes the API path
  const apiPrefix = '/api';
  const hasApiPrefix = cleanBase.endsWith(apiPrefix);
  
  let resultUrl;
  if (hasApiPrefix) {
    // Base already includes /api, just append the endpoint
    resultUrl = `${cleanBase}${cleanEndpoint}`;
  } else {
    // Add /api before the endpoint
    resultUrl = `${cleanBase}${apiPrefix}${cleanEndpoint}`;
  }
  
  console.log(`formatApiUrl result: ${resultUrl}`);
  return resultUrl;
};

/**
 * Get templates from REST API endpoint (replacing GraphQL)
 * @param filterType - Type of filter to apply: 'default', 'my', 'liked'
 * @param size - Optional size filter
 * @param search - Optional search query for template name
 * @returns Promise<Template[]> - List of templates
 */
export const getTemplatesREST = async (
  filterType: string = 'default',
  size?: string,
  search?: string
): Promise<any[]> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('tab', filterType);
    
    if (size) {
      params.append('size', size);
    }
    
    if (search) {
      params.append('search', search);
    }
    
    // Get the API URL with query parameters using the helper
    const apiUrl = formatApiUrl(baseURL, `templates/?${params.toString()}`);
    console.log('API URL for templates:', apiUrl);
    
    // Get authentication token
    const token = Cookies.get('token');
    
    // Make the API request
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Handle non-200 responses
    if (!response.ok) {
      throw new Error(`Failed to fetch templates: ${response.status} ${response.statusText}`);
    }
    
    // Parse the response
    const data = await response.json();
    console.log('Raw template data from API:', data);
    
    // Process the response data to match the expected template format
    const templates = data.map((template: any) => {
      // Process image assets - ensure numeric properties are properly converted to numbers
      const images = (template.image_assets || []).map((img: any) => ({
        uuid: img.uuid,
        image: img.image,
        positionX: Number(img.position_x),
        positionY: Number(img.position_y),
        width: Number(img.width),
        height: Number(img.height),
        zIndex: Number(img.z_index),
        rotation: Number(img.rotation || 0),
        opacity: Number(img.opacity || 1.0),
        borderRadius: Number(img.border_radius || 0)
      }));
      
      // Process text elements - ensure numeric properties are properly converted to numbers
      const texts = (template.text_elements || []).map((text: any) => ({
        uuid: text.uuid,
        text: text.text,
        font: text.font,
        fontSize: Number(text.font_size),
        color: text.color,
        positionX: Number(text.position_x),
        positionY: Number(text.position_y),
        zIndex: Number(text.z_index),
        rotation: Number(text.rotation || 0),
        opacity: Number(text.opacity || 1.0)
      }));
      
      // Process shape elements - ensure numeric properties are properly converted to numbers
      const shapes = (template.shape_elements || []).map((shape: any) => ({
        uuid: shape.uuid,
        shapeType: shape.shape_type,
        color: shape.color,
        positionX: Number(shape.position_x),
        positionY: Number(shape.position_y),
        width: Number(shape.width),
        height: Number(shape.height),
        zIndex: Number(shape.z_index),
        rotation: Number(shape.rotation || 0),
        opacity: Number(shape.opacity || 1.0)
      }));
      
      return {
        uuid: template.uuid,
        name: template.name,
        isDefault: template.is_default,
        size: template.size,
        backgroundImage: template.background_image,
        thumbnail: template.thumbnail,
        createdAt: template.created_at,
        like: template.like,
        assignable: template.assignable,
        user: template.user,
        // Use the properly processed arrays with numeric values
        images,
        texts,
        shapes
      };
    });
    
    console.log('Processed templates with proper numeric values:', templates);
    return templates;
  } catch (error) {
    console.error('Error fetching templates via REST API:', error);
    throw error;
  }
};

// Replace the original getTemplates implementation to use the REST API instead of GraphQL
export const getTemplates = async (filterType: string = 'default', size?: string, search?: string) => {
  // Simply call our new REST implementation
  return getTemplatesREST(filterType, size, search);
};

/**
 * Copy a default template and return the new template
 * @param templateUuid - UUID of the template to copy
 * @param newName - Name for the new template
 * @returns Promise<Template> - New template created
 */
export const copyDefaultTemplate = async (templateUuid: string, newName?: string): Promise<any> => {
  try {
    console.log(`Copying default template ${templateUuid} with name "${newName}"`);
    
    // Get token
    const token = Cookies.get('token');
    if (!token) {
      console.error('Authentication token not found');
      throw new Error('Authentication token not found');
    }
    
    // Fix the URL construction to ensure it's correct - using direct format
    // We're seeing an issue with the formatApiUrl function, so let's construct it directly
    const copyUrl = `${baseURL}designs/templates/${templateUuid}/copy/`;
    console.log(`Copy template API URL: ${copyUrl}`);
    
    // Make the request
    const response = await fetch(copyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: newName || `Copy of template ${templateUuid}`
      })
    });
    
    console.log(`Copy template response status: ${response.status}`);
    console.log('Copy template response headers:', { 
      'content-type': response.headers.get('content-type'),
      'content-length': response.headers.get('content-length')
    });
    
    // Handle errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Copy template error response text: ${errorText}`);
      throw new Error(`Failed to copy template: ${response.status} ${response.statusText}`);
    }
    
    // Get full response text for debugging
    const responseText = await response.text();
    console.log(`Copy template raw response: ${responseText}`);
    
    // Parse the response text to JSON (twice since we already consumed the body)
    let newTemplate;
    try {
      newTemplate = JSON.parse(responseText);
      console.log(`Copy template parsed JSON:`, newTemplate);
        } catch (error) {
      const parseError = error as Error;
      console.error(`Error parsing JSON response:`, parseError);
      console.error(`Response that failed to parse:`, responseText);
      throw new Error(`Failed to parse template copy response: ${parseError.message}`);
    }
    
    // Validate the response
    if (!newTemplate || !newTemplate.uuid) {
      console.error('Invalid template copy response, missing UUID:', newTemplate);
      throw new Error('Template copy response is missing UUID');
    }
    
    console.log(`Copy template successful. New template UUID: ${newTemplate.uuid}`);
    
    return newTemplate;
  } catch (error) {
    console.error('Error copying default template:', error);
    // Rethrow with more details
    if (error instanceof Error) {
      throw new Error(`Failed to copy template: ${error.message}`);
    }
    throw error;
  }
}; 