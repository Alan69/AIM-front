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
    $shapeType: String!
    $color: String
    $positionX: Float
    $positionY: Float
    $width: Float
    $height: Float
  ) {
    addShapeToTemplate(
      templateId: $templateId
      shapeType: $shapeType
      color: $color
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
  const { data } = await client.query({
    query: GET_TEMPLATE_WITH_ELEMENTS,
    variables: { uuid },
    fetchPolicy: 'network-only',
  });
  return data.templateWithElements;
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
  height: number = 100
) => {
  const { data } = await client.mutate({
    mutation: ADD_SHAPE_TO_TEMPLATE,
    variables: { templateId, shapeType, color, positionX, positionY, width, height },
  });
  return data.addShapeToTemplate.template;
};

// Function to update an element in a template
export const updateElementInTemplate = async (
  templateId: string,
  elementUuid: string,
  elementType: 'image' | 'text' | 'shape',
  updates: any
) => {
  const { data } = await client.mutate({
    mutation: UPDATE_ELEMENT_IN_TEMPLATE,
    variables: { templateId, elementUuid, elementType, updates },
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
export const updateTemplate = async (uuid: string, updates: { name?: string; isDefault?: boolean; size?: string }) => {
  const { data } = await client.mutate({
    mutation: UPDATE_TEMPLATE,
    variables: { uuid, ...updates },
  });
  return data.updateTemplate.template;
};

// Function to delete a template
export const deleteTemplate = async (uuid: string) => {
  const { data } = await client.mutate({
    mutation: DELETE_TEMPLATE,
    variables: { uuid },
  });
  return data.deleteTemplate.success;
}; 