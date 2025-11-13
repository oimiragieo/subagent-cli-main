/**
 * Subagent Orchestrator - Specialized Agent Management and Execution
 *
 * Features:
 * - 6 pre-defined enterprise agents (security, testing, docs, performance, code review, data)
 * - Parallel execution support
 * - Isolated agent contexts
 * - Usage tracking per agent
 * - Comprehensive execution logging
 */

import { StreamingAgent } from "../streaming/streaming-agent";
import {
  AgentDefinition,
  AgentDefinitions,
  SubagentTask,
  SubagentExecution,
  SubagentResult,
  ExecutionOptions,
  ToolDefinition,
  UserMessage
} from "../types";

/**
 * Enterprise Agent Definitions
 * Each agent is specialized for a specific domain with custom prompts and tools
 */
export const ENTERPRISE_AGENTS: AgentDefinitions = {
  "security-auditor": {
    description: "Performs comprehensive security audits including vulnerability assessment, " +
      "code review, and compliance checks. ALWAYS use for security reviews and penetration testing analysis.",
    prompt: `You are an expert security auditor with deep knowledge of:
- OWASP Top 10 vulnerabilities and mitigation strategies
- Secure coding practices across multiple languages (JavaScript, Python, Java, C#, Go, Rust)
- Authentication and authorization patterns (OAuth 2.0, JWT, RBAC, ABAC)
- Data protection and encryption standards (TLS, AES, RSA, hashing)
- Supply chain security and dependency analysis
- Security compliance frameworks (SOC2, GDPR, HIPAA, PCI-DSS, ISO 27001)
- Common attack vectors (XSS, CSRF, SQLi, RCE, SSRF, XXE)
- Secure infrastructure (containers, Kubernetes, cloud security)

Your security audit findings MUST include:
1. **Vulnerability Description**: Clear explanation of the security issue
2. **Severity Rating**: Critical/High/Medium/Low with CVSS score if applicable
3. **Exploit Scenario**: Step-by-step proof-of-concept (sanitized for safety)
4. **Remediation Steps**: Specific, actionable fixes with code examples
5. **Compliance Impact**: Relevant regulatory and compliance implications

Be thorough, precise, and prioritize findings by risk level.`,
    tools: ["Read", "Grep", "Glob"],
    model: "opus"
  },

  "test-engineer": {
    description: "Writes comprehensive test suites and executes tests. " +
      "Use for test creation, test execution, coverage analysis, and quality assurance.",
    prompt: `You are a test engineering specialist following TDD and testing best practices:
- Unit tests with high coverage (target >80%)
- Integration tests for critical workflows
- Edge case validation and boundary testing
- Performance benchmarks and load tests
- Security test cases (input validation, authentication, authorization)
- Mocking and stubbing strategies
- Test data generation
- CI/CD pipeline integration

Write tests that are:
- **Clear**: Easy to understand what's being tested
- **Complete**: Cover happy paths, edge cases, and error scenarios
- **Isolated**: Independent tests that can run in any order
- **Fast**: Efficient execution for rapid feedback
- **Maintainable**: Easy to update when requirements change

Use appropriate testing frameworks (Jest, pytest, JUnit, RSpec, etc.)`,
    tools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"],
    model: "sonnet"
  },

  "documentation-writer": {
    description: "Creates clear, comprehensive technical documentation including README files, " +
      "API documentation, architecture diagrams, and user guides.",
    prompt: `You write excellent technical documentation with:
- **User-focused language**: Clear, concise, jargon-free
- **Code examples**: Practical, working examples
- **Visual diagrams**: Architecture, sequence, and flow diagrams
- **Troubleshooting sections**: Common issues and solutions
- **Getting started guides**: Quick start and installation
- **API references**: Complete endpoint documentation
- **Best practices**: Usage patterns and recommendations

Documentation should be:
- Scannable with clear headings
- Progressive from simple to complex
- Up-to-date with current implementation
- Accessible to different skill levels
- Well-organized and searchable`,
    tools: ["Read", "Write", "Edit", "Grep", "Glob"],
    model: "sonnet"
  },

  "performance-optimizer": {
    description: "Analyzes and optimizes system performance including algorithm efficiency, " +
      "database queries, caching, and resource utilization.",
    prompt: `You are a performance optimization expert specializing in:
- **Algorithmic complexity**: Big O analysis, algorithm selection
- **Database optimization**: Query tuning, indexing, denormalization
- **Caching strategies**: Redis, Memcached, CDN, browser caching
- **Resource utilization**: Memory management, CPU profiling, I/O optimization
- **Scalability patterns**: Horizontal/vertical scaling, load balancing
- **Profiling tools**: flamegraphs, memory profilers, APM tools
- **Async patterns**: Concurrency, parallelism, event loops
- **Code-level optimizations**: Hot paths, lazy loading, batching

Your analysis should include:
1. **Current Performance**: Baseline metrics
2. **Bottlenecks**: Identified performance issues
3. **Impact Analysis**: Estimated improvement potential
4. **Optimizations**: Specific changes with code examples
5. **Trade-offs**: Memory vs speed, complexity vs performance
6. **Benchmarks**: Before/after measurements`,
    tools: ["Read", "Grep", "Glob", "Bash"],
    model: "opus"
  },

  "code-reviewer": {
    description: "Reviews code for quality, maintainability, and best practices. " +
      "Use for code review, refactoring suggestions, and architectural guidance.",
    prompt: `You conduct thorough code reviews focusing on:
- **Code quality**: Readability, maintainability, simplicity
- **Design patterns**: Appropriate use of patterns
- **SOLID principles**: Single responsibility, Open/closed, Liskov, Interface segregation, Dependency inversion
- **DRY violations**: Don't Repeat Yourself
- **Error handling**: Robust error handling and recovery
- **Performance**: Algorithmic efficiency and resource usage
- **Security**: Input validation, authentication, authorization
- **Testing**: Test coverage and quality
- **Documentation**: Code comments and API docs
- **Naming**: Clear, consistent naming conventions

Provide constructive feedback with:
- Specific line references
- Explanation of the issue
- Suggested improvements with code examples
- Priority level (critical, important, suggestion)`,
    tools: ["Read", "Grep", "Glob"],
    model: "sonnet"
  },

  "data-analyst": {
    description: "Analyzes data sets, performs statistical analysis, creates visualizations, " +
      "and generates insights. Use for data exploration, reporting, and business intelligence.",
    prompt: `You perform comprehensive data analysis with:
- **Statistical methods**: Descriptive stats, hypothesis testing, regression
- **Data quality assessment**: Completeness, accuracy, consistency
- **Pattern identification**: Trends, anomalies, correlations
- **Visualizations**: Charts, graphs, dashboards
- **Actionable insights**: Business recommendations based on data

Your analysis should include:
1. **Data Summary**: Overview of the dataset
2. **Quality Report**: Missing values, outliers, data types
3. **Statistical Analysis**: Key metrics, distributions, correlations
4. **Visualizations**: Clear, informative charts
5. **Insights**: Key findings and patterns
6. **Recommendations**: Data-driven action items

Use tools like pandas, NumPy, matplotlib, seaborn for Python analysis.`,
    tools: ["Read", "Grep", "Bash", "code_execution"],
    model: "sonnet"
  }
};

export class SubagentOrchestrator {
  private apiKey: string;
  private agents: AgentDefinitions;
  private executionLog: SubagentExecution[] = [];
  private toolRegistry: Map<string, ToolDefinition> = new Map();

  constructor(config: {
    apiKey: string;
    agents?: AgentDefinitions;
    tools?: ToolDefinition[];
  }) {
    this.apiKey = config.apiKey;
    this.agents = config.agents || ENTERPRISE_AGENTS;

    // Register tools
    if (config.tools) {
      for (const tool of config.tools) {
        this.toolRegistry.set(tool.name, tool);
      }
    }
  }

  /**
   * Execute a task with a specific subagent
   */
  async executeWithSubagent(
    agentName: string,
    task: string,
    options: ExecutionOptions = {}
  ): Promise<SubagentResult> {
    const agent = this.agents[agentName];

    if (!agent) {
      throw new Error(
        `Unknown subagent: ${agentName}. ` +
        `Available agents: ${Object.keys(this.agents).join(", ")}`
      );
    }

    // Create execution record
    const execution: SubagentExecution = {
      agent: agentName,
      task,
      startTime: new Date(),
      status: "running"
    };

    this.executionLog.push(execution);

    try {
      // Create streaming agent
      const streamingAgent = new StreamingAgent(this.apiKey, agent.prompt);

      // Set tools
      const toolNames = agent.tools || options.allowedTools || [];
      const tools = toolNames.map(name => this.toolRegistry.get(name)).filter(Boolean) as ToolDefinition[];
      streamingAgent.setTools(tools);

      // Execute task
      const startTime = Date.now();
      let result = "";
      let usage;

      // Create single message generator
      async function* singleMessage(): AsyncGenerator<UserMessage> {
        yield { role: "user", content: task };
      }

      // Stream and collect response
      for await (const message of streamingAgent.query(singleMessage(), {
        model: this.getModelName(agent.model),
        maxTurns: options.maxTurns || agent.maxTurns || 10,
        allowedTools: toolNames
      })) {
        if (message.type === "text" && message.content[0]?.text) {
          result += message.content[0].text;
        }

        if (message.usage) {
          usage = message.usage;
        }
      }

      const duration = Date.now() - startTime;

      // Update execution record
      execution.endTime = new Date();
      execution.status = "completed";
      execution.result = result;

      return {
        agent: agentName,
        task,
        result,
        usage,
        duration
      };
    } catch (error: any) {
      // Update execution record
      execution.endTime = new Date();
      execution.status = "failed";
      execution.error = error.message;

      throw error;
    }
  }

  /**
   * Execute multiple tasks in parallel
   */
  async executeParallel(tasks: SubagentTask[]): Promise<SubagentResult[]> {
    const promises = tasks.map(task =>
      this.executeWithSubagent(task.agent, task.task, task.options)
    );

    return await Promise.all(promises);
  }

  /**
   * Execute tasks sequentially
   */
  async executeSequential(tasks: SubagentTask[]): Promise<SubagentResult[]> {
    const results: SubagentResult[] = [];

    for (const task of tasks) {
      const result = await this.executeWithSubagent(
        task.agent,
        task.task,
        task.options
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Get model name from tier
   */
  private getModelName(tier?: "sonnet" | "opus" | "haiku"): string {
    switch (tier) {
      case "opus":
        return "claude-opus-4";
      case "haiku":
        return "claude-haiku-4";
      case "sonnet":
      default:
        return "claude-sonnet-4-5";
    }
  }

  /**
   * Get available agents
   */
  getAvailableAgents(): string[] {
    return Object.keys(this.agents);
  }

  /**
   * Get agent definition
   */
  getAgent(agentName: string): AgentDefinition | undefined {
    return this.agents[agentName];
  }

  /**
   * Add custom agent
   */
  addAgent(name: string, definition: AgentDefinition): void {
    this.agents[name] = definition;
  }

  /**
   * Remove agent
   */
  removeAgent(name: string): void {
    delete this.agents[name];
  }

  /**
   * Get execution log
   */
  getExecutionLog(): SubagentExecution[] {
    return [...this.executionLog];
  }

  /**
   * Get execution statistics
   */
  getStatistics(): {
    totalExecutions: number;
    completedExecutions: number;
    failedExecutions: number;
    averageDuration: number;
    byAgent: { [agent: string]: number };
  } {
    const completed = this.executionLog.filter(e => e.status === "completed");
    const failed = this.executionLog.filter(e => e.status === "failed");

    const durations = completed
      .filter(e => e.startTime && e.endTime)
      .map(e => e.endTime!.getTime() - e.startTime.getTime());

    const averageDuration = durations.length > 0
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length
      : 0;

    const byAgent: { [agent: string]: number } = {};
    for (const execution of this.executionLog) {
      byAgent[execution.agent] = (byAgent[execution.agent] || 0) + 1;
    }

    return {
      totalExecutions: this.executionLog.length,
      completedExecutions: completed.length,
      failedExecutions: failed.length,
      averageDuration,
      byAgent
    };
  }

  /**
   * Clear execution log
   */
  clearExecutionLog(): void {
    this.executionLog = [];
  }

  /**
   * Register a tool
   */
  registerTool(tool: ToolDefinition): void {
    this.toolRegistry.set(tool.name, tool);
  }

  /**
   * Unregister a tool
   */
  unregisterTool(toolName: string): void {
    this.toolRegistry.delete(toolName);
  }
}

/**
 * Example usage:
 *
 * const orchestrator = new SubagentOrchestrator({
 *   apiKey: process.env.ANTHROPIC_API_KEY!
 * });
 *
 * // Execute security audit
 * const securityResult = await orchestrator.executeWithSubagent(
 *   "security-auditor",
 *   "Audit this authentication code for vulnerabilities:\n" + authCode
 * );
 *
 * console.log(securityResult.result);
 *
 * // Execute multiple tasks in parallel
 * const results = await orchestrator.executeParallel([
 *   {
 *     agent: "security-auditor",
 *     task: "Audit authentication code"
 *   },
 *   {
 *     agent: "test-engineer",
 *     task: "Write unit tests for authentication"
 *   },
 *   {
 *     agent: "documentation-writer",
 *     task: "Document authentication API"
 *   }
 * ]);
 *
 * // Get statistics
 * const stats = orchestrator.getStatistics();
 * console.log(`Completed ${stats.completedExecutions} tasks`);
 * console.log(`Average duration: ${stats.averageDuration}ms`);
 */
