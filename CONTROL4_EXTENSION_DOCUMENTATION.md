# Control4 VSCode Extension Documentation for AI Agents

## Overview

This VSCode extension provides comprehensive support for Control4 driver development, enabling developers to create, edit, and build Control4 drivers using a modern development environment. The extension uses `.c4c` (Control4 Component) files as the primary source format, which are then compiled into the standard `driver.xml` format required by Control4 systems.

## Core Architecture

### File Structure
- **`.c4c` files**: JSON-based component files that define specific aspects of a Control4 driver
- **`driver.xml`**: The final compiled XML output that Control4 systems consume
- **Schema files**: JSON schemas that validate and provide autocomplete for `.c4c` files
- **Build system**: Compiles `.c4c` files into `driver.xml` using TypeScript classes

### Key Components

1. **Driver Class** (`client/src/control4/driver.ts`): Main orchestrator that combines all components
2. **Component Classes**: TypeScript classes that handle specific driver aspects (UI, Actions, Properties, etc.)
3. **Resource Classes**: Handle loading and parsing of `.c4c` files
4. **Build Stages**: Process components through various build phases

## .c4c File Format

### File Types and Locations

The extension supports the following `.c4c` file types:

1. **`ui.c4c`** - User interface definitions
2. **`actions.c4c`** - Driver actions
3. **`properties.c4c`** - Driver properties
4. **`commands.c4c`** - Driver commands
5. **`connections.c4c`** - Device connections
6. **`events.c4c`** - Driver events
7. **`proxies.c4c`** - Driver proxies
8. **`navdisplayoptions.c4c`** - Navigation display options

### File Structure

Each `.c4c` file is a JSON array containing one or more component definitions:

```json
[
  {
    "$schema": "./client/src/resources/schemas/[component].json",
    // Component-specific properties
  }
]
```

### Schema Validation

Each `.c4c` file references a corresponding JSON schema that provides:
- Structure validation
- Autocomplete support
- Type checking
- Documentation for properties

## Detailed Component Specifications

### UI Component (`ui.c4c`)

The UI component defines the user interface for media services and device interactions.

**Key Properties:**
- `proxybindingid`: Proxy ID for binding
- `deviceIcon`: Icon for the device
- `brandingIcon`: Branding icon
- `hide_in_list_nav`: Hide from list navigation
- `hide_in_media`: Hide from media interface
- `digital_audio_support`: Digital audio capability
- `can_scan_media`: Media scanning capability
- `ui_selects_device`: Device selection capability

**Sub-components:**
- `icons`: Icon definitions with multiple sizes
- `tabs`: Navigation tabs
- `screens`: UI screens (List, Grid, Detail, Settings)
- `search`: Search functionality
- `notifications`: User notifications
- `nowPlaying`: Now playing interface
- `actions`: UI actions
- `dashboard`: Transport controls
- `favoriteCommand`: Favorite command definition

**Example Structure:**
```json
[
  {
    "$schema": "./client/src/resources/schemas/ui.json",
    "proxybindingid": 5001,
    "deviceIcon": "app_experience_music",
    "brandingIcon": "app_experience_music",
    "hide_in_list_nav": false,
    "hide_in_media": true,
    "digital_audio_support": false,
    "can_scan_media": false,
    "ui_selects_device": true,
    "icons": [
      {
        "id": "app_experience_music",
        "icons": [
          {
            "width": 32,
            "height": 32,
            "path": "controller://driver/DRIVER_FILE_NAME/icons/app_experience_music_32.png"
          }
        ]
      }
    ],
    "tabs": [
      {
        "name": "Categories",
        "screenId": "CategoriesScreen",
        "iconId": "categoriesIcon",
        "screenCommand": {
          "name": "GetCategoriesCommand",
          "type": "PROTOCOL"
        }
      }
    ],
    "screens": [
      {
        "id": "StationsScreen",
        "type": "ListScreenType",
        "dataCommand": {
          "name": "GetStations",
          "type": "PROTOCOL",
          "params": [
            {
              "name": "screen",
              "type": "DEFAULT",
              "value": "StationsList"
            }
          ]
        },
        "list": {
          "defaultAction": "StartStation",
          "titleProperty": "itemTitle",
          "subtitleProperty": "itemSubtitle",
          "imageProperty": "itemImage"
        }
      }
    ]
  }
]
```

### Properties Component (`properties.c4c`)

Defines driver configuration properties.

**Structure:**
```json
[
  {
    "name": "Property Name",
    "type": "STRING|LIST|NUMBER|BOOLEAN",
    "default": "default_value",
    "readonly": false,
    "items": ["option1", "option2"] // For LIST type
  }
]
```

**Example:**
```json
[
  {
    "name": "Driver Version",
    "type": "STRING",
    "default": "",
    "readonly": true
  },
  {
    "name": "Debug Mode",
    "type": "LIST",
    "default": "Off",
    "readonly": false,
    "items": [
      "Off",
      "Debug",
      "Trace",
      "Info",
      "Warning",
      "Error",
      "Fatal"
    ]
  }
]
```

### Actions Component (`actions.c4c`)

Defines driver actions that can be triggered from the UI.

**Structure:**
```json
[
  {
    "id": "action_id",
    "name": "Action Name",
    "type": "ACTION_TYPE",
    "command": {
      "name": "CommandName",
      "type": "PROTOCOL|ROOM",
      "params": [
        {
          "name": "param_name",
          "type": "DEFAULT|FIRST_SELECTED|DATA_OFFSET|DATA_PAGE|DATA_COUNT|SEARCH|SEARCH_FILTER|SYSTEM",
          "value": "param_value"
        }
      ]
    },
    "filters": [
      {
        "type": "Disable",
        "property": "can_shuffle",
        "validValues": ["false"]
      },
      {
        "type": "Change",
        "property": "shufflemode",
        "name": "Turn Shuffle Off",
        "iconId": "np_shuffle_a",
        "validValues": ["true"]
      }
    ]
  }
]
```

### Commands Component (`commands.c4c`)

Defines driver commands that can be executed.

**Structure:**
```json
[
  {
    "name": "CommandName",
    "type": "PROTOCOL|ROOM",
    "params": [
      {
        "name": "param_name",
        "type": "DEFAULT|FIRST_SELECTED|DATA_OFFSET|DATA_PAGE|DATA_COUNT|SEARCH|SEARCH_FILTER|SYSTEM",
        "value": "param_value"
      }
    ]
  }
]
```

### Connections Component (`connections.c4c`)

Defines device connection types and parameters.

**Structure:**
```json
[
  {
    "name": "Connection Name",
    "class": "CONNECTION_CLASS",
    "direction": "IN|OUT|BOTH",
    "params": [
      {
        "name": "param_name",
        "type": "STRING|NUMBER|BOOLEAN",
        "default": "default_value"
      }
    ]
  }
]
```

### Events Component (`events.c4c`)

Defines driver events that can be triggered.

**Structure:**
```json
[
  {
    "name": "EventName",
    "type": "EVENT_TYPE",
    "params": [
      {
        "name": "param_name",
        "type": "STRING|NUMBER|BOOLEAN"
      }
    ]
  }
]
```

### Proxies Component (`proxies.c4c`)

Defines driver proxy configurations.

**Structure:**
```json
[
  {
    "name": "Proxy Name",
    "class": "PROXY_CLASS",
    "type": "PROXY_TYPE",
    "params": [
      {
        "name": "param_name",
        "type": "STRING|NUMBER|BOOLEAN",
        "default": "default_value"
      }
    ]
  }
]
```

### Navigation Display Options Component (`navdisplayoptions.c4c`)

Defines how the driver appears in Control4 navigation.

**Structure:**
```json
[
  {
    "name": "Display Option Name",
    "type": "DISPLAY_TYPE",
    "params": [
      {
        "name": "param_name",
        "type": "STRING|NUMBER|BOOLEAN",
        "default": "default_value"
      }
    ]
  }
]
```

## Build Process

### 1. Component Loading

The build process begins with the `Driver.From()` method:

1. **Package Analysis**: Reads `package.json` for driver metadata
2. **Component Loading**: Loads all `.c4c` files using resource classes
3. **Object Creation**: Creates TypeScript objects from JSON data
4. **Validation**: Validates against JSON schemas

### 2. XML Generation

The `Driver.build()` method generates the final XML:

1. **Root Structure**: Creates the main `devicedata` XML element
2. **Metadata**: Adds driver metadata (name, version, creator, etc.)
3. **Components**: Processes each component type:
   - Properties → `<config><properties>`
   - Actions → `<config><actions>`
   - Commands → `<config><commands>`
   - Connections → `<connections>`
   - Events → `<events>`
   - Proxies → `<proxies>`
   - UI → `<capabilities><UI>`
   - Navigation Options → `<capabilities><navigator_display_option>`

### 3. Build Stages

The build process includes several stages:

1. **Pre-script**: Environment variable injection
2. **Lua Processing**: Lua script compilation and dependency injection
3. **XML Generation**: Component compilation to XML
4. **Post-script**: Final processing and validation
5. **Packaging**: Creates the final `.c4z` file

## Schema System

### Schema Files Location
```
client/src/resources/schemas/
├── ui.json
├── actions.json
├── properties.json
├── commands.json
├── connections.json
├── events.json
├── proxies.json
├── navdisplayoptions.json
└── capabilities/
    ├── thermostat.json
    ├── camera.json
    └── capabilities.json
```

### Schema Structure

Each schema file defines:
- **Type definitions**: Object structures and validation rules
- **Property constraints**: Required fields, data types, enums
- **Validation rules**: Format requirements, value constraints
- **Documentation**: Property descriptions and usage examples

## AI Agent Usage Guidelines

### For XML to .c4c Conversion

When converting existing `driver.xml` files to `.c4c` format:

1. **Parse XML Structure**: Use the `Driver.Parse()` method as reference
2. **Map XML Elements**: Each XML section maps to a specific `.c4c` file type
3. **Follow Schema**: Ensure output conforms to the appropriate JSON schema
4. **Preserve Relationships**: Maintain references between components (e.g., screen IDs, action IDs)

### For .c4c to XML Conversion

When converting `.c4c` files to `driver.xml`:

1. **Load Components**: Use the resource classes to load `.c4c` files
2. **Create Objects**: Instantiate the appropriate TypeScript classes
3. **Generate XML**: Use the `toXml()` methods of each component class
4. **Assemble Structure**: Follow the `Driver.build()` method pattern

### Key Mapping Rules

**XML to .c4c:**
- `<devicedata>` → Driver metadata in `package.json`
- `<config><properties>` → `properties.c4c`
- `<config><actions>` → `actions.c4c`
- `<config><commands>` → `commands.c4c`
- `<connections>` → `connections.c4c`
- `<events>` → `events.c4c`
- `<proxies>` → `proxies.c4c`
- `<capabilities><UI>` → `ui.c4c`
- `<capabilities><navigator_display_option>` → `navdisplayoptions.c4c`

**Property Name Mappings:**
- XML attributes with `@` prefix become JSON properties
- XML element names become JSON property names
- Nested XML elements become nested JSON objects
- XML arrays become JSON arrays

### Validation Requirements

1. **Schema Compliance**: All `.c4c` files must validate against their schemas
2. **Reference Integrity**: All ID references must be valid
3. **Type Safety**: Property types must match schema definitions
4. **Required Fields**: All required properties must be present

### Common Patterns

**Icon Definitions:**
```json
{
  "id": "icon_id",
  "icons": [
    {
      "width": 32,
      "height": 32,
      "path": "controller://driver/DRIVER_FILE_NAME/icons/icon_32.png"
    }
  ]
}
```

**Command Parameters:**
```json
{
  "name": "param_name",
  "type": "DEFAULT|FIRST_SELECTED|DATA_OFFSET|DATA_PAGE|DATA_COUNT|SEARCH|SEARCH_FILTER|SYSTEM",
  "value": "param_value"
}
```

**Screen Types:**
- `SettingsScreenType`: Configuration screens
- `ListScreenType`: List-based content screens
- `GridScreenType`: Grid-based content screens
- `DetailScreenType`: Detailed content screens
- `CollectionScreenType`: Collection-based screens

## Best Practices

1. **Modular Design**: Keep each component type in its own `.c4c` file
2. **Schema Validation**: Always validate against schemas before processing
3. **Consistent Naming**: Use consistent naming conventions across components
4. **Reference Management**: Maintain proper ID references between components
5. **Error Handling**: Implement proper error handling for malformed data
6. **Documentation**: Include comprehensive comments in complex configurations

## Troubleshooting

### Common Issues

1. **Schema Validation Errors**: Check property types and required fields
2. **Missing References**: Ensure all ID references are valid
3. **Type Mismatches**: Verify property types match schema definitions
4. **Circular Dependencies**: Avoid circular references between components

### Debug Information

The extension provides extensive logging during the build process:
- Component loading status
- XML generation progress
- Validation results
- Error details with line numbers

This documentation should provide AI agents with comprehensive understanding of the Control4 VSCode extension's architecture and the proper methods for converting between `.c4c` files and `driver.xml` format.
