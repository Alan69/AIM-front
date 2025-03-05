# Design Module

A Canva-like design editor for creating and editing templates with various elements.

## Features

- Template browsing and creation
- Support for different template sizes (1080x1080, 1080x1920)
- Add and manipulate text elements
- Add and manipulate image elements
- Add and manipulate shape elements (rectangle, circle, triangle, line, star)
- Undo/redo functionality
- Save and delete templates

## Components

- **TemplateListPage**: Browse and create templates
- **TemplateEditorPage**: Edit templates with various elements
  - **CanvasWorkspace**: Interactive canvas for manipulating elements
  - **ElementsPanel**: Panel for adding new elements
  - **PropertiesPanel**: Panel for editing selected element properties

## Usage

1. Navigate to `/design` to view and create templates
2. Click on a template to edit it or create a new one
3. Use the left panel to add elements
4. Use the right panel to edit element properties
5. Save your template when done

## Dependencies

- React
- Konva.js for canvas manipulation
- Ant Design for UI components
- Apollo Client for GraphQL communication 