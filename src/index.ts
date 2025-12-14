#!/usr/bin/env node

/**
 * Todo App MCP Server
 * A production-ready to-do list application using the Model Context Protocol
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  TodoItem,
  TodoStorage,
  AddTodoParams,
  ListTodosParams,
  ToggleTodoParams,
  DeleteTodoParams,
  TodoResponse,
} from "./types.js";

// In-memory storage for all users' todos
const storage: TodoStorage = {};

/**
 * Get or initialize a user's todo list
 * @param userId - The unique identifier for the user
 * @returns The user's todo list
 */
function getUserTodos(userId: string): TodoItem[] {
  if (!storage[userId]) {
    storage[userId] = [];
  }
  return storage[userId];
}

/**
 * Generate a unique ID for a new todo item
 * @returns A unique identifier string
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Add a new todo item
 * @param userId - The user's unique identifier
 * @param params - Parameters containing the todo text
 * @returns Response object with success status and message
 */
function addTodo(userId: string, params: AddTodoParams): TodoResponse {
  try {
    // Validate input
    if (!params.text || params.text.trim().length === 0) {
      return {
        success: false,
        message: "Todo text cannot be empty",
      };
    }

    const todos = getUserTodos(userId);
    const newTodo: TodoItem = {
      id: generateId(),
      text: params.text.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    todos.push(newTodo);

    return {
      success: true,
      message: "Todo added successfully",
      data: newTodo,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error adding todo: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * List todos with optional filtering
 * @param userId - The user's unique identifier
 * @param params - Parameters containing optional filter
 * @returns Response object with filtered todos and statistics
 */
function listTodos(userId: string, params: ListTodosParams): TodoResponse {
  try {
    const todos = getUserTodos(userId);
    const filter = params.filter || "all";

    let filteredTodos: TodoItem[];
    
    switch (filter) {
      case "active":
        filteredTodos = todos.filter((todo) => !todo.completed);
        break;
      case "completed":
        filteredTodos = todos.filter((todo) => todo.completed);
        break;
      case "all":
      default:
        filteredTodos = todos;
        break;
    }

    // Calculate statistics
    const total = todos.length;
    const completed = todos.filter((todo) => todo.completed).length;
    const active = total - completed;

    return {
      success: true,
      message: `Retrieved ${filteredTodos.length} todo(s)`,
      data: {
        todos: filteredTodos,
        stats: {
          total,
          active,
          completed,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `Error listing todos: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Toggle a todo's completion status
 * @param userId - The user's unique identifier
 * @param params - Parameters containing the todo ID
 * @returns Response object with updated todo
 */
function toggleTodo(userId: string, params: ToggleTodoParams): TodoResponse {
  try {
    const todos = getUserTodos(userId);
    const todo = todos.find((t) => t.id === params.id);

    if (!todo) {
      return {
        success: false,
        message: `Todo with id "${params.id}" not found`,
      };
    }

    todo.completed = !todo.completed;

    return {
      success: true,
      message: `Todo marked as ${todo.completed ? "completed" : "active"}`,
      data: todo,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error toggling todo: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Delete a todo item
 * @param userId - The user's unique identifier
 * @param params - Parameters containing the todo ID
 * @returns Response object confirming deletion
 */
function deleteTodo(userId: string, params: DeleteTodoParams): TodoResponse {
  try {
    const todos = getUserTodos(userId);
    const index = todos.findIndex((t) => t.id === params.id);

    if (index === -1) {
      return {
        success: false,
        message: `Todo with id "${params.id}" not found`,
      };
    }

    const deletedTodo = todos.splice(index, 1)[0];

    return {
      success: true,
      message: "Todo deleted successfully",
      data: deletedTodo,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error deleting todo: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Clear all completed todos
 * @param userId - The user's unique identifier
 * @returns Response object with count of deleted todos
 */
function clearCompleted(userId: string): TodoResponse {
  try {
    const todos = getUserTodos(userId);
    const initialLength = todos.length;
    const activeTodos = todos.filter((todo) => !todo.completed);
    const deletedCount = initialLength - activeTodos.length;

    storage[userId] = activeTodos;

    return {
      success: true,
      message: `Cleared ${deletedCount} completed todo(s)`,
      data: {
        deletedCount,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `Error clearing completed todos: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Main function to initialize and start the MCP server
 */
async function main() {
  // Create MCP server instance
  const server = new Server(
    {
      name: "todo-app",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tool list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "add_todo",
          description: "Add a new todo item to the list",
          inputSchema: {
            type: "object",
            properties: {
              text: {
                type: "string",
                description: "The text content of the todo item",
              },
            },
            required: ["text"],
          },
        },
        {
          name: "list_todos",
          description:
            "List all todo items with optional filtering by completion status",
          inputSchema: {
            type: "object",
            properties: {
              filter: {
                type: "string",
                enum: ["all", "active", "completed"],
                description:
                  "Filter todos by status: all, active (not completed), or completed",
              },
            },
          },
        },
        {
          name: "toggle_todo",
          description: "Toggle the completion status of a todo item",
          inputSchema: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "The unique identifier of the todo item to toggle",
              },
            },
            required: ["id"],
          },
        },
        {
          name: "delete_todo",
          description: "Delete a todo item from the list",
          inputSchema: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "The unique identifier of the todo item to delete",
              },
            },
            required: ["id"],
          },
        },
        {
          name: "clear_completed",
          description: "Remove all completed todo items from the list",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
      ],
    };
  });

  // Register tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    // Use a default user ID for single-user scenarios
    const userId = "default";

    try {
      let result: TodoResponse;

      switch (name) {
        case "add_todo":
          result = addTodo(userId, args as unknown as AddTodoParams);
          break;

        case "list_todos":
          result = listTodos(userId, args as unknown as ListTodosParams);
          break;

        case "toggle_todo":
          result = toggleTodo(userId, args as unknown as ToggleTodoParams);
          break;

        case "delete_todo":
          result = deleteTodo(userId, args as unknown as DeleteTodoParams);
          break;

        case "clear_completed":
          result = clearCompleted(userId);
          break;

        default:
          result = {
            success: false,
            message: `Unknown tool: ${name}`,
          };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                message: `Error executing tool: ${error instanceof Error ? error.message : String(error)}`,
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }
  });

  // Connect to stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log server start to stderr (stdout is used for MCP communication)
  console.error("Todo App MCP Server started successfully");
}

// Start the server
main().catch((error) => {
  console.error("Fatal error starting server:", error);
  process.exit(1);
});
