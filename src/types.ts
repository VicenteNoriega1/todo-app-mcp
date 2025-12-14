/**
 * Type definitions for the Todo App MCP Server
 */

/**
 * Represents a single todo item
 */
export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

/**
 * Storage structure mapping user IDs to their todo lists
 */
export interface TodoStorage {
  [userId: string]: TodoItem[];
}

/**
 * Parameters for adding a new todo
 */
export interface AddTodoParams {
  text: string;
}

/**
 * Parameters for listing todos with optional filtering
 */
export interface ListTodosParams {
  filter?: 'all' | 'active' | 'completed';
}

/**
 * Parameters for toggling a todo's completion status
 */
export interface ToggleTodoParams {
  id: string;
}

/**
 * Parameters for deleting a todo
 */
export interface DeleteTodoParams {
  id: string;
}

/**
 * Standard response format for all todo operations
 */
export interface TodoResponse {
  success: boolean;
  message: string;
  data?: any;
}
