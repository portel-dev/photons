/**
 * MCP Orchestrator - Combine multiple MCPs into powerful workflows
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @tags orchestrator, mcp, workflow, integration, polyglot
 * @icon 🔗
 */

import { PhotonMCP } from '@portel/photon-core';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

interface WorkflowResult {
  success: boolean;
  steps: Array<{
    name: string;
    mcp: string;
    result: any;
    duration: number;
  }>;
  finalOutput?: any;
  errors?: string[];
}

interface MCPStatus {
  name: string;
  available: boolean;
  tools?: string[];
  error?: string;
}

export default class MCPOrchestratorPhoton extends PhotonMCP {
  /**
   * List all available MCPs and their tools
   */
  async discover({ mcpNames }: { mcpNames?: string } = {}): Promise<MCPStatus[]> {
    const names = mcpNames
      ? mcpNames.split(',').map((n) => n.trim())
      : ['tavily', 'browser', 'sequential-thinking', 'whatsapp', 'Shell'];

    const statuses: MCPStatus[] = [];

    for (const name of names) {
      try {
        const client = this.mcp(name);
        const tools = await client.list();
        statuses.push({
          name,
          available: true,
          tools: tools.map((t: any) => t.name || t),
        });
      } catch (error: any) {
        statuses.push({
          name,
          available: false,
          error: error.message,
        });
      }
    }

    return statuses;
  }

  /**
   * Check if a specific MCP is available
   */
  async check({ mcpName }: { mcpName: string }): Promise<MCPStatus> {
    try {
      const client = this.mcp(mcpName);
      const tools = await client.list();
      return {
        name: mcpName,
        available: true,
        tools: tools.map((t: any) => t.name || t),
      };
    } catch (error: any) {
      return {
        name: mcpName,
        available: false,
        error: error.message,
      };
    }
  }

  /**
   * Call a tool on any MCP
   */
  async call({
    mcpName,
    toolName,
    params,
  }: {
    mcpName: string;
    toolName: string;
    params?: string;
  }): Promise<any> {
    const parsedParams = params ? JSON.parse(params) : {};

    try {
      const client = this.mcp(mcpName);
      // Use the call method for explicit tool calls
      const result = await client.call(toolName, parsedParams);
      return {
        success: true,
        mcp: mcpName,
        tool: toolName,
        result,
      };
    } catch (error: any) {
      return {
        success: false,
        mcp: mcpName,
        tool: toolName,
        error: error.message,
      };
    }
  }

  /**
   * Research Workflow - Combine search and browser MCPs
   */
  async research({
    query,
    fetchContent = false,
    maxResults = 5,
  }: {
    query: string;
    fetchContent?: boolean;
    maxResults?: number;
  }): Promise<WorkflowResult> {
    const workflow: WorkflowResult = {
      success: true,
      steps: [],
      errors: [],
    };

    // Step 1: Search using Tavily
    const searchStart = Date.now();
    try {
      const tavily = this.mcp('tavily');
      const searchResult = await tavily.tavily_search({
        query,
        max_results: maxResults,
      });

      workflow.steps.push({
        name: 'Search',
        mcp: 'tavily',
        result: searchResult,
        duration: Date.now() - searchStart,
      });
    } catch (error: any) {
      workflow.errors!.push(`Search failed: ${error.message}`);
      workflow.success = false;

      // Try fallback - just return the query as a suggestion
      workflow.steps.push({
        name: 'Search',
        mcp: 'tavily',
        result: { error: error.message, fallback: true },
        duration: Date.now() - searchStart,
      });
    }

    // Step 2: Optionally fetch content using Browser MCP
    if (fetchContent && workflow.steps[0]?.result?.results?.[0]?.url) {
      const fetchStart = Date.now();
      try {
        const browser = this.mcp('browser');
        const url = workflow.steps[0].result.results[0].url;

        // Use browser to navigate and get content
        const pageResult = await browser.browser_navigate({ url });

        workflow.steps.push({
          name: 'Fetch Content',
          mcp: 'browser',
          result: pageResult,
          duration: Date.now() - fetchStart,
        });
      } catch (error: any) {
        workflow.errors!.push(`Content fetch failed: ${error.message}`);
        workflow.steps.push({
          name: 'Fetch Content',
          mcp: 'browser',
          result: { error: error.message },
          duration: Date.now() - fetchStart,
        });
      }
    }

    // Compile final output
    workflow.finalOutput = {
      query,
      resultsCount: workflow.steps[0]?.result?.results?.length || 0,
      topResults: workflow.steps[0]?.result?.results?.slice(0, 3) || [],
      contentFetched: workflow.steps.length > 1,
    };

    return workflow;
  }

  /**
   * Multi-Step Reasoning Workflow using sequential-thinking MCP
   */
  async reason({
    problem,
    steps = 3,
  }: {
    problem: string;
    steps?: number;
  }): Promise<WorkflowResult> {
    const workflow: WorkflowResult = {
      success: true,
      steps: [],
      errors: [],
    };

    const startTime = Date.now();

    try {
      const reasoning = this.mcp('sequential-thinking');

      // Call the sequential thinking tool
      const result = await reasoning.sequentialthinking({
        thought: problem,
        nextThoughtNeeded: true,
      });

      workflow.steps.push({
        name: 'Initial Analysis',
        mcp: 'sequential-thinking',
        result,
        duration: Date.now() - startTime,
      });

      // Continue reasoning for additional steps
      let currentThought = result;
      for (let i = 1; i < steps && currentThought?.nextThoughtNeeded; i++) {
        const stepStart = Date.now();
        currentThought = await reasoning.sequentialthinking({
          thought: `Continue analyzing: ${currentThought.thought || problem}`,
          thoughtNumber: i + 1,
          nextThoughtNeeded: i < steps - 1,
        });

        workflow.steps.push({
          name: `Reasoning Step ${i + 1}`,
          mcp: 'sequential-thinking',
          result: currentThought,
          duration: Date.now() - stepStart,
        });
      }

      workflow.finalOutput = {
        problem,
        totalSteps: workflow.steps.length,
        conclusion: workflow.steps[workflow.steps.length - 1]?.result,
      };
    } catch (error: any) {
      workflow.success = false;
      workflow.errors!.push(`Reasoning failed: ${error.message}`);
      workflow.steps.push({
        name: 'Reasoning',
        mcp: 'sequential-thinking',
        result: { error: error.message },
        duration: Date.now() - startTime,
      });
    }

    return workflow;
  }

  /**
   * Shell Command Workflow - Execute system commands
   */
  async shell({
    command,
    workingDir,
  }: {
    command: string;
    workingDir?: string;
  }): Promise<WorkflowResult> {
    const workflow: WorkflowResult = {
      success: true,
      steps: [],
      errors: [],
    };

    const startTime = Date.now();

    try {
      const shell = this.mcp('Shell');
      const result = await shell.run_command({
        command,
        cwd: workingDir,
      });

      workflow.steps.push({
        name: 'Execute Command',
        mcp: 'Shell',
        result,
        duration: Date.now() - startTime,
      });

      workflow.finalOutput = {
        command,
        output: result?.stdout || result,
        exitCode: result?.exitCode || 0,
      };
    } catch (error: any) {
      workflow.success = false;
      workflow.errors!.push(`Shell command failed: ${error.message}`);
      workflow.steps.push({
        name: 'Execute Command',
        mcp: 'Shell',
        result: { error: error.message },
        duration: Date.now() - startTime,
      });
    }

    return workflow;
  }

  /**
   * Parallel MCP Execution - Call multiple MCPs concurrently
   */
  async parallel({ mcpCalls }: { mcpCalls: string }): Promise<WorkflowResult> {
    const calls = JSON.parse(mcpCalls) as Array<{
      mcp: string;
      tool: string;
      params?: any;
    }>;

    const workflow: WorkflowResult = {
      success: true,
      steps: [],
      errors: [],
    };

    // Execute all calls in parallel
    const startTime = Date.now();
    const promises = calls.map(async (call) => {
      const callStart = Date.now();
      try {
        const client = this.mcp(call.mcp);
        const result = await client.call(call.tool, call.params || {});
        return {
          name: `${call.mcp}.${call.tool}`,
          mcp: call.mcp,
          result,
          duration: Date.now() - callStart,
          success: true,
        };
      } catch (error: any) {
        return {
          name: `${call.mcp}.${call.tool}`,
          mcp: call.mcp,
          result: { error: error.message },
          duration: Date.now() - callStart,
          success: false,
        };
      }
    });

    const results = await Promise.all(promises);

    for (const result of results) {
      workflow.steps.push({
        name: result.name,
        mcp: result.mcp,
        result: result.result,
        duration: result.duration,
      });

      if (!result.success) {
        workflow.errors!.push(`${result.name}: ${result.result.error}`);
      }
    }

    workflow.success = workflow.errors!.length === 0;
    workflow.finalOutput = {
      totalCalls: calls.length,
      successfulCalls: results.filter((r) => r.success).length,
      totalDuration: Date.now() - startTime,
      results: results.map((r) => ({
        call: r.name,
        success: r.success,
        duration: r.duration,
      })),
    };

    return workflow;
  }

  /**
   * Chained MCP Workflow - Output from one MCP becomes input to another
   */
  async chain({ steps }: { steps: string }): Promise<WorkflowResult> {
    const stepDefs = JSON.parse(steps) as Array<{
      mcp: string;
      tool: string;
      params?: any;
      outputKey?: string;
      inputFrom?: string;
    }>;

    const workflow: WorkflowResult = {
      success: true,
      steps: [],
      errors: [],
    };

    const context: Record<string, any> = {};

    for (const step of stepDefs) {
      const stepStart = Date.now();

      // Inject previous outputs into params
      let params = { ...step.params };
      if (step.inputFrom && context[step.inputFrom]) {
        params = { ...params, input: context[step.inputFrom] };
      }

      try {
        const client = this.mcp(step.mcp);
        const result = await client.call(step.tool, params);

        workflow.steps.push({
          name: `${step.mcp}.${step.tool}`,
          mcp: step.mcp,
          result,
          duration: Date.now() - stepStart,
        });

        // Store output for next step
        if (step.outputKey) {
          context[step.outputKey] = result;
        }
      } catch (error: any) {
        workflow.success = false;
        workflow.errors!.push(`${step.mcp}.${step.tool}: ${error.message}`);
        workflow.steps.push({
          name: `${step.mcp}.${step.tool}`,
          mcp: step.mcp,
          result: { error: error.message },
          duration: Date.now() - stepStart,
        });

        // Stop chain on error
        break;
      }
    }

    workflow.finalOutput = {
      completedSteps: workflow.steps.length,
      totalSteps: stepDefs.length,
      context,
    };

    return workflow;
  }

  /**
   * Get detailed info about a specific MCP's tools
   */
  async inspect({ mcpName }: { mcpName: string }): Promise<any> {
    try {
      const client = this.mcp(mcpName);
      const tools = await client.list();

      return {
        mcp: mcpName,
        available: true,
        toolCount: tools.length,
        tools: tools.map((t: any) => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
        })),
      };
    } catch (error: any) {
      return {
        mcp: mcpName,
        available: false,
        error: error.message,
      };
    }
  }

  /**
   * Find tools across multiple MCPs by keyword
   */
  async tools({
    query,
    mcpNames,
  }: {
    query: string;
    mcpNames?: string;
  }): Promise<any[]> {
    const names = mcpNames
      ? mcpNames.split(',').map((n) => n.trim())
      : ['tavily', 'browser', 'sequential-thinking', 'Shell'];

    const results: any[] = [];

    for (const name of names) {
      try {
        const client = this.mcp(name);
        const tools = await client.find(query);

        if (tools && tools.length > 0) {
          results.push({
            mcp: name,
            tools: tools.map((t: any) => ({
              name: t.name,
              description: t.description,
            })),
          });
        }
      } catch (error: any) {
        // Skip unavailable MCPs
      }
    }

    return results;
  }
}
