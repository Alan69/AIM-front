import { ApolloClient, InMemoryCache, gql, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Cookies from 'js-cookie';

// Create the HTTP link
const httpLink = createHttpLink({
  uri: process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/graphql/',
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
    allTemplates(size: $size) {
      uuid
      name
      isDefault
      size
      backgroundImage
      createdAt
    }
  }
`;

// Query to get a template with all its elements
export const GET_TEMPLATE_WITH_ELEMENTS = gql`
  query GetTemplateWithElements($uuid: UUID!) {
    templateWithElements(uuid: $uuid) {
      uuid
      name
      isDefault
      size
      backgroundImage
      createdAt
      images {
        uuid
        image
        positionX
        positionY
        width
        height
        zIndex
        rotation
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
      }
    }
  }
`;

// Mutation to create a template
export const CREATE_TEMPLATE = gql`
  mutation CreateTemplate($name: String!, $size: String!, $userId: UUID, $isDefault: Boolean, $backgroundImage: String) {
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
    $templateId: UUID!
    $image: String!
    $positionX: Float
    $positionY: Float
    $width: Float
    $height: Float
  ) {
    addImageToTemplate(
      templateId: $templateId
      image: $image
      positionX: $positionX
      positionY: $positionY
      width: $width
      height: $height
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
        }
      }
    }
  }
`;

// Mutation to add a text element to a template
export const ADD_TEXT_TO_TEMPLATE = gql`
  mutation AddTextToTemplate(
    $templateId: UUID!
    $text: String!
    $font: String
    $fontSize: Int
    $color: String
    $positionX: Float
    $positionY: Float
  ) {
    addTextToTemplate(
      templateId: $templateId
      text: $text
      font: $font
      fontSize: $fontSize
      color: $color
      positionX: $positionX
      positionY: $positionY
    ) {
      template {
        uuid
        name
        size
        isDefault
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
        }
      }
    }
  }
`;

// Mutation to add a shape element to a template
export const ADD_SHAPE_TO_TEMPLATE = gql`
  mutation AddShapeToTemplate(
    $templateId: UUID!
    $shapeType: String! = "rectangle"
    $color: String = "#000000"
    $positionX: Float = 0
    $positionY: Float = 0
    $width: Float = 100
    $height: Float = 100
    $zIndex: Int = 0
    $rotation: Float = 0
  ) {
    addShapeToTemplate(
      templateId: $templateId
      shapeType: $shapeType
      color: $color
      positionX: $positionX
      positionY: $positionY
      width: $width
      height: $height
      zIndex: $zIndex
      rotation: $rotation
    ) {
      template {
        uuid
        name
        size
        isDefault
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
        }
      }
    }
  }
`;

// Mutation to update a template
export const UPDATE_TEMPLATE = gql`
  mutation UpdateTemplate($uuid: UUID!, $name: String, $isDefault: Boolean, $size: String) {
    updateTemplate(uuid: $uuid, name: $name, isDefault: $isDefault, size: $size) {
      template {
        uuid
        name
        isDefault
        size
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
        }
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
    $templateId: UUID!
    $elementUuid: UUID!
    $elementType: String!
    $updates: JSONString!
  ) {
    updateElementInTemplate(
      templateId: $templateId
      elementUuid: $elementUuid
      elementType: $elementType
      updates: $updates
    ) {
      template {
        uuid
        images {
          uuid
          image
          positionX
          positionY
          width
          height
          zIndex
          rotation
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

// Function to fetch all templates
export const fetchAllTemplates = async (size?: string) => {
  const { data } = await client.query({
    query: GET_ALL_TEMPLATES,
    variables: { size },
    fetchPolicy: 'network-only',
  });
  return data.allTemplates;
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
  const processedTemplate = { ...data.templateWithElements };
  
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
      };
    });
  }
  
  return processedTemplate;
};

// Function to create a template
export const createTemplate = async (name: string, size: string, userId?: string, isDefault: boolean = false, backgroundImage?: string) => {
  const { data } = await client.mutate({
    mutation: CREATE_TEMPLATE,
    variables: { name, size, userId, isDefault, backgroundImage },
  });
  return data.createTemplate.template;
};

// Function to add an image asset to template
export const createImageAsset = async (
  templateId: string,
  image: string,
  positionX: number = 0,
  positionY: number = 0,
  width: number = 100,
  height: number = 100
) => {
  const { data } = await client.mutate({
    mutation: ADD_IMAGE_TO_TEMPLATE,
    variables: { templateId, image, positionX, positionY, width, height },
  });
  return data.addImageToTemplate.template;
};

// Function to add a text element to template
export const createTextElement = async (
  templateId: string,
  text: string,
  font: string = 'Arial',
  fontSize: number = 16,
  color: string = '#000000',
  positionX: number = 0,
  positionY: number = 0
) => {
  const { data } = await client.mutate({
    mutation: ADD_TEXT_TO_TEMPLATE,
    variables: { templateId, text, font, fontSize, color, positionX, positionY },
  });
  return data.addTextToTemplate.template;
};

// Function to add a shape element to template
export const createShapeElement = async (
  templateId: string,
  shapeType: string,
  color: string = '#000000',
  positionX: number = 0,
  positionY: number = 0,
  width: number = 100,
  height: number = 100,
  zIndex: number = 0,
  rotation: number = 0
) => {
  // Ensure shapeType is valid
  if (!shapeType || shapeType.trim() === '') {
    shapeType = 'rectangle'; // Default to rectangle if no valid type
  }
  
  console.log('Sending shape creation request with type:', shapeType);
  console.log('Full request parameters:', { 
    templateId, 
    shapeType, 
    color, 
    positionX, 
    positionY, 
    width, 
    height,
    zIndex,
    rotation
  });
  
  try {
    const { data } = await client.mutate({
      mutation: ADD_SHAPE_TO_TEMPLATE,
      variables: { 
        templateId, 
        shapeType,  // Use the provided shapeType
        color, 
        positionX: Number(positionX), // Ensure it's a number
        positionY: Number(positionY), // Ensure it's a number
        width: Number(width),         // Ensure it's a number
        height: Number(height),       // Ensure it's a number
        zIndex: parseInt(String(zIndex)), // Ensure it's an integer
        rotation: Number(rotation)    // Ensure it's a number
      },
    });
    console.log('Shape creation response:', data);
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
  // Parse updates if it's a string
  const updatesObj = typeof updates === 'string' ? JSON.parse(updates) : updates;
  
  // Ensure shape_type is not null for shape elements
  if (elementType === 'shape' && (!updatesObj.shapeType || updatesObj.shapeType === '')) {
    console.warn('Shape type is null or empty in updates, defaulting to rectangle');
    updatesObj.shapeType = 'rectangle';
  }
  
  // Ensure zIndex is an integer
  if ('zIndex' in updatesObj) {
    updatesObj.zIndex = parseInt(String(updatesObj.zIndex));
  }
  
  // Convert back to string if needed
  const finalUpdates = typeof updates === 'string' ? JSON.stringify(updatesObj) : updatesObj;
  
  console.log(`Updating ${elementType} element with updates:`, finalUpdates);
  
  const { data } = await client.mutate({
    mutation: UPDATE_ELEMENT_IN_TEMPLATE,
    variables: { templateId, elementUuid, elementType, updates: finalUpdates },
  });
  return data.updateElementInTemplate.template;
};

// Function to delete an element from a template
export const deleteElementFromTemplate = async (
  templateId: string,
  elementUuid: string,
  elementType: 'image' | 'text' | 'shape'
) => {
  const { data } = await client.mutate({
    mutation: DELETE_ELEMENT_FROM_TEMPLATE,
    variables: { templateId, elementUuid, elementType },
  });
  return data.deleteElementFromTemplate.template;
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
      rotation: text.rotation !== null ? Number(text.rotation) : 0
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
      rotation: image.rotation !== null ? Number(image.rotation) : 0
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