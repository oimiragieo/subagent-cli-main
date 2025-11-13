/**
 * Prompt Engineering Templates - Chain of Thought and XML Structuring
 *
 * Features:
 * - Chain of Thought (CoT) prompting for complex reasoning
 * - XML-structured prompts for clear component separation
 * - Pre-built templates for common tasks
 * - Template composition and customization
 */

/**
 * Chain of Thought Prompt Builder
 * For tasks requiring step-by-step reasoning
 */
export class ChainOfThoughtPrompt {
  /**
   * Create a basic Chain of Thought prompt
   */
  static create(task: string, context?: string): string {
    return `
<task>
${task}
</task>

${context ? `<context>\n${context}\n</context>\n` : ""}

<instructions>
Approach this task systematically using step-by-step reasoning.
Break down the problem into logical stages and work through each stage carefully.
</instructions>

<thinking>
Work through your reasoning step-by-step:
1. [First, analyze the requirements]
2. [Next, consider the approach]
3. [Then, evaluate alternatives]
4. [Finally, formulate the solution]
</thinking>

<solution>
[Provide your final answer or implementation]
</solution>
`;
  }

  /**
   * Create a security audit Chain of Thought prompt
   */
  static createSecurityAudit(code: string, context?: string): string {
    return `
<task>
Perform a comprehensive security audit of the provided code.
</task>

<code>
${code}
</code>

${context ? `<context>\n${context}\n</context>\n` : ""}

<guidelines>
- Focus on OWASP Top 10 vulnerabilities
- Check for injection flaws (SQL, XSS, Command)
- Assess authentication and authorization
- Review data protection measures
- Identify security misconfigurations
- Check for known vulnerable dependencies
</guidelines>

<thinking>
Step-by-step security analysis:
1. [Identify entry points and user input handling]
2. [Analyze authentication and authorization mechanisms]
3. [Review data validation and sanitization]
4. [Check for common vulnerability patterns]
5. [Assess cryptography and sensitive data handling]
6. [Evaluate error handling and information disclosure]
7. [Review dependencies and supply chain risks]
</thinking>

<output_format>
<risk_assessment>
    <critical>[Critical severity issues requiring immediate action]</critical>
    <high>[High severity issues to address soon]</high>
    <medium>[Medium severity issues for next iteration]</medium>
    <low>[Low severity informational findings]</low>
</risk_assessment>

<recommendations>
    <immediate>[Urgent actions to take now]</immediate>
    <short_term>[Actions for next sprint]</short_term>
    <long_term>[Strategic improvements]</long_term>
</recommendations>

<compliance>
[Regulatory and compliance implications (GDPR, HIPAA, PCI-DSS, etc.)]
</compliance>
</output_format>
`;
  }

  /**
   * Create a debugging Chain of Thought prompt
   */
  static createDebugging(
    error: string,
    code: string,
    context?: string
  ): string {
    return `
<task>
Debug and fix the following error in the provided code.
</task>

<error>
${error}
</error>

<code>
${code}
</code>

${context ? `<context>\n${context}\n</context>\n` : ""}

<thinking>
Systematic debugging approach:
1. [Understand the error message and stack trace]
2. [Identify the failing code location]
3. [Analyze the root cause]
4. [Consider edge cases and boundary conditions]
5. [Formulate a fix]
6. [Verify the fix won't introduce new issues]
</thinking>

<solution>
<root_cause>
[Explain the underlying issue]
</root_cause>

<fix>
[Provide the corrected code]
</fix>

<explanation>
[Explain why this fix resolves the issue]
</explanation>

<testing>
[Suggest test cases to verify the fix]
</testing>
</solution>
`;
  }

  /**
   * Create a code review Chain of Thought prompt
   */
  static createCodeReview(code: string, context?: string): string {
    return `
<task>
Conduct a thorough code review focusing on quality, maintainability, and best practices.
</task>

<code>
${code}
</code>

${context ? `<context>\n${context}\n</context>\n` : ""}

<review_criteria>
- Code quality and readability
- Design patterns and SOLID principles
- Error handling and edge cases
- Performance and scalability
- Security considerations
- Test coverage
- Documentation
</review_criteria>

<thinking>
Step-by-step code review:
1. [Assess overall code structure and organization]
2. [Review naming conventions and clarity]
3. [Evaluate error handling and edge cases]
4. [Check for code duplication (DRY)]
5. [Analyze performance implications]
6. [Review security considerations]
7. [Assess test coverage and quality]
</thinking>

<review>
<strengths>
[What the code does well]
</strengths>

<issues>
<critical>
[Critical issues requiring immediate attention]
</critical>
<important>
[Important issues to address]
</important>
<suggestions>
[Optional improvements and suggestions]
</suggestions>
</issues>

<recommendations>
[Specific actionable recommendations with code examples]
</recommendations>
</review>
`;
  }

  /**
   * Create an optimization Chain of Thought prompt
   */
  static createOptimization(code: string, metrics: string): string {
    return `
<task>
Analyze and optimize the provided code for better performance.
</task>

<code>
${code}
</code>

<current_metrics>
${metrics}
</current_metrics>

<thinking>
Performance optimization analysis:
1. [Profile and identify bottlenecks]
2. [Analyze algorithmic complexity]
3. [Review data structures and access patterns]
4. [Consider caching opportunities]
5. [Evaluate I/O and network operations]
6. [Formulate optimization strategies]
7. [Assess trade-offs]
</thinking>

<optimization>
<bottlenecks>
[Identified performance bottlenecks]
</bottlenecks>

<improvements>
[Specific optimizations with code examples]
</improvements>

<expected_impact>
[Estimated performance improvements]
</expected_impact>

<trade_offs>
[Memory vs speed, complexity vs performance, etc.]
</trade_offs>
</optimization>
`;
  }
}

/**
 * XML Structured Prompt Builder
 * For clear separation of prompt components
 */
export class XMLStructuredPrompt {
  private components: Map<string, string> = new Map();

  /**
   * Add a component to the prompt
   */
  addComponent(name: string, content: string): this {
    this.components.set(name, content);
    return this;
  }

  /**
   * Build the complete XML-structured prompt
   */
  build(): string {
    const parts: string[] = [];

    for (const [name, content] of this.components.entries()) {
      parts.push(`<${name}>\n${content}\n</${name}>`);
    }

    return parts.join("\n\n");
  }

  /**
   * Clear all components
   */
  clear(): this {
    this.components.clear();
    return this;
  }

  /**
   * Create a task-focused prompt
   */
  static createTask(task: string, context?: string, instructions?: string): string {
    const builder = new XMLStructuredPrompt();

    builder.addComponent("task", task);

    if (context) {
      builder.addComponent("context", context);
    }

    if (instructions) {
      builder.addComponent("instructions", instructions);
    }

    return builder.build();
  }

  /**
   * Create a multi-step workflow prompt
   */
  static createWorkflow(
    steps: Array<{ name: string; description: string }>,
    context?: string
  ): string {
    const builder = new XMLStructuredPrompt();

    if (context) {
      builder.addComponent("context", context);
    }

    const stepsContent = steps
      .map(
        (step, index) =>
          `<step number="${index + 1}">\n` +
          `  <name>${step.name}</name>\n` +
          `  <description>${step.description}</description>\n` +
          `</step>`
      )
      .join("\n\n");

    builder.addComponent("workflow", stepsContent);

    return builder.build();
  }

  /**
   * Create a data analysis prompt
   */
  static createDataAnalysis(
    data: string,
    questions: string[],
    context?: string
  ): string {
    const builder = new XMLStructuredPrompt();

    if (context) {
      builder.addComponent("context", context);
    }

    builder.addComponent("data", data);

    const questionsContent = questions
      .map((q, i) => `${i + 1}. ${q}`)
      .join("\n");

    builder.addComponent("questions", questionsContent);

    builder.addComponent(
      "output_format",
      `<analysis>
  <summary>[Brief overview of the data]</summary>
  <findings>[Key insights and patterns]</findings>
  <visualizations>[Suggested charts or graphs]</visualizations>
  <recommendations>[Data-driven recommendations]</recommendations>
</analysis>`
    );

    return builder.build();
  }
}

/**
 * Pre-built prompt templates for common scenarios
 */
export class PromptTemplates {
  /**
   * Test generation template
   */
  static testGeneration(code: string, framework: string): string {
    return ChainOfThoughtPrompt.create(
      `Generate comprehensive unit tests for the provided code using ${framework}.`,
      `Code to test:\n\`\`\`\n${code}\n\`\`\`\n\n` +
        `Requirements:\n` +
        `- Test happy paths\n` +
        `- Test edge cases\n` +
        `- Test error scenarios\n` +
        `- Use descriptive test names\n` +
        `- Include setup and teardown if needed`
    );
  }

  /**
   * Documentation template
   */
  static documentation(code: string, format: "markdown" | "jsdoc"): string {
    return XMLStructuredPrompt.createTask(
      `Generate ${format} documentation for the provided code.`,
      `Code:\n\`\`\`\n${code}\n\`\`\``,
      `Include:\n` +
        `- Function/class description\n` +
        `- Parameters with types\n` +
        `- Return values\n` +
        `- Usage examples\n` +
        `- Error conditions`
    );
  }

  /**
   * Refactoring template
   */
  static refactoring(code: string, goals: string[]): string {
    return new XMLStructuredPrompt()
      .addComponent("task", "Refactor the provided code to improve quality and maintainability")
      .addComponent("code", code)
      .addComponent("goals", goals.map((g, i) => `${i + 1}. ${g}`).join("\n"))
      .addComponent(
        "output",
        `<refactoring>\n` +
          `  <changes>[Summary of changes made]</changes>\n` +
          `  <code>[Refactored code]</code>\n` +
          `  <rationale>[Explanation of improvements]</rationale>\n` +
          `</refactoring>`
      )
      .build();
  }

  /**
   * API design template
   */
  static apiDesign(requirements: string): string {
    return ChainOfThoughtPrompt.create(
      "Design a RESTful API based on the requirements.",
      `Requirements:\n${requirements}\n\n` +
        `Consider:\n` +
        `- Resource modeling\n` +
        `- HTTP methods and status codes\n` +
        `- Request/response formats\n` +
        `- Authentication and authorization\n` +
        `- Error handling\n` +
        `- Versioning\n` +
        `- Rate limiting`
    );
  }

  /**
   * SQL query optimization template
   */
  static sqlOptimization(query: string, schema: string): string {
    return new XMLStructuredPrompt()
      .addComponent("task", "Optimize the provided SQL query for better performance")
      .addComponent("query", query)
      .addComponent("schema", schema)
      .addComponent(
        "analysis",
        `<thinking>\n` +
          `1. [Analyze query execution plan]\n` +
          `2. [Identify full table scans]\n` +
          `3. [Check index usage]\n` +
          `4. [Review JOIN strategies]\n` +
          `5. [Evaluate subquery performance]\n` +
          `</thinking>\n\n` +
          `<optimized_query>\n` +
          `[Optimized SQL]\n` +
          `</optimized_query>\n\n` +
          `<improvements>\n` +
          `[Explanation of optimizations]\n` +
          `</improvements>\n\n` +
          `<indexes>\n` +
          `[Suggested index additions]\n` +
          `</indexes>`
      )
      .build();
  }

  /**
   * Incident response template
   */
  static incidentResponse(
    issue: string,
    logs: string,
    context: string
  ): string {
    return new XMLStructuredPrompt()
      .addComponent("incident", issue)
      .addComponent("logs", logs)
      .addComponent("context", context)
      .addComponent(
        "response",
        `<analysis>\n` +
          `  <root_cause>[Identified root cause]</root_cause>\n` +
          `  <impact>[Impact assessment]</impact>\n` +
          `  <immediate_actions>[Steps to resolve now]</immediate_actions>\n` +
          `  <prevention>[Steps to prevent recurrence]</prevention>\n` +
          `  <monitoring>[Monitoring and alerting improvements]</monitoring>\n` +
          `</analysis>`
      )
      .build();
  }
}

/**
 * Example usage:
 *
 * // Chain of Thought
 * const cotPrompt = ChainOfThoughtPrompt.createSecurityAudit(authCode);
 * const response = await agent.querySingle(cotPrompt);
 *
 * // XML Structured
 * const xmlPrompt = XMLStructuredPrompt.createDataAnalysis(
 *   csvData,
 *   ["What are the top 5 products?", "What's the average order value?"],
 *   "Sales data from Q4 2024"
 * );
 *
 * // Pre-built templates
 * const testPrompt = PromptTemplates.testGeneration(code, "jest");
 * const docPrompt = PromptTemplates.documentation(code, "jsdoc");
 */
