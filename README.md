# Todo App MCP

A production-ready to-do list application built using the Model Context Protocol (MCP) for the OpenAI Apps SDK. This application demonstrates how to create a fully functional MCP server with persistent state management and comprehensive tool support.

## Features

- **Add Todos**: Create new todo items with validation
- **List Todos**: View all todos with optional filtering (all/active/completed)
- **Toggle Completion**: Mark todos as completed or active
- **Delete Todos**: Remove individual todo items
- **Clear Completed**: Bulk remove all completed todos
- **Statistics**: Track total, active, and completed todo counts
- **Error Handling**: Comprehensive error handling for all operations
- **Type Safety**: Full TypeScript implementation with strict typing

## Project Structure

```
todo-app-mcp/
├── src/
│   ├── index.ts       # Main MCP server implementation
│   └── types.ts       # TypeScript type definitions
├── dist/              # Compiled JavaScript output (generated)
├── package.json       # Project dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── mcp.json          # MCP server configuration
└── README.md         # This file
```

## Setup Instructions

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd todo-app-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the application:
   ```bash
   npm run build
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Development

To run the TypeScript compiler in watch mode during development:

```bash
npm run dev
```

This will automatically recompile the TypeScript files whenever you make changes.

## Usage

The MCP server runs on stdio and is designed to be used with MCP-compatible clients. Once started, it exposes five tools that can be called via the MCP protocol.

### Available Tools

#### 1. add_todo

Add a new todo item to the list.

**Parameters:**
- `text` (string, required): The text content of the todo item

**Example:**
```json
{
  "text": "Buy groceries"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Todo added successfully",
  "data": {
    "id": "1702857600000-abc123",
    "text": "Buy groceries",
    "completed": false,
    "createdAt": 1702857600000
  }
}
```

#### 2. list_todos

List all todo items with optional filtering by completion status.

**Parameters:**
- `filter` (string, optional): Filter todos by status
  - `"all"` (default): Show all todos
  - `"active"`: Show only incomplete todos
  - `"completed"`: Show only completed todos

**Example:**
```json
{
  "filter": "active"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Retrieved 2 todo(s)",
  "data": {
    "todos": [
      {
        "id": "1702857600000-abc123",
        "text": "Buy groceries",
        "completed": false,
        "createdAt": 1702857600000
      }
    ],
    "stats": {
      "total": 3,
      "active": 2,
      "completed": 1
    }
  }
}
```

#### 3. toggle_todo

Toggle the completion status of a todo item.

**Parameters:**
- `id` (string, required): The unique identifier of the todo item to toggle

**Example:**
```json
{
  "id": "1702857600000-abc123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Todo marked as completed",
  "data": {
    "id": "1702857600000-abc123",
    "text": "Buy groceries",
    "completed": true,
    "createdAt": 1702857600000
  }
}
```

#### 4. delete_todo

Delete a todo item from the list.

**Parameters:**
- `id` (string, required): The unique identifier of the todo item to delete

**Example:**
```json
{
  "id": "1702857600000-abc123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Todo deleted successfully",
  "data": {
    "id": "1702857600000-abc123",
    "text": "Buy groceries",
    "completed": true,
    "createdAt": 1702857600000
  }
}
```

#### 5. clear_completed

Remove all completed todo items from the list.

**Parameters:** None

**Example:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "message": "Cleared 3 completed todo(s)",
  "data": {
    "deletedCount": 3
  }
}
```

## MCP Configuration

The `mcp.json` file defines the server configuration for MCP clients. It specifies:

- Server name and command to run
- Available capabilities (tools)
- Tool definitions with input schemas

## Architecture

### Server Implementation

The server is built using the MCP SDK and implements:

1. **In-Memory Storage**: Todos are stored in memory, organized by user ID
2. **Tool Handlers**: Each tool has a dedicated handler function
3. **Error Handling**: All operations include try-catch blocks and validation
4. **Type Safety**: Full TypeScript typing for all data structures

### Data Model

Each todo item contains:
- `id`: Unique identifier (timestamp + random string)
- `text`: The todo's text content
- `completed`: Boolean completion status
- `createdAt`: Timestamp of creation

## Error Handling

The application includes comprehensive error handling:

- **Input Validation**: Empty todo text is rejected
- **ID Validation**: Operations on non-existent IDs return appropriate errors
- **Exception Handling**: All operations are wrapped in try-catch blocks
- **Error Messages**: Clear, descriptive error messages for debugging

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
