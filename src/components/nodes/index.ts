/* Import the Registry */
import NodeRegistry from '@/lib/node-registry';

/* Import the Nodes */
import { FileNode, fileNodeFactory } from './file.node';
import { LLMPromptNode, llmPromptNodeFactory } from './llm-prompt.node';
import { SummaryNode, summaryNodeFactory } from './summary.node';
import { TextNode, textNodeFactory } from './text.node';


export default {
  llmPromptNodeFactory,
  textNodeFactory,
  fileNodeFactory,
  summaryNodeFactory
}

export function RegisterNodes() {
  console.info('Registering Nodes');

  NodeRegistry.register('file-node', FileNode, fileNodeFactory);
  NodeRegistry.register('llm-prompt', LLMPromptNode, llmPromptNodeFactory);
  NodeRegistry.register('summary-node', SummaryNode, summaryNodeFactory);
  NodeRegistry.register('text-node', TextNode, textNodeFactory);
}