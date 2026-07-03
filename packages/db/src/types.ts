/**
 * packages/db/src/types.ts
 *
 * Auto-generation command (run after any schema change):
 *   supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > packages/db/src/types.ts
 *
 * This file is the DB-layer re-export. Application code should import from
 * @trionic/shared for domain types. These raw DB row types live here.
 *
 * Issue: #73
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type DocumentStatus   = 'draft' | 'review' | 'final' | 'archived' | 'failed';
export type DocumentType     = 'petition' | 'affidavit' | 'notice' | 'agreement' | 'complaint' | 'reply' | 'other';
export type SupportedLanguage = 'en' | 'hi' | 'gu' | 'mr' | 'ta' | 'te' | 'kn' | 'bn' | 'pa' | 'ur';
export type AgentName        = 'planner' | 'classifier' | 'drafter' | 'citator' | 'reviewer' | 'translator';
export type TraceStatus      = 'ok' | 'error' | 'timeout';
export type EvalStatus       = 'running' | 'passed' | 'failed' | 'error';
export type UserRole         = 'user' | 'admin';

// ---------------------------------------------------------------------------
// Row types  (match DB columns exactly)
// ---------------------------------------------------------------------------

export interface UserRow {
  id:               string;           // uuid
  email:            string;
  display_name:     string | null;
  role:             UserRole;
  default_language: SupportedLanguage;
  onboarded_at:     string | null;    // ISO timestamptz
  created_at:       string;
  updated_at:       string;
}

export interface DocumentRow {
  id:                  string;
  owner_id:            string;
  title:               string;
  doc_type:            DocumentType;
  language:            SupportedLanguage;
  status:              DocumentStatus;
  intake_text:         string | null;
  conversation_state:  Record<string, unknown>;
  created_at:          string;
  updated_at:          string;
}

export interface DocumentVersionRow {
  id:            string;
  document_id:   string;
  version_num:   number;
  body_markdown: string;
  change_note:   string | null;
  created_by:    string;
  created_at:    string;
}

export interface CitationRow {
  id:                   string;
  document_version_id:  string;
  pageindex_node_id:    string;
  span_start:           number;
  span_end:             number;
  quote_text:           string;
  verified:             boolean;
  created_at:           string;
}

export interface AgentTraceRow {
  id:                string;
  document_id:       string | null;
  user_id:           string;
  agent_name:        AgentName;
  llm_provider:      string;
  model_name:        string;
  prompt_tokens:     number | null;
  completion_tokens: number | null;
  cost_usd:          number | null;
  latency_ms:        number | null;
  status:            TraceStatus;
  error_msg:         string | null;
  metadata:          Record<string, unknown>;
  created_at:        string;
}

export interface PageIndexTreeRow {
  id:         string;
  act_name:   string;
  act_year:   number | null;
  language:   SupportedLanguage;
  source_url: string | null;
  indexed_at: string;
  metadata:   Record<string, unknown>;
}

export interface PageIndexNodeRow {
  id:         string;
  tree_id:    string;
  node_path:  string;
  heading:    string | null;
  body_text:  string;
  embedding:  number[] | null;   // vector(1536) — null until ingestion runs
  created_at: string;
}

export interface EvalRunRow {
  id:          string;
  run_name:    string;
  eval_type:   string;
  config:      Record<string, unknown>;
  results:     Record<string, unknown> | null;
  score:       number | null;
  run_by:      string | null;
  status:      EvalStatus;
  started_at:  string;
  finished_at: string | null;
}

// ---------------------------------------------------------------------------
// Supabase Database helper type (for createClient<Database>())
// ---------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      users: {
        Row:    UserRow;
        Insert: Omit<UserRow, 'created_at' | 'updated_at'> & Partial<Pick<UserRow, 'created_at' | 'updated_at'>>;
        Update: Partial<Omit<UserRow, 'id'>>;
      };
      documents: {
        Row:    DocumentRow;
        Insert: Omit<DocumentRow, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<DocumentRow, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<Omit<DocumentRow, 'id' | 'owner_id'>>;
      };
      document_versions: {
        Row:    DocumentVersionRow;
        Insert: Omit<DocumentVersionRow, 'id' | 'created_at'> & Partial<Pick<DocumentVersionRow, 'id' | 'created_at'>>;
        Update: never;   // append-only
      };
      citations: {
        Row:    CitationRow;
        Insert: Omit<CitationRow, 'id' | 'created_at'> & Partial<Pick<CitationRow, 'id' | 'created_at'>>;
        Update: Pick<CitationRow, 'verified'>;   // only verifiable post-insert
      };
      agent_traces: {
        Row:    AgentTraceRow;
        Insert: Omit<AgentTraceRow, 'id' | 'created_at'> & Partial<Pick<AgentTraceRow, 'id' | 'created_at'>>;
        Update: never;   // immutable audit log
      };
      pageindex_trees: {
        Row:    PageIndexTreeRow;
        Insert: Omit<PageIndexTreeRow, 'id' | 'indexed_at'> & Partial<Pick<PageIndexTreeRow, 'id' | 'indexed_at'>>;
        Update: Partial<Omit<PageIndexTreeRow, 'id'>>;
      };
      pageindex_nodes: {
        Row:    PageIndexNodeRow;
        Insert: Omit<PageIndexNodeRow, 'id' | 'created_at'> & Partial<Pick<PageIndexNodeRow, 'id' | 'created_at'>>;
        Update: Pick<PageIndexNodeRow, 'embedding'>;   // only embedding updated post-insert
      };
      eval_runs: {
        Row:    EvalRunRow;
        Insert: Omit<EvalRunRow, 'id' | 'started_at'> & Partial<Pick<EvalRunRow, 'id' | 'started_at'>>;
        Update: Partial<Pick<EvalRunRow, 'results' | 'score' | 'status' | 'finished_at'>>;
      };
    };
    Enums: {
      document_status:    DocumentStatus;
      document_type:      DocumentType;
      supported_language: SupportedLanguage;
      agent_name_enum:    AgentName;
      trace_status:       TraceStatus;
      eval_status:        EvalStatus;
      user_role:          UserRole;
    };
  };
}