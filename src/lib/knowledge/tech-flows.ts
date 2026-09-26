export interface FlowNode {
  id: string
  label: string
  href?: string
  description?: string
}

export const TECH_FLOWS: Record<string, FlowNode[]> = {
  'retrieval-augmented-generation': [
    { id: 'query',   label: 'User Question' },
    { id: 'embed',   label: 'Embedding', href: '/tech/embeddings' },
    { id: 'search',  label: 'Vector Search' },
    { id: 'docs',    label: 'Relevant Documents' },
    { id: 'context', label: 'Prompt + Context' },
    { id: 'llm',     label: 'LLM', href: '/tech/large-language-models' },
    { id: 'answer',  label: 'Answer' },
  ],
  'ai-agents': [
    { id: 'goal',    label: 'Goal' },
    { id: 'llm',     label: 'LLM', href: '/tech/large-language-models' },
    { id: 'reason',  label: 'Reason & Plan' },
    { id: 'select',  label: 'Tool Selection' },
    { id: 'execute', label: 'Tool Execution' },
    { id: 'observe', label: 'Observation' },
    { id: 'repeat',  label: '↻ Repeat or Finish' },
    { id: 'result',  label: 'Result' },
  ],
  'large-language-models': [
    { id: 'input',     label: 'Text Input' },
    { id: 'tokenize',  label: 'Tokenization' },
    { id: 'embed',     label: 'Token Embeddings' },
    { id: 'attention', label: 'Attention Layers' },
    { id: 'predict',   label: 'Next Token Prediction' },
    { id: 'output',    label: 'Generated Text' },
  ],
  'kubernetes': [
    { id: 'manifest',   label: 'YAML Manifest (Desired State)' },
    { id: 'api',        label: 'API Server' },
    { id: 'scheduler',  label: 'Scheduler → Node Selection' },
    { id: 'kubelet',    label: 'Kubelet (Node Agent)' },
    { id: 'runtime',    label: 'Container Runtime' },
    { id: 'pod',        label: 'Running Pods' },
    { id: 'controller', label: 'Controller Loop: Monitor & Reconcile' },
  ],
  'apis': [
    { id: 'client',   label: 'Client (App / Browser)' },
    { id: 'request',  label: 'HTTP Request (verb + URL + body)' },
    { id: 'server',   label: 'API Server' },
    { id: 'process',  label: 'Business Logic' },
    { id: 'response', label: 'HTTP Response (status + body)' },
    { id: 'client2',  label: 'Client Receives Data' },
  ],
}
