/**
 * Text Editor Tool - File Manipulation with Safety Features
 *
 * Features:
 * - str_replace: Replace text with uniqueness validation
 * - create: Create new files with directory creation
 * - insert: Insert text at specific line numbers
 * - view: View file contents with line numbers
 * - undo_edit: Revert to previous version
 * - Automatic backups before edits
 * - Path validation and security
 * - Optional syntax validation
 */

import * as fs from "fs/promises";
import * as path from "path";
import {
  TextEditorConfig,
  FileBackup,
  EditOperation,
  ReplaceResult,
  EditorError,
  SecurityError
} from "../types";

export class TextEditorTool {
  private config: Required<TextEditorConfig>;
  private backups: Map<string, FileBackup[]> = new Map();
  private undoStack: Map<string, EditOperation[]> = new Map();

  constructor(config: TextEditorConfig = {}) {
    this.config = {
      backupEnabled: config.backupEnabled !== false,
      validateSyntax: config.validateSyntax !== false,
      maxFileSize: config.maxFileSize || 10485760, // 10MB
      allowedDirectories: config.allowedDirectories || [process.cwd(), "/tmp"]
    };
  }

  /**
   * Replace text in a file (str_replace operation)
   * Text must match exactly once for safety
   */
  async strReplace(
    filePath: string,
    oldText: string,
    newText: string
  ): Promise<ReplaceResult> {
    this.validatePath(filePath);

    if (this.config.backupEnabled) {
      await this.createBackup(filePath);
    }

    // Read file content
    const content = await fs.readFile(filePath, "utf-8");

    // Find all matches
    const matches = this.findMatches(content, oldText);

    if (matches.length === 0) {
      throw new EditorError(
        `No matching text found in ${filePath}.\n` +
        `Looking for: ${oldText.substring(0, 100)}${oldText.length > 100 ? "..." : ""}`
      );
    }

    if (matches.length > 1) {
      throw new EditorError(
        `Found ${matches.length} matches for the text in ${filePath}. ` +
        `Text must match exactly once. ` +
        `Add more surrounding context to make the match unique.\n` +
        `Matches at positions: ${matches.join(", ")}`
      );
    }

    // Perform replacement
    const newContent = content.replace(oldText, newText);

    // Validate syntax if enabled
    if (this.config.validateSyntax) {
      await this.validateSyntax(filePath, newContent);
    }

    // Write new content
    await fs.writeFile(filePath, newContent, "utf-8");

    // Record operation
    this.recordOperation(filePath, {
      type: "str_replace",
      path: filePath,
      oldContent: content,
      newContent,
      timestamp: new Date()
    });

    return {
      path: filePath,
      matchCount: 1,
      replacedText: oldText,
      newText,
      success: true
    };
  }

  /**
   * Create a new file
   */
  async create(filePath: string, content: string): Promise<void> {
    this.validatePath(filePath);

    // Check if file exists
    try {
      await fs.access(filePath);
      throw new EditorError(`File already exists: ${filePath}`);
    } catch (error: any) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }

    // Create directory if needed
    const directory = path.dirname(filePath);
    await fs.mkdir(directory, { recursive: true });

    // Validate syntax if enabled
    if (this.config.validateSyntax) {
      await this.validateSyntax(filePath, content);
    }

    // Write file
    await fs.writeFile(filePath, content, "utf-8");

    // Record operation
    this.recordOperation(filePath, {
      type: "create",
      path: filePath,
      newContent: content,
      timestamp: new Date()
    });
  }

  /**
   * Insert text at a specific line number
   */
  async insert(
    filePath: string,
    lineNumber: number,
    text: string
  ): Promise<void> {
    this.validatePath(filePath);

    if (this.config.backupEnabled) {
      await this.createBackup(filePath);
    }

    // Read file content
    const content = await fs.readFile(filePath, "utf-8");
    const lines = content.split("\n");

    // Validate line number
    if (lineNumber < 0 || lineNumber > lines.length) {
      throw new EditorError(
        `Invalid line number ${lineNumber}. ` +
        `File has ${lines.length} lines (valid range: 0-${lines.length})`
      );
    }

    // Insert text
    lines.splice(lineNumber, 0, text);
    const newContent = lines.join("\n");

    // Validate syntax if enabled
    if (this.config.validateSyntax) {
      await this.validateSyntax(filePath, newContent);
    }

    // Write new content
    await fs.writeFile(filePath, newContent, "utf-8");

    // Record operation
    this.recordOperation(filePath, {
      type: "insert",
      path: filePath,
      oldContent: content,
      newContent,
      timestamp: new Date()
    });
  }

  /**
   * View file contents with line numbers
   */
  async view(
    filePath: string,
    startLine?: number,
    endLine?: number
  ): Promise<string> {
    this.validatePath(filePath);

    // Read file
    const content = await fs.readFile(filePath, "utf-8");
    const lines = content.split("\n");

    // Apply line range
    const start = startLine || 0;
    const end = endLine || lines.length;

    if (start < 0 || start >= lines.length) {
      throw new EditorError(
        `Invalid start line ${start}. File has ${lines.length} lines.`
      );
    }

    if (end < start || end > lines.length) {
      throw new EditorError(
        `Invalid end line ${end}. File has ${lines.length} lines.`
      );
    }

    // Format with line numbers
    const viewLines = lines.slice(start, end).map((line, index) => {
      const lineNum = start + index + 1;
      return `${lineNum.toString().padStart(4, " ")}│ ${line}`;
    });

    return viewLines.join("\n");
  }

  /**
   * Undo last edit operation
   */
  async undoEdit(filePath: string): Promise<void> {
    this.validatePath(filePath);

    const operations = this.undoStack.get(filePath);

    if (!operations || operations.length === 0) {
      throw new EditorError(`No edit history found for ${filePath}`);
    }

    // Get last operation
    const lastOp = operations[operations.length - 1];

    if (!lastOp.oldContent) {
      throw new EditorError(
        `Cannot undo: operation ${lastOp.type} has no previous content`
      );
    }

    // Restore old content
    await fs.writeFile(filePath, lastOp.oldContent, "utf-8");

    // Remove from undo stack
    operations.pop();
  }

  /**
   * Validate file path for security
   */
  private validatePath(filePath: string): void {
    // Check for path traversal
    if (filePath.includes("..")) {
      throw new SecurityError("Path traversal not allowed");
    }

    // Resolve to absolute path
    const resolved = path.resolve(filePath);

    // Check if in allowed directories
    const isAllowed = this.config.allowedDirectories.some(dir => {
      const allowedDir = path.resolve(dir);
      return resolved.startsWith(allowedDir);
    });

    if (!isAllowed) {
      throw new SecurityError(
        `Path not in allowed directories: ${filePath}\n` +
        `Allowed: ${this.config.allowedDirectories.join(", ")}`
      );
    }
  }

  /**
   * Create backup of file before editing
   */
  private async createBackup(filePath: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, "utf-8");

      const backup: FileBackup = {
        path: filePath,
        content,
        timestamp: new Date()
      };

      const backupList = this.backups.get(filePath) || [];
      backupList.push(backup);

      // Keep only last 10 backups
      if (backupList.length > 10) {
        backupList.shift();
      }

      this.backups.set(filePath, backupList);
    } catch (error: any) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }

  /**
   * Find all matches of text in content
   */
  private findMatches(content: string, searchText: string): number[] {
    const matches: number[] = [];
    let index = 0;

    while ((index = content.indexOf(searchText, index)) !== -1) {
      matches.push(index);
      index += searchText.length;
    }

    return matches;
  }

  /**
   * Record edit operation for undo
   */
  private recordOperation(filePath: string, operation: EditOperation): void {
    const operations = this.undoStack.get(filePath) || [];
    operations.push(operation);

    // Keep only last 50 operations
    if (operations.length > 50) {
      operations.shift();
    }

    this.undoStack.set(filePath, operations);
  }

  /**
   * Validate file syntax (basic check)
   */
  private async validateSyntax(
    filePath: string,
    content: string
  ): Promise<void> {
    const ext = path.extname(filePath).toLowerCase();

    // JSON validation
    if (ext === ".json") {
      try {
        JSON.parse(content);
      } catch (error: any) {
        throw new EditorError(
          `Invalid JSON syntax: ${error.message}`
        );
      }
    }

    // Additional syntax validation can be added here
    // (TypeScript, Python, etc.)
  }

  /**
   * Get backups for a file
   */
  getBackups(filePath: string): FileBackup[] {
    return this.backups.get(filePath) || [];
  }

  /**
   * Restore from backup
   */
  async restoreBackup(filePath: string, backupIndex: number): Promise<void> {
    const backups = this.getBackups(filePath);

    if (backupIndex < 0 || backupIndex >= backups.length) {
      throw new EditorError(
        `Invalid backup index ${backupIndex}. ` +
        `Available backups: 0-${backups.length - 1}`
      );
    }

    const backup = backups[backupIndex];
    await fs.writeFile(filePath, backup.content, "utf-8");
  }

  /**
   * Clear all backups
   */
  clearBackups(filePath?: string): void {
    if (filePath) {
      this.backups.delete(filePath);
      this.undoStack.delete(filePath);
    } else {
      this.backups.clear();
      this.undoStack.clear();
    }
  }

  /**
   * Get tool definitions for Claude API
   */
  getToolDefinitions(): Array<{
    type: string;
    name: string;
    description: string;
    input_schema: any;
  }> {
    return [
      {
        type: "text_editor_20250728",
        name: "str_replace",
        description: "Replace text in a file. Text must match exactly once for safety. " +
          "Add more context if multiple matches found.",
        input_schema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Path to the file to edit"
            },
            old_str: {
              type: "string",
              description: "Text to replace (must match exactly once)"
            },
            new_str: {
              type: "string",
              description: "Replacement text"
            }
          },
          required: ["path", "old_str", "new_str"]
        }
      },
      {
        type: "text_editor_20250728",
        name: "create",
        description: "Create a new file with content. Fails if file exists.",
        input_schema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Path to the file to create"
            },
            file_text: {
              type: "string",
              description: "Content of the file"
            }
          },
          required: ["path", "file_text"]
        }
      },
      {
        type: "text_editor_20250728",
        name: "insert",
        description: "Insert text at a specific line number.",
        input_schema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Path to the file"
            },
            insert_line: {
              type: "number",
              description: "Line number to insert at (0-indexed)"
            },
            new_str: {
              type: "string",
              description: "Text to insert"
            }
          },
          required: ["path", "insert_line", "new_str"]
        }
      },
      {
        type: "text_editor_20250728",
        name: "view",
        description: "View file contents with line numbers.",
        input_schema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Path to the file to view"
            },
            view_range: {
              type: "array",
              description: "[start_line, end_line] (optional)",
              items: { type: "number" },
              minItems: 2,
              maxItems: 2
            }
          },
          required: ["path"]
        }
      },
      {
        type: "text_editor_20250728",
        name: "undo_edit",
        description: "Revert the last edit operation on a file.",
        input_schema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Path to the file"
            }
          },
          required: ["path"]
        }
      }
    ];
  }
}

/**
 * Example usage:
 *
 * const editor = new TextEditorTool({
 *   backupEnabled: true,
 *   validateSyntax: true,
 *   allowedDirectories: [process.cwd(), "/tmp"]
 * });
 *
 * // Replace text
 * await editor.strReplace(
 *   "src/app.ts",
 *   "const port = 3000;",
 *   "const port = 8080;"
 * );
 *
 * // Create file
 * await editor.create("config.json", JSON.stringify({ port: 8080 }, null, 2));
 *
 * // Insert text
 * await editor.insert("README.md", 0, "# My Project");
 *
 * // View file
 * const content = await editor.view("src/app.ts", 1, 10);
 * console.log(content);
 *
 * // Undo last edit
 * await editor.undoEdit("src/app.ts");
 *
 * // Use with streaming agent
 * class MyAgent extends StreamingAgent {
 *   private editor: TextEditorTool;
 *
 *   constructor(apiKey: string) {
 *     super(apiKey);
 *     this.editor = new TextEditorTool();
 *     this.setTools(this.editor.getToolDefinitions());
 *   }
 *
 *   protected async executeTool(toolName: string, input: any): Promise<any> {
 *     switch (toolName) {
 *       case "str_replace":
 *         const result = await this.editor.strReplace(
 *           input.path,
 *           input.old_str,
 *           input.new_str
 *         );
 *         return `Replaced text in ${result.path}`;
 *
 *       case "create":
 *         await this.editor.create(input.path, input.file_text);
 *         return `Created file ${input.path}`;
 *
 *       case "insert":
 *         await this.editor.insert(input.path, input.insert_line, input.new_str);
 *         return `Inserted text at line ${input.insert_line}`;
 *
 *       case "view":
 *         return await this.editor.view(input.path, ...input.view_range || []);
 *
 *       case "undo_edit":
 *         await this.editor.undoEdit(input.path);
 *         return `Undid last edit to ${input.path}`;
 *     }
 *
 *     return super.executeTool(toolName, input);
 *   }
 * }
 */
