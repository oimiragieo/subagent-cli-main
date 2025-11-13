/**
 * Todo Tracker - Progress Visibility for Multi-Step Operations
 *
 * Features:
 * - Automatic detection of TodoWrite tool calls
 * - Progress visualization with percentage complete
 * - Task status tracking (pending, in_progress, completed)
 * - Duration tracking for tasks
 * - Rich console output with icons and formatting
 */

import {
  Todo,
  TodoProgress,
  TodoListener,
  AgentMessage,
  ContentBlock
} from "../types";

export class TodoTracker {
  private todos: Todo[] = [];
  private listeners: TodoListener[] = [];
  private displayCallback?: (display: string) => void;

  constructor(config?: {
    displayCallback?: (display: string) => void;
  }) {
    this.displayCallback = config?.displayCallback;
  }

  /**
   * Process agent message to detect TodoWrite tool calls
   */
  onMessage(message: AgentMessage): void {
    if (message.type !== "assistant" || !message.content) {
      return;
    }

    for (const block of message.content) {
      if (this.isToolUse(block) && block.name === "TodoWrite") {
        this.updateTodos(block.input?.todos || []);
      }
    }
  }

  /**
   * Type guard for tool_use blocks
   */
  private isToolUse(block: ContentBlock): block is ContentBlock & { name: string; input: any } {
    return block.type === "tool_use" && !!block.name;
  }

  /**
   * Update todos from TodoWrite tool call
   */
  private updateTodos(newTodos: Todo[]): void {
    // Clear existing todos
    this.todos = [];

    // Add new todos with metadata
    for (const todo of newTodos) {
      const existingTodo = this.todos.find(t => t.content === todo.content);

      if (existingTodo) {
        // Update existing todo
        if (todo.status === "in_progress" && existingTodo.status !== "in_progress") {
          existingTodo.startedAt = new Date();
        }

        if (todo.status === "completed" && existingTodo.status !== "completed") {
          existingTodo.completedAt = new Date();
        }

        existingTodo.status = todo.status;
        existingTodo.activeForm = todo.activeForm;
        existingTodo.error = todo.error;
      } else {
        // Add new todo
        this.todos.push({
          id: todo.id || this.generateId(),
          content: todo.content,
          activeForm: todo.activeForm,
          status: todo.status,
          createdAt: new Date(),
          startedAt: todo.status === "in_progress" ? new Date() : undefined,
          completedAt: todo.status === "completed" ? new Date() : undefined,
          error: todo.error
        });
      }
    }

    // Notify listeners
    this.notifyListeners();

    // Display if callback provided
    if (this.displayCallback) {
      this.displayCallback(this.display());
    }
  }

  /**
   * Generate unique ID for todo
   */
  private generateId(): string {
    return `todo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Add a listener for todo changes
   */
  addListener(listener: TodoListener): void {
    this.listeners.push(listener);
  }

  /**
   * Remove a listener
   */
  removeListener(listener: TodoListener): void {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners of todo changes
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener([...this.todos]);
    }
  }

  /**
   * Get progress summary
   */
  getProgress(): TodoProgress {
    const total = this.todos.length;
    const completed = this.todos.filter(t => t.status === "completed").length;
    const inProgress = this.todos.filter(t => t.status === "in_progress").length;
    const pending = this.todos.filter(t => t.status === "pending").length;

    return {
      total,
      completed,
      inProgress,
      pending,
      percentComplete: total > 0 ? (completed / total) * 100 : 0
    };
  }

  /**
   * Get all todos
   */
  getTodos(): Todo[] {
    return [...this.todos];
  }

  /**
   * Get todos by status
   */
  getTodosByStatus(status: "pending" | "in_progress" | "completed"): Todo[] {
    return this.todos.filter(t => t.status === status);
  }

  /**
   * Get duration for a todo
   */
  private getDuration(todo: Todo): string | null {
    if (todo.status === "completed" && todo.startedAt && todo.completedAt) {
      const duration = todo.completedAt.getTime() - todo.startedAt.getTime();
      return this.formatDuration(duration);
    }

    if (todo.status === "in_progress" && todo.startedAt) {
      const duration = new Date().getTime() - todo.startedAt.getTime();
      return this.formatDuration(duration);
    }

    return null;
  }

  /**
   * Format duration in human-readable format
   */
  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }

    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }

    return `${seconds}s`;
  }

  /**
   * Display todos with formatting
   */
  display(): string {
    if (this.todos.length === 0) {
      return "";
    }

    const progress = this.getProgress();
    const lines: string[] = [];

    // Progress header
    lines.push(
      `\n━━━ Progress: ${progress.completed}/${progress.total} tasks ` +
      `(${progress.percentComplete.toFixed(0)}%) ━━━\n`
    );

    // Icons for different statuses
    const icons = {
      completed: "✅",
      in_progress: "🔧",
      pending: "⏳"
    };

    // Display each todo
    for (const todo of this.todos) {
      const icon = icons[todo.status];
      const text = todo.status === "in_progress" ? todo.activeForm : todo.content;
      const duration = this.getDuration(todo);

      let line = `${icon} ${text}`;

      if (duration) {
        line += ` (${duration})`;
      }

      if (todo.error) {
        line += ` ❌ Error: ${todo.error}`;
      }

      lines.push(line);
    }

    lines.push("");

    return lines.join("\n");
  }

  /**
   * Display todos in compact format (single line)
   */
  displayCompact(): string {
    const progress = this.getProgress();
    return `[${progress.completed}/${progress.total} tasks • ${progress.percentComplete.toFixed(0)}% complete]`;
  }

  /**
   * Clear all todos
   */
  clear(): void {
    this.todos = [];
    this.notifyListeners();
  }

  /**
   * Export todos for reporting
   */
  export(): Todo[] {
    return this.getTodos();
  }

  /**
   * Import todos from external source
   */
  import(todos: Todo[]): void {
    this.todos = todos.map(todo => ({
      ...todo,
      createdAt: new Date(todo.createdAt),
      startedAt: todo.startedAt ? new Date(todo.startedAt) : undefined,
      completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined
    }));

    this.notifyListeners();
  }

  /**
   * Get estimated time remaining based on average task duration
   */
  getEstimatedTimeRemaining(): string | null {
    const completedTodos = this.getTodosByStatus("completed");

    if (completedTodos.length === 0) {
      return null;
    }

    // Calculate average duration for completed tasks
    let totalDuration = 0;
    let count = 0;

    for (const todo of completedTodos) {
      if (todo.startedAt && todo.completedAt) {
        totalDuration += todo.completedAt.getTime() - todo.startedAt.getTime();
        count++;
      }
    }

    if (count === 0) {
      return null;
    }

    const averageDuration = totalDuration / count;
    const progress = this.getProgress();
    const remainingTasks = progress.total - progress.completed - progress.inProgress;

    if (remainingTasks <= 0) {
      return "Almost done!";
    }

    const estimatedMs = averageDuration * remainingTasks;
    return this.formatDuration(estimatedMs);
  }

  /**
   * Get summary statistics
   */
  getStatistics(): {
    totalTodos: number;
    completedTodos: number;
    averageDuration: string | null;
    totalDuration: string | null;
    estimatedTimeRemaining: string | null;
    successRate: number;
  } {
    const progress = this.getProgress();
    const completedTodos = this.getTodosByStatus("completed");

    // Calculate total duration
    let totalDuration = 0;
    let count = 0;

    for (const todo of completedTodos) {
      if (todo.startedAt && todo.completedAt) {
        totalDuration += todo.completedAt.getTime() - todo.startedAt.getTime();
        count++;
      }
    }

    // Calculate success rate (completed without errors)
    const successfulTodos = completedTodos.filter(t => !t.error).length;
    const successRate = progress.total > 0 ? (successfulTodos / progress.total) * 100 : 0;

    return {
      totalTodos: progress.total,
      completedTodos: progress.completed,
      averageDuration: count > 0 ? this.formatDuration(totalDuration / count) : null,
      totalDuration: count > 0 ? this.formatDuration(totalDuration) : null,
      estimatedTimeRemaining: this.getEstimatedTimeRemaining(),
      successRate
    };
  }
}

/**
 * Example usage:
 *
 * const todoTracker = new TodoTracker({
 *   displayCallback: (display) => {
 *     console.log(display);
 *   }
 * });
 *
 * // Track todos from streaming agent
 * for await (const message of agent.query(userMessages())) {
 *   todoTracker.onMessage(message);
 *
 *   if (message.type === "text") {
 *     process.stdout.write(message.content[0].text);
 *   }
 * }
 *
 * // Display final statistics
 * const stats = todoTracker.getStatistics();
 * console.log(`\nCompleted ${stats.completedTodos}/${stats.totalTodos} tasks`);
 * console.log(`Average duration: ${stats.averageDuration}`);
 * console.log(`Success rate: ${stats.successRate.toFixed(1)}%`);
 */
