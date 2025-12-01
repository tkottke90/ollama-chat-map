/* Import the Registry */
import NodeRegistry from '../../lib/node-registry';

/* Import the Nodes */
import { LLMPromptNode, llmPromptNodeFactory } from './llm-prompt.node';
import { TextNode, textNodeFactory } from './text.node';


export default {
  llmPromptNodeFactory,
  textNodeFactory
}

export function RegisterNodes() {
  console.info('Registering Nodes');
  NodeRegistry.register('llm-prompt', LLMPromptNode, llmPromptNodeFactory);
  NodeRegistry.register('text-node', TextNode, textNodeFactory);
}