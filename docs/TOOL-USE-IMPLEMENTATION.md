# Claude Tool Use Implementation Guide

## Table of Contents
- [Overview](#overview)
- [Tool Definition Structure](#tool-definition-structure)
- [Best Practices](#best-practices)
- [Implementation Patterns](#implementation-patterns)
- [Parallel Tool Use](#parallel-tool-use)
- [Error Handling](#error-handling)
- [Advanced Patterns](#advanced-patterns)
- [Examples](#examples)

---

## Overview

This guide provides comprehensive patterns for implementing tool use with Claude in our AI agent framework. Following these best practices ensures optimal performance, reliability, and maintainability.

### Model Recommendations

**Recommended Models**:
- **Claude Sonnet 4.5**: Best for complex tools with ambiguous queries
- **Claude Opus 4.1**: Superior handling of multiple simultaneous tool invocations
- **Claude Haiku**: Suitable for straightforward scenarios only

**Note**: Haiku models may incorrectly infer missing parameters. Use Sonnet/Opus for production.

---

## Tool Definition Structure

Every tool consists of three essential components:

### 1. Name
- Format: `^[a-zA-Z0-9_-]{1,64}$`
- Descriptive and action-oriented
- Examples: `get_weather`, `search_database`, `analyze_logs`

### 2. Description
- **Most critical factor** in tool performance
- Plaintext explanation of tool behavior
- Minimum 3-4 sentences; complex tools need more
- Prioritize descriptions over examples

### 3. Input Schema
- JSON Schema object defining parameters
- Include type, description, and required fields
- Use descriptive parameter names

### Complete Tool Example

```json
{
  "name": "get_weather",
  "description": "Retrieves current weather information for a specified location. Use this tool when users ask about weather conditions, temperature, or forecast. The tool returns temperature, conditions, humidity, and wind speed. Location should be formatted as 'City, State' or 'City, Country' for best results.",
  "input_schema": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "The city and state/country, e.g. 'San Francisco, CA' or 'London, UK'"
      },
      "unit": {
        "type": "string",
        "enum": ["celsius", "fahrenheit"],
        "description": "Temperature unit for the response. Defaults to fahrenheit if not specified."
      }
    },
    "required": ["location"]
  }
}
```

---

## Best Practices

### 1. Write Comprehensive Descriptions

**Effective descriptions include**:
- ✅ What the tool accomplishes
- ✅ When it should/shouldn't be used
- ✅ Parameter meanings and effects
- ✅ Important limitations and caveats
- ✅ Expected output format

**Good Example**:
```json
{
  "name": "search_logs",
  "description": "Searches application logs for specific patterns or error codes across a date range. Use this tool when investigating incidents, debugging issues, or analyzing system behavior. The tool supports regex patterns and returns up to 1000 matching log entries with timestamps and severity levels. Note: This tool may take 10-30 seconds for large date ranges. Do not use for real-time monitoring; use get_live_logs instead."
}
```

**Poor Example** (Too Brief):
```json
{
  "name": "search_logs",
  "description": "Searches logs."
}
```

### 2. Parameter Descriptions

Every parameter should have:
- Clear purpose explanation
- Format/type expectations
- Valid value ranges or examples
- Default behavior if optional

```json
{
  "properties": {
    "start_date": {
      "type": "string",
      "description": "Start date for log search in ISO 8601 format (YYYY-MM-DD). Searches from midnight UTC on this date. Must be within the last 90 days."
    },
    "pattern": {
      "type": "string",
      "description": "Regex pattern to match against log messages. Use '.*' to match all logs. Special regex characters must be escaped. Case-insensitive by default."
    }
  }
}
```

### 3. Use Descriptive Names

**Good Names**:
- `calculate_shipping_cost`
- `validate_user_credentials`
- `fetch_customer_orders`
- `analyze_performance_metrics`

**Poor Names**:
- `calc`
- `check`
- `get_data`
- `process`

### 4. Handle Edge Cases

Document behavior for edge cases in descriptions:
- Empty results
- Invalid inputs
- Timeout scenarios
- Rate limiting
- Permission issues

```json
{
  "description": "Fetches user account details from the database. Returns user profile, preferences, and activity history. If the user_id doesn't exist, returns an empty result with is_error=false and a message indicating no user found. Requires 'read:users' permission; returns permission error otherwise. Maximum 100 requests per minute per API key."
}
```

---

## Implementation Patterns

### Pattern 1: Tool Runner (Recommended)

The tool runner automatically handles execution, request/response cycles, and state management.

#### Python with Decorators

```python
from anthropic import Anthropic
from anthropic.types.beta.tools import BetaTool
import json

client = Anthropic()

@beta_tool
def get_weather(location: str, unit: str = "fahrenheit") -> str:
    """
    Get current weather information for a location.

    Args:
        location: City and state/country (e.g., 'San Francisco, CA')
        unit: Temperature unit - 'celsius' or 'fahrenheit' (default: 'fahrenheit')

    Returns:
        JSON string with weather data including temperature, conditions, humidity
    """
    # Simulated weather data
    weather_data = {
        "location": location,
        "temperature": "72°F" if unit == "fahrenheit" else "22°C",
        "condition": "Sunny",
        "humidity": "45%",
        "wind_speed": "10 mph"
    }
    return json.dumps(weather_data)

@beta_tool
def search_database(query: str, max_results: int = 10) -> str:
    """
    Search the product database for items matching the query.

    Args:
        query: Search terms to match against product names and descriptions
        max_results: Maximum number of results to return (1-100, default: 10)

    Returns:
        JSON array of matching products with id, name, price, and description
    """
    # Simulated database search
    results = [
        {"id": 1, "name": "Widget", "price": 19.99, "description": "A useful widget"}
    ]
    return json.dumps(results[:max_results])

# Execute with tool runner
runner = client.beta.messages.tool_runner(
    model="claude-sonnet-4-5",
    max_tokens=2048,
    tools=[get_weather, search_database],
    messages=[{"role": "user", "content": "What's the weather in Paris and search for widgets"}]
)

# Get final response
final_response = runner.get_final_message()
print(final_response.content)
```

#### TypeScript with Zod Validation

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { betaZodTool } from '@anthropic-ai/sdk/helpers';
import { z } from 'zod';

const client = new Anthropic();

const getWeatherTool = betaZodTool({
  name: 'get_weather',
  description: 'Retrieves current weather information for a specified location. Returns temperature, conditions, humidity, and wind speed. Use when users ask about weather.',
  inputSchema: z.object({
    location: z.string().describe('City and state/country, e.g. San Francisco, CA'),
    unit: z.enum(['celsius', 'fahrenheit']).default('fahrenheit').describe('Temperature unit')
  }),
  run: async (input) => {
    // Simulated weather API call
    const weather = {
      location: input.location,
      temperature: input.unit === 'fahrenheit' ? '72°F' : '22°C',
      condition: 'Sunny',
      humidity: '45%'
    };
    return JSON.stringify(weather);
  }
});

const searchDatabaseTool = betaZodTool({
  name: 'search_database',
  description: 'Search product database for items. Returns up to max_results products matching query.',
  inputSchema: z.object({
    query: z.string().describe('Search terms for products'),
    max_results: z.number().min(1).max(100).default(10).describe('Maximum results (1-100)')
  }),
  run: async (input) => {
    // Simulated database search
    const results = [
      { id: 1, name: 'Widget', price: 19.99 }
    ];
    return JSON.stringify(results.slice(0, input.max_results));
  }
});

// Execute with tool runner
const runner = client.beta.messages.tool_runner({
  model: 'claude-sonnet-4-5',
  max_tokens: 2048,
  tools: [getWeatherTool, searchDatabaseTool],
  messages: [{ role: 'user', content: 'What is the weather and find widgets?' }]
});

// Process results
for await (const messageStream of runner) {
  for await (const event of messageStream) {
    console.log('event:', event);
  }
  const finalMessage = await messageStream.finalMessage();
  console.log('response:', finalMessage.content);
}
```

### Pattern 2: Manual Tool Implementation

When not using the tool runner, manually handle the tool execution loop:

```python
import anthropic
import json

client = anthropic.Anthropic()

def execute_tool(tool_name: str, tool_input: dict) -> dict:
    """Execute the appropriate tool based on name"""
    if tool_name == "get_weather":
        location = tool_input.get("location")
        unit = tool_input.get("unit", "fahrenheit")

        # Simulate weather API
        return {
            "location": location,
            "temperature": "72°F" if unit == "fahrenheit" else "22°C",
            "condition": "Sunny"
        }

    elif tool_name == "search_database":
        query = tool_input.get("query")
        max_results = tool_input.get("max_results", 10)

        # Simulate database search
        return [
            {"id": 1, "name": "Widget", "price": 19.99}
        ][:max_results]

    else:
        raise ValueError(f"Unknown tool: {tool_name}")

# Tool definitions
tools = [
    {
        "name": "get_weather",
        "description": "Retrieves current weather for a location. Returns temperature, conditions, and humidity. Use when users ask about weather.",
        "input_schema": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City and state/country, e.g. 'San Francisco, CA'"
                },
                "unit": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"],
                    "description": "Temperature unit"
                }
            },
            "required": ["location"]
        }
    },
    {
        "name": "search_database",
        "description": "Search product database. Returns matching products up to max_results limit.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search terms"},
                "max_results": {"type": "number", "description": "Max results (1-100)"}
            },
            "required": ["query"]
        }
    }
]

# Initial request
messages = [{"role": "user", "content": "What's the weather in Paris?"}]

# Tool execution loop
while True:
    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=2048,
        tools=tools,
        messages=messages
    )

    # Check if tool use requested
    if response.stop_reason == "tool_use":
        # Add assistant response to messages
        messages.append({"role": "assistant", "content": response.content})

        # Process all tool calls
        tool_results = []
        for content_block in response.content:
            if content_block.type == "tool_use":
                tool_name = content_block.name
                tool_input = content_block.input
                tool_use_id = content_block.id

                try:
                    # Execute tool
                    result = execute_tool(tool_name, tool_input)

                    # Add result
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": tool_use_id,
                        "content": json.dumps(result)
                    })
                except Exception as e:
                    # Handle errors
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": tool_use_id,
                        "content": str(e),
                        "is_error": True
                    })

        # Add all tool results in single user message
        messages.append({"role": "user", "content": tool_results})

    else:
        # No more tool calls, done
        break

# Final response
print(response.content[0].text)
```

---

## Parallel Tool Use

When handling multiple independent operations, invoke all relevant tools simultaneously for maximum efficiency.

### System Prompt Enhancement

Add to system prompt for parallel tool use:

```
For maximum efficiency, whenever performing multiple independent operations, invoke all relevant tools simultaneously rather than sequentially. If a user request requires multiple tool calls that don't depend on each other's results, make all calls in parallel within a single assistant message.
```

### Parallel Tool Example

```python
# User request: "Get weather in Paris and London, and search for hotels"

# Claude will make parallel tool calls:
response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=2048,
    system="For maximum efficiency, invoke multiple independent tools simultaneously.",
    tools=tools,
    messages=[{
        "role": "user",
        "content": "Get weather in Paris and London, and search for hotels"
    }]
)

# Response contains multiple tool_use blocks
# [
#   {"type": "tool_use", "name": "get_weather", "input": {"location": "Paris"}},
#   {"type": "tool_use", "name": "get_weather", "input": {"location": "London"}},
#   {"type": "tool_use", "name": "search_database", "input": {"query": "hotels"}}
# ]

# CRITICAL: Return all results in single user message
tool_results = []
for block in response.content:
    if block.type == "tool_use":
        result = execute_tool(block.name, block.input)
        tool_results.append({
            "type": "tool_result",
            "tool_use_id": block.id,
            "content": json.dumps(result)
        })

# All results in ONE user message
messages.append({"role": "user", "content": tool_results})
```

### Common Parallel Tool Issues

**Problem**: Tool results in separate messages
```python
# ❌ INCORRECT - Multiple user messages
messages.append({"role": "user", "content": [tool_result_1]})
messages.append({"role": "user", "content": [tool_result_2]})
```

**Solution**: All results in single message
```python
# ✅ CORRECT - Single user message with all results
messages.append({"role": "user", "content": [tool_result_1, tool_result_2]})
```

**Problem**: Text before tool results
```python
# ❌ INCORRECT - Text before tool_result blocks
messages.append({
    "role": "user",
    "content": [
        {"type": "text", "text": "Here are the results:"},
        {"type": "tool_result", "tool_use_id": "...", "content": "..."}
    ]
})
```

**Solution**: Tool results first, text after
```python
# ✅ CORRECT - tool_result blocks before text
messages.append({
    "role": "user",
    "content": [
        {"type": "tool_result", "tool_use_id": "...", "content": "..."},
        {"type": "text", "text": "Additional context if needed"}
    ]
})
```

---

## Error Handling

### Tool Execution Errors

Return errors using `is_error: true`:

```python
def execute_tool_safely(tool_name: str, tool_input: dict, tool_use_id: str) -> dict:
    """Execute tool with comprehensive error handling"""
    try:
        # Validate inputs
        if tool_name == "get_weather":
            location = tool_input.get("location")
            if not location:
                raise ValueError("location parameter is required")

            # Execute tool
            result = get_weather(location, tool_input.get("unit", "fahrenheit"))

            return {
                "type": "tool_result",
                "tool_use_id": tool_use_id,
                "content": json.dumps(result)
            }

    except ValueError as e:
        # Validation error
        return {
            "type": "tool_result",
            "tool_use_id": tool_use_id,
            "content": f"Validation error: {str(e)}",
            "is_error": True
        }

    except ConnectionError as e:
        # Network error
        return {
            "type": "tool_result",
            "tool_use_id": tool_use_id,
            "content": f"Connection error: Unable to reach weather service. {str(e)}",
            "is_error": True
        }

    except TimeoutError as e:
        # Timeout error
        return {
            "type": "tool_result",
            "tool_use_id": tool_use_id,
            "content": f"Timeout error: Weather service took too long to respond. {str(e)}",
            "is_error": True
        }

    except Exception as e:
        # Unexpected error
        return {
            "type": "tool_result",
            "tool_use_id": tool_use_id,
            "content": f"Unexpected error: {str(e)}",
            "is_error": True
        }
```

### Handling Incomplete Tool Use

If response hits `max_tokens` limit during tool use:

```python
def create_with_retry(client, **kwargs):
    """Create message with automatic retry for incomplete tool use"""
    max_attempts = 3
    current_max_tokens = kwargs.get("max_tokens", 2048)

    for attempt in range(max_attempts):
        response = client.messages.create(**kwargs)

        # Check if incomplete
        if response.stop_reason == "max_tokens":
            # Check if tool use was incomplete
            has_incomplete_tool = any(
                block.type == "tool_use" and not hasattr(block, 'input')
                for block in response.content
            )

            if has_incomplete_tool:
                # Increase tokens and retry
                current_max_tokens = int(current_max_tokens * 1.5)
                kwargs["max_tokens"] = current_max_tokens
                print(f"Incomplete tool use, retrying with {current_max_tokens} tokens")
                continue

        return response

    raise Exception("Failed to complete tool use after retries")
```

### Timeout Handling

```python
import asyncio
from concurrent.futures import TimeoutError

async def execute_tool_with_timeout(tool_name: str, tool_input: dict, timeout: int = 30):
    """Execute tool with timeout"""
    try:
        result = await asyncio.wait_for(
            execute_tool_async(tool_name, tool_input),
            timeout=timeout
        )
        return result

    except asyncio.TimeoutError:
        return {
            "error": f"Tool {tool_name} exceeded {timeout}s timeout",
            "status": "timeout"
        }
```

---

## Advanced Patterns

### Controlling Tool Use

Use `tool_choice` parameter to control when tools are used:

```python
# Let Claude decide (default with tools)
response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=2048,
    tools=tools,
    tool_choice={"type": "auto"},  # Default
    messages=messages
)

# Force use of ANY tool
response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=2048,
    tools=tools,
    tool_choice={"type": "any"},  # Must use at least one tool
    messages=messages
)

# Force specific tool
response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=2048,
    tools=tools,
    tool_choice={"type": "tool", "name": "get_weather"},  # Must use get_weather
    messages=messages
)

# Disable all tools
response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=2048,
    tools=tools,
    tool_choice={"type": "none"},  # No tools allowed
    messages=messages
)
```

### Streaming with Tools

```python
# Streaming tool use
with client.messages.stream(
    model="claude-sonnet-4-5",
    max_tokens=2048,
    tools=tools,
    messages=messages
) as stream:
    for event in stream:
        if event.type == "content_block_start":
            if event.content_block.type == "tool_use":
                print(f"Tool: {event.content_block.name}")

        elif event.type == "content_block_delta":
            if hasattr(event.delta, "partial_json"):
                print(f"Partial input: {event.delta.partial_json}")

    # Get complete message
    message = stream.get_final_message()
```

### Caching Tool Definitions

For tools with large descriptions or many tools, use prompt caching:

```python
# Mark tools for caching
tools_with_cache = tools.copy()
tools_with_cache[-1]["cache_control"] = {"type": "ephemeral"}

response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=2048,
    tools=tools_with_cache,  # Last tool will be cached
    messages=messages
)
```

### Batch Tools for Parallel Operations

Create wrapper tools that enable batch operations:

```python
{
    "name": "batch_weather_lookup",
    "description": "Retrieve weather for multiple locations simultaneously. More efficient than calling get_weather multiple times. Use when user asks about weather in multiple cities.",
    "input_schema": {
        "type": "object",
        "properties": {
            "locations": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Array of locations in 'City, State/Country' format"
            },
            "unit": {
                "type": "string",
                "enum": ["celsius", "fahrenheit"],
                "description": "Temperature unit for all locations"
            }
        },
        "required": ["locations"]
    }
}
```

---

## Examples

### Example 1: Simple Tool with Error Handling

```python
@beta_tool
def calculate_shipping(
    weight: float,
    destination: str,
    shipping_speed: str = "standard"
) -> str:
    """
    Calculate shipping cost based on package weight and destination.

    Use this tool when users ask about shipping costs or want to estimate
    delivery charges. Returns cost in USD and estimated delivery time.

    Args:
        weight: Package weight in pounds (must be positive, max 150 lbs)
        destination: Destination zip code (5 digits) or country code (2 letters)
        shipping_speed: Shipping speed - 'standard' (5-7 days), 'express' (2-3 days),
                       or 'overnight' (next day). Default: 'standard'

    Returns:
        JSON with cost (USD), delivery_time (days), and service_level

    Raises:
        ValueError for invalid weight or destination format
    """
    # Validation
    if weight <= 0 or weight > 150:
        raise ValueError("Weight must be between 0 and 150 pounds")

    if len(destination) not in [2, 5]:
        raise ValueError("Destination must be 2-letter country code or 5-digit zip")

    # Calculate (simplified)
    base_cost = weight * 0.50
    speed_multiplier = {
        "standard": 1.0,
        "express": 2.0,
        "overnight": 3.5
    }.get(shipping_speed, 1.0)

    cost = base_cost * speed_multiplier
    delivery_days = {
        "standard": "5-7",
        "express": "2-3",
        "overnight": "1"
    }.get(shipping_speed, "5-7")

    return json.dumps({
        "cost_usd": round(cost, 2),
        "delivery_time_days": delivery_days,
        "service_level": shipping_speed,
        "weight_lbs": weight,
        "destination": destination
    })
```

### Example 2: Database Tool with Pagination

```python
@beta_tool
def search_products(
    query: str,
    category: str = None,
    min_price: float = None,
    max_price: float = None,
    page: int = 1,
    page_size: int = 20
) -> str:
    """
    Search product catalog with filtering and pagination.

    Use this tool when users want to find products, browse categories, or
    filter by price range. Returns paginated results with total count.
    Supports fuzzy matching on product names and descriptions.

    Args:
        query: Search terms (matches name and description, case-insensitive)
        category: Filter by category slug (e.g., 'electronics', 'clothing')
        min_price: Minimum price filter in USD (inclusive)
        max_price: Maximum price filter in USD (inclusive)
        page: Page number for pagination (starts at 1)
        page_size: Results per page (1-100, default 20)

    Returns:
        JSON with products array, total_results, current_page, total_pages

    Note: Searches may take 2-5 seconds for large catalogs. Results are sorted
    by relevance score. Out of stock items are included but marked.
    """
    # Validation
    if page < 1:
        raise ValueError("Page must be >= 1")
    if page_size < 1 or page_size > 100:
        raise ValueError("page_size must be between 1 and 100")

    # Simulated database query
    all_products = [
        {"id": 1, "name": "Widget Pro", "category": "tools", "price": 29.99, "in_stock": True},
        {"id": 2, "name": "Widget Lite", "category": "tools", "price": 19.99, "in_stock": True},
        # ... more products
    ]

    # Filter
    filtered = all_products
    if query:
        filtered = [p for p in filtered if query.lower() in p["name"].lower()]
    if category:
        filtered = [p for p in filtered if p["category"] == category]
    if min_price is not None:
        filtered = [p for p in filtered if p["price"] >= min_price]
    if max_price is not None:
        filtered = [p for p in filtered if p["price"] <= max_price]

    # Paginate
    total = len(filtered)
    start = (page - 1) * page_size
    end = start + page_size
    page_products = filtered[start:end]

    return json.dumps({
        "products": page_products,
        "total_results": total,
        "current_page": page,
        "total_pages": (total + page_size - 1) // page_size,
        "page_size": page_size,
        "filters_applied": {
            "query": query,
            "category": category,
            "price_range": f"{min_price or 0}-{max_price or 'unlimited'}"
        }
    })
```

### Example 3: Multi-Step Tool Orchestration

```python
# Tools that work together
tools = [
    {
        "name": "search_users",
        "description": "Search for users by name or email. Returns user IDs, names, and emails. Use this first to find users before fetching their details or orders.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Name or email to search"}
            },
            "required": ["query"]
        }
    },
    {
        "name": "get_user_details",
        "description": "Get detailed information for a specific user by ID. Requires a valid user_id from search_users. Returns full profile, preferences, and account status.",
        "input_schema": {
            "type": "object",
            "properties": {
                "user_id": {"type": "number", "description": "User ID from search_users"}
            },
            "required": ["user_id"]
        }
    },
    {
        "name": "get_user_orders",
        "description": "Fetch all orders for a specific user. Requires user_id from search_users. Returns order history with dates, totals, and status. Limited to last 12 months.",
        "input_schema": {
            "type": "object",
            "properties": {
                "user_id": {"type": "number", "description": "User ID from search_users"}
            },
            "required": ["user_id"]
        }
    }
]

# User request: "Show me John Smith's account details and recent orders"
# Claude will:
# 1. Call search_users(query="John Smith")
# 2. Get user_id from results
# 3. Call get_user_details(user_id=X) and get_user_orders(user_id=X) in parallel
```

---

## Integration with Our Agent Framework

### Enhanced Agent Base Class

```javascript
// lib/agent-base.js

class AgentBase {
  constructor(config = {}) {
    this.config = config;
    this.tools = [];
    this.claude = new Anthropic();
    this.conversationHistory = [];
  }

  /**
   * Register a tool with comprehensive validation
   */
  registerTool(tool) {
    // Validate tool definition
    if (!tool.name || !tool.description || !tool.input_schema) {
      throw new Error('Tool must have name, description, and input_schema');
    }

    // Validate name format
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(tool.name)) {
      throw new Error('Tool name must match ^[a-zA-Z0-9_-]{1,64}$');
    }

    // Warn if description is too short
    if (tool.description.length < 100) {
      console.warn(`Tool ${tool.name} has short description (${tool.description.length} chars). Recommend 3-4 sentences minimum.`);
    }

    this.tools.push(tool);
  }

  /**
   * Execute agent with tool support
   */
  async execute(userMessage, options = {}) {
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    // Tool execution loop
    let maxIterations = options.maxToolIterations || 10;
    let iteration = 0;

    while (iteration < maxIterations) {
      iteration++;

      // Create message with tools
      const response = await this.claude.messages.create({
        model: options.model || 'claude-sonnet-4-5',
        max_tokens: options.maxTokens || 2048,
        system: this.getSystemPrompt(),
        tools: this.tools,
        tool_choice: options.toolChoice || { type: 'auto' },
        messages: this.conversationHistory
      });

      // Handle response
      if (response.stop_reason === 'tool_use') {
        // Add assistant message
        this.conversationHistory.push({
          role: 'assistant',
          content: response.content
        });

        // Execute all tools in parallel
        const toolResults = await this.executeToolsParallel(response.content);

        // Add results in single user message
        this.conversationHistory.push({
          role: 'user',
          content: toolResults
        });

        // Continue loop
        continue;
      } else {
        // Done - return final response
        return {
          content: response.content,
          stop_reason: response.stop_reason,
          usage: response.usage,
          iterations: iteration
        };
      }
    }

    throw new Error(`Max tool iterations (${maxIterations}) exceeded`);
  }

  /**
   * Execute multiple tools in parallel
   */
  async executeToolsParallel(contentBlocks) {
    const toolUseBlocks = contentBlocks.filter(block => block.type === 'tool_use');

    // Execute all tools concurrently
    const results = await Promise.all(
      toolUseBlocks.map(async (block) => {
        try {
          const result = await this.executeTool(block.name, block.input);
          return {
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result)
          };
        } catch (error) {
          return {
            type: 'tool_result',
            tool_use_id: block.id,
            content: error.message,
            is_error: true
          };
        }
      })
    );

    return results;
  }

  /**
   * Override in subclasses to implement tool execution
   */
  async executeTool(toolName, toolInput) {
    throw new Error(`Tool execution not implemented: ${toolName}`);
  }

  /**
   * Get system prompt with parallel tool instruction
   */
  getSystemPrompt() {
    return `${this.config.systemPrompt || ''}

For maximum efficiency, whenever performing multiple independent operations, invoke all relevant tools simultaneously rather than sequentially. If a user request requires multiple tool calls that don't depend on each other's results, make all calls in parallel within a single assistant message.`;
  }
}

module.exports = AgentBase;
```

---

## Summary

### Key Takeaways

1. **Descriptions are critical** - Invest time in comprehensive, clear descriptions
2. **Use latest models** - Sonnet 4.5 or Opus 4.1 for complex tools
3. **Parallel tool use** - Invoke independent tools simultaneously
4. **Error handling** - Use `is_error: true` for execution failures
5. **Tool runner recommended** - Simplifies implementation and state management
6. **Single user message** - Return all tool results in one message
7. **Descriptive names** - Action-oriented, clear tool names
8. **Document edge cases** - Explain limitations and special scenarios

### Anti-Patterns to Avoid

- ❌ Brief, vague tool descriptions
- ❌ Separate user messages for each tool result
- ❌ Text before tool_result blocks in content array
- ❌ Using Haiku for complex tools
- ❌ Not handling errors gracefully
- ❌ Sequential tool calls when parallel would work
- ❌ Generic tool names like "get_data" or "process"

### Performance Optimization

1. Use prompt caching for tool definitions
2. Implement batch/bulk tools for common operations
3. Set appropriate `max_tokens` to avoid truncation
4. Use streaming for long-running tools
5. Enable parallel tool use in system prompt
6. Monitor and log tool execution times

---

## Additional Resources

- [Official Claude Tool Use Documentation](https://docs.claude.com/en/docs/agents-and-tools/tool-use)
- [Anthropic SDK Documentation](https://docs.anthropic.com/claude/reference)
- [JSON Schema Specification](https://json-schema.org/)
- [Tool Use Best Practices](https://docs.anthropic.com/claude/docs/tool-use-best-practices)
