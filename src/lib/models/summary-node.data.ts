import { Edge, Node } from "@xyflow/react";
import { BookOpenText, LucideIcon } from "lucide-preact";
import { collectParentThreads, threadToChatMessages } from "../chat-parsing";
import { ollamaGenerate } from "../ollama.service";
import { BaseChatNodeData } from "./base-node.data";

// TODO: Move this into configuration
const chatSummaryPrompt = `## Role: Expert Conversation Analyst and Summarizer

You are an expert conversation analyst and summarizer.
Your task is to read this entire chat transcript between a user (me) and an assistant (you), then produce a **detailed, structured summary** that preserves the **user's goals, reasoning, and iterative refinements** above all else.

## **Instructions:**

Analyze the chat from start to finish**, focusing on:

- The user's evolving intent, objectives, and reasoning process.
- Key points of clarification or reiteration that reveal what the user truly wanted.
- Critical assistant insights or solutions that shaped progress (summarize briefly).
- Any **open threads, unfinished work, or next steps** the user planned or implied.

## Guidelines

- Write in a clear, factual, and professional tone.
- Be **detailed** — typically **200–400 words**.
- Avoid quoting or copying from the transcript; paraphrase insightfully.
- **Weigh user inputs more heavily than assistant outputs.**
- Treat repeated or refined user statements as signals of priority.

## Output 

Produce the following output structure:

  ## Context
  [Summarize the overall topic, background, and purpose of the conversation.]

  ## User Goals and Reasoning
  [Explain what the user is trying to accomplish, why it matters, and how their thinking evolved.]

  ## Key Progress and Decisions
  [Summarize main conclusions, choices, or agreed directions reached in the chat.]

  ## Open Threads and Next Actions
  [List unresolved issues, pending steps, or ideas the user wanted to pursue next.]

  ##   Continuation Guidance
  [Optionally include 1-2 sentences instructing a new assistant on how to seamlessly continue the work.]

## User Conversation

`

const consolidatedSummaryPrompt = (combinedSummaries: string, count: number) => `You are an expert at synthesizing multiple conversation summaries into a single coherent summary.

Below are ${count} separate conversation thread summaries. Your task is to:
1. Identify common themes and goals across all threads
2. Preserve unique insights from each thread
3. Create a single consolidated summary that captures the essence of all conversations
4. Use the same structured format as the individual summaries

${combinedSummaries}

Please provide a consolidated summary that combines all of the above threads:`;

/**
 * Summary Node - Represents a consolidated summary of upstream content
 *
 * IMPORTANT: Summary Nodes act as THREAD BOUNDARIES in the history resolution system.
 * When traversing the graph to collect parent nodes, the algorithm STOPS at Summary Nodes
 * and does NOT traverse to their parents. This prevents redundant context and token waste.
 *
 * Use cases:
 * - Manually summarize a complex thread of conversation
 * - Auto-generate summaries using LLM (via the sparkle button)
 * - Create consolidation points in large conversation trees
 */
export class SummaryNodeData extends BaseChatNodeData {

  label = 'Summary Node'
  icon: LucideIcon = BookOpenText;

  preventDepthTraversal: boolean = true;

  constructor(data?: Partial<SummaryNodeData>) {
    super();
    Object.assign(this, data);
  }

  /**
   * Auto-generate a summary by collecting all parent threads and summarizing them
   *
   * This method:
   * 1. Collects all parent threads (each parent is a separate conversation)
   * 2. Summarizes each thread independently using Ollama
   * 3. Combines all thread summaries into a final consolidated summary
   * 4. Returns the generated summary (caller is responsible for updating node content)
   *
   * @param currentNode - The current Summary Node
   * @param allNodes - All nodes in the graph
   * @param allEdges - All edges in the graph
   * @returns The generated summary text, or null if no parents exist
   */
  async generateSummary(
    currentNode: Node,
    allNodes: Node[],
    allEdges: Edge[]
  ): Promise<string | null> {
    // Collect all parent threads
    const parentThreads = collectParentThreads(currentNode, allNodes, allEdges);

    // If no parent threads exist, we can't generate a summary
    if (parentThreads.length === 0) {
      return '';
    }

    // Summarize each independently, then combine
    const threadSummaries = [];

    for (let i = 0; i < parentThreads.length; i++) {
      const summary = await this.summarizeParent(parentThreads[i]);

      if (summary) {
        threadSummaries.push(`## Thread ${i + 1}\n\n${summary}`);
      }
    }

    // If no thread summaries were generated, return null
    if (threadSummaries.length === 0) {
      return '';
    }

    // If only one thread had content, return it directly
    if (threadSummaries.length === 1) {
      return threadSummaries[0].replace(/^## Thread 1\n\n/, '');
    }

    // Combine all thread summaries into a final summary
    const combinedSummaries = threadSummaries.join('\n\n---\n\n');

    // Ask the LLM to create a final consolidated summary
    const consolidationPrompt = consolidatedSummaryPrompt(combinedSummaries, threadSummaries.length);

    return await ollamaGenerate(this.model, consolidationPrompt);
  }

  private summarizeParent(thread: Node[]) {
    // If the array is empty, no need to process further
    if (thread.length === 0) {
      return '';
    }

    // Convert the thread to an array of chat messages
    const messages = threadToChatMessages(thread);

    // If none of the nodes convert to chat messages, no need to process further
    if (messages.length === 0) {
      return '';
    }

    const summaryRequest = [
      chatSummaryPrompt,
      ...messages.map(({ role, content}) => `${role}: ${content}`)
    ].join('\n')

    return ollamaGenerate(this.model, summaryRequest);
  }
}

