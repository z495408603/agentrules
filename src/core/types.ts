export type AgentTarget = "claude" | "cursor" | "copilot";

export interface PromptTemplate {
  name: string;
  content: string;
}

export interface AgentRulesConfig {
  projectName: string;
  description: string;
  stack: string[];
  targets: AgentTarget[];
  templates: string[];
  customRules: string[];
  contextFiles: string[];
  promptTemplates: PromptTemplate[];
}

export interface TemplateDefinition {
  key: string;
  label: string;
  description: string;
  stack: string[];
  ruleSections: string[];
  promptTemplates?: PromptTemplate[];
  contextFiles?: string[];
}

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface ProjectSnapshot {
  ruleSections: string[];
  promptTemplates: PromptTemplate[];
  contextFiles: string[];
}
