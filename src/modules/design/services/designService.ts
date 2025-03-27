import { ApolloClient, InMemoryCache, gql, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Cookies from 'js-cookie';
import axios from 'axios';
import { baseURL, graphqlURL } from 'types/baseUrl';
import { Template, ElementType, ImageAsset, TextElement, ShapeElement, UserAsset } from '../types';

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
});

// Query to get all templates
export const GET_ALL_TEMPLATES = gql`
  query GetAllTemplates($size: String) {
    templates(size: $size) {
      uuid
      name
      isDefault
      size
      backgroundImage
      like
      createdAt
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
export const GET_TEMPLATE_WITH_ELEMENTS = gql`
  query GetTemplateWithElements($uuid: UUID!) {
    template(uuid: $uuid) {
      uuid
      name
      isDefault
      size
      backgroundImage
      like
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
export const CREATE_TEMPLATE = gql`
  mutation CreateTemplate($name: String!, $size: String!, $userId: UUID!, $isDefault: Boolean, $backgroundImage: String) {
    createTemplate(name: $name, size: $size, userId: $userId, isDefault: $isDefault, backgroundImage: $backgroundImage) {
      template {
        uuid
        name
        isDefault
        size
        backgroundImage
        createdAt
      }
    }
  }
`;

// Mutation to add an image to a template
export const ADD_IMAGE_TO_TEMPLATE = gql`
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
export const ADD_TEXT_TO_TEMPLATE = gql`
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
export const ADD_SHAPE_TO_TEMPLATE = gql`
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
export const UPDATE_TEMPLATE = gql`
  mutation UpdateTemplate(
    $uuid: UUID!
    $name: String
    $is_default: Boolean
    $size: String
    $background_image: String
    $like: Boolean
  ) {
    updateTemplate(
      uuid: $uuid
      name: $name
      isDefault: $is_default
      size: $size
      backgroundImage: $background_image
      like: $like
    ) {
      template {
        uuid
        name
        isDefault
        size
        backgroundImage
        like
        createdAt
      }
    }
  }
`;

// Mutation to delete a template
export const DELETE_TEMPLATE = gql`
  mutation DeleteTemplate($uuid: UUID!) {
    deleteTemplate(uuid: $uuid) {
      success
    }
  }
`;

// Mutation to update a template element
export const UPDATE_ELEMENT_IN_TEMPLATE = gql`
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
export const DELETE_ELEMENT_FROM_TEMPLATE = gql`
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
export const DEBUG_ELEMENT_PROPERTIES = gql`
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
export const fetchAllTemplates = async (size?: string) => {
  try {
    const { data } = await client.query({
      query: GET_ALL_TEMPLATES,
      variables: { size },
      fetchPolicy: 'network-only',
    });
    
    // Process the data to ensure all fields are correctly formatted
    const processedTemplates = data.templates.map((template: any) => {
      // Process background image if it exists and is not the default
      let backgroundImage = template.backgroundImage;
      if (backgroundImage && backgroundImage !== 'no_image.jpg') {
        backgroundImage = processImageData(backgroundImage);
      }

      // Process image assets
      const imageAssets = template.imageAssets?.map((img: any) => ({
        uuid: img.uuid,
        image: processImageData(img.image),
        positionX: Number(img.positionX),
        positionY: Number(img.positionY),
        width: Number(img.width),
        height: Number(img.height),
        zIndex: Number(img.zIndex),
        rotation: Number(img.rotation),
        opacity: Number(img.opacity),
        borderRadius: Number(img.borderRadius)
      })) || [];

      // Process text elements
      const textElements = template.textElements?.map((text: any) => ({
        uuid: text.uuid,
        text: text.text,
        font: text.font,
        fontSize: Number(text.fontSize),
        color: text.color,
        positionX: Number(text.positionX),
        positionY: Number(text.positionY),
        zIndex: Number(text.zIndex),
        rotation: Number(text.rotation),
        opacity: Number(text.opacity)
      })) || [];

      // Process shape elements
      const shapeElements = template.shapeElements?.map((shape: any) => ({
        uuid: shape.uuid,
        shapeType: shape.shapeType,
        color: shape.color,
        positionX: Number(shape.positionX),
        positionY: Number(shape.positionY),
        width: Number(shape.width),
        height: Number(shape.height),
        zIndex: Number(shape.zIndex),
        rotation: Number(shape.rotation),
        opacity: Number(shape.opacity)
      })) || [];

      // Return the processed template
      return {
        ...template,
        backgroundImage,
        imageAssets,
        textElements,
        shapeElements
      };
    });
    
    console.log('Processed templates from GraphQL:', processedTemplates);
    return processedTemplates;
  } catch (error) {
    console.error('Error in fetchAllTemplates:', error);
    throw error;
  }
};

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
export const createTemplate = async (name: string, size: string, backgroundImage?: string, userId?: string, isDefault: boolean = false, postId?: string, mediaId?: string) => {
  const API_URL = process.env.REACT_APP_API_URL || 
    (process.env.NODE_ENV === 'production' ? 'https://api.aimmagic.com' : 'http://localhost:8000');
    
  console.log(`Environment: ${process.env.NODE_ENV}, using API URL: ${API_URL}`);
  console.log('Creating template with name:', name);
  console.log('Background image:', backgroundImage);
  console.log('Post ID:', postId);
  console.log('Media ID:', mediaId);

  // If mediaId is provided, check if a template already exists for this media
  if (mediaId) {
    try {
      // Fetch the media details to check if it already has a template
      const response = await fetch(`${API_URL}/api/post-media/${mediaId}/`);
      const mediaData = await response.json();
      
      console.log('Fetched media data:', mediaData);
      
      // If the media already has a template, return that template instead of creating a new one
      if (mediaData.template) {
        console.log('Media already has template:', mediaData.template);
        
        // Fetch existing template with its elements
        const existingTemplate = await fetchTemplateWithElements(mediaData.template);
        console.log('Using existing template:', existingTemplate);
        
        // If background image is specified, update the existing template with the new background
        if (backgroundImage && existingTemplate.backgroundImage !== backgroundImage) {
          console.log('Updating existing template background image');
          await updateTemplate(mediaData.template, { backgroundImage });
          existingTemplate.backgroundImage = backgroundImage;
        }
        
        return existingTemplate;
      }
    } catch (error) {
      console.error('Error checking for existing template:', error);
      // Continue with creating a new template if there was an error
    }
  }

  // If mediaId is provided, fetch the post media image to use as background
  if (mediaId && !backgroundImage) {
    try {
      // Use the API endpoint to get the media
      const response = await fetch(`${API_URL}/api/post-media/${mediaId}/`);
      if (response.ok) {
        const mediaData = await response.json();
        console.log('Post media data received:', mediaData);
        
        if (mediaData.media) {
          // Use the media URL exactly as returned by the server
          backgroundImage = mediaData.media;
          console.log('Using media image as background:', backgroundImage);
        }
      }
    } catch (error) {
      console.error('Error fetching post media:', error);
    }
  } else if (postId && !backgroundImage) {
    // If postId is provided but no backgroundImage, fetch the post image
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}/`);
      if (response.ok) {
        const postData = await response.json();
        
        if (postData.picture && postData.picture !== 'no_img.jpeg') {
          backgroundImage = postData.picture;
          console.log('Using post image as background:', backgroundImage);
        }
      }
    } catch (error) {
      console.error('Error fetching post picture:', error);
    }
  }

  // Get the user's ID from cookies if not provided
  if (!userId) {
    try {
      const cookies = document.cookie.split(';');
      const userCookie = cookies.find(cookie => cookie.trim().startsWith('user='));
      if (userCookie) {
        const userObj = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
        userId = userObj.id;
      }
    } catch (error) {
      console.error('Error getting user ID from cookies:', error);
    }
  }

  // If still no userId, throw an error as it's required
  if (!userId) {
    throw new Error('User ID is required to create a template');
  }

  try {
    // Use the existing CREATE_TEMPLATE mutation
    const { data } = await client.mutate({
      mutation: CREATE_TEMPLATE,
      variables: { 
        name, 
        size, 
        userId, 
        isDefault, 
        backgroundImage 
      },
    });

    const template = data.createTemplate.template;
    console.log('Created template:', template);

    // If created for a media item, update the media's template reference
    if (mediaId && template) {
      console.log('Updating media with new template:', template.uuid);
      try {
        const updateResponse = await fetch(`${API_URL}/api/post-media/${mediaId}/update-template/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ template_uuid: template.uuid }),
        });
        
        if (!updateResponse.ok) {
          console.error('Failed to update media with template reference');
        } else {
          console.log('Successfully updated media with template reference');
        }
      } catch (error) {
        console.error('Error updating media with template reference:', error);
      }
    }

    // For compatibility with the rest of the codebase
    const formattedTemplate = {
      uuid: template.uuid,
      name: template.name,
      size: template.size,
      backgroundImage: template.backgroundImage,
      isDefault: template.isDefault,
      user: { id: userId },
      images: [],  // Initialize with empty arrays
      texts: [],
      shapes: []
    };

    return formattedTemplate;
  } catch (error) {
    console.error('Error creating template:', error);
    throw error;
  }
}

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
      mutation: gql`
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
      updatesToSend.shapeType = updatesToSend.shapeType;
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
    
    // Process the response data to match the expected format
    const processedTemplates = response.data.map((template: any) => {
      // Process image assets
      const imageAssets = template.image_assets?.map((img: any) => ({
        uuid: img.uuid,
        image: processImageData(img.image),
        positionX: Number(img.position_x),
        positionY: Number(img.position_y),
        width: Number(img.width),
        height: Number(img.height),
        zIndex: Number(img.z_index),
        rotation: Number(img.rotation)
      })) || [];

      // Process text elements
      const textElements = template.text_elements?.map((text: any) => ({
        uuid: text.uuid,
        text: text.text,
        font: text.font,
        fontSize: Number(text.font_size),
        color: text.color,
        positionX: Number(text.position_x),
        positionY: Number(text.position_y),
        zIndex: Number(text.z_index),
        rotation: Number(text.rotation)
      })) || [];

      // Process shape elements
      const shapeElements = template.shape_elements?.map((shape: any) => ({
        uuid: shape.uuid,
        shapeType: shape.shape_type,
        color: shape.color,
        positionX: Number(shape.position_x),
        positionY: Number(shape.position_y),
        width: Number(shape.width),
        height: Number(shape.height),
        zIndex: Number(shape.z_index),
        rotation: Number(shape.rotation)
      })) || [];

      // Return the processed template
      return {
        uuid: template.uuid,
        name: template.name,
        isDefault: template.is_default,
        size: template.size,
        backgroundImage: template.background_image,
        createdAt: template.created_at,
        imageAssets,
        textElements,
        shapeElements,
        // For backward compatibility
        images: template.images || [],
        texts: template.texts || [],
        shapes: template.shapes || []
      };
    });
    
    console.log('Processed templates from REST API:', processedTemplates);
    return processedTemplates;
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
    
    // Create a new template with the same properties
    const newTemplate = await createTemplate(
      newName,
      templateSize, // Use our validated size
      sourceTemplate.backgroundImage,
      userId,
      false // Not a default template
    );
    
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
      mutation: gql`
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
      query: gql`
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

// Function to get templates by filter (default, my, liked)
export const getTemplates = async (filterType: string = 'my') => {
  try {
    // Get user ID for filtering
    let userId = null;
    if (typeof window !== 'undefined') {
      userId = (window as any).__USER_ID__;
    }
    
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
    
    if (filterType !== 'default' && !userId) {
      console.warn('User ID not found, returning empty templates list');
      return [];
    }
    
    // Fetch all templates with their elements
    const { data } = await client.query({
      query: GET_ALL_TEMPLATES,
      variables: {},
      fetchPolicy: 'network-only', // Do not use cache for this query
    });
    
    if (data && data.templates) {
      // Filter templates based on the filterType
      let filteredTemplates = data.templates;
      
      if (filterType === 'my') {
        // Filter by templates created by the current user
        filteredTemplates = data.templates.filter((template: any) => 
          template.user && template.user.id === userId
        );
      } else if (filterType === 'default') {
        // Filter by default templates
        filteredTemplates = data.templates.filter((template: any) => 
          template.isDefault === true
        );
      } else if (filterType === 'liked') {
        // Filter by templates the user has liked
        filteredTemplates = data.templates.filter((template: any) => 
          template.like === true
        );
      }
      
      // Process each template to ensure we have proper data for thumbnail display
      return Promise.all(filteredTemplates.map(async (template: any) => {
        // For better thumbnail display, we need to fetch the complete template details
        // with all elements for each template in the filtered list
        try {
          const completeTemplate = await fetchTemplateWithElements(template.uuid);
          return {
            ...completeTemplate,
            // No need to set thumbnail property anymore since we'll use the elements directly
          };
        } catch (error) {
          console.warn(`Error fetching complete details for template ${template.uuid}:`, error);
          // Return the original template if we can't fetch the complete one
          return {
            ...template,
            // Convert imageAssets/textElements/shapeElements to images/texts/shapes for consistency
            images: template.imageAssets || [],
            texts: template.textElements || [],
            shapes: template.shapeElements || []
          };
        }
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
}; 