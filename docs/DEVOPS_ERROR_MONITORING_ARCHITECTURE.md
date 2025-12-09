# DevOps Error Monitoring & LLM Agent Architecture

## Overview

This document describes the enhanced error monitoring system with DevOps integration, allowing LLM agents (Claude Opus 4.5, Codex) to automatically fix minor errors with proper approval workflows.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BOOKINGTMS ERROR MONITORING                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────┐      │
│  │   Frontend   │───▶│   Backend    │───▶│     Error Processing      │      │
│  │   Capture    │    │   Dashboard  │    │                          │      │
│  └──────────────┘    └──────────────┘    │  • Deduplicate           │      │
│                                          │  • Classify              │      │
│  ┌──────────────┐                        │  • Prioritize            │      │
│  │    Global    │                        │  • Route to handler      │      │
│  │   Handlers   │───▶                    └────────────┬─────────────┘      │
│  │  • onerror   │                                     │                     │
│  │  • rejection │                                     ▼                     │
│  │  • fetch     │                        ┌──────────────────────────┐      │
│  └──────────────┘                        │     Error Categories      │      │
│                                          │                          │      │
│  ┌──────────────┐                        │  MINOR (Auto-fixable)    │      │
│  │   DevOps     │◀───────────────────────│  • Typos                 │      │
│  │ Integration  │                        │  • Missing imports       │      │
│  │              │                        │  • Config issues         │      │
│  │  • GitHub    │                        │                          │      │
│  │  • Windsurf  │                        │  MAJOR (Needs approval)  │      │
│  │  • Webhooks  │                        │  • Logic errors          │      │
│  └──────────────┘                        │  • API changes           │      │
│                                          │                          │      │
│  ┌──────────────┐                        │  CRITICAL (Admin only)   │      │
│  │  LLM Agents  │◀───────────────────────│  • Security issues       │      │
│  │              │                        │  • DB schema             │      │
│  │  • Claude    │                        │  • Payment/Stripe        │      │
│  │  • GPT-4     │                        │  • UI changes            │      │
│  │  • Codex     │                        └──────────────────────────┘      │
│  └──────────────┘                                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Entity Relationship Diagram (ERD)

```
┌────────────────────────┐       ┌─────────────────────────┐
│    system_errors       │       │   llm_agent_configs     │
├────────────────────────┤       ├─────────────────────────┤
│ id (PK)                │       │ id (PK)                 │
│ error_hash (UNIQUE)    │       │ agent_name              │
│ error_type             │       │ provider (anthropic/    │
│ message                │       │           openai)       │
│ stack_trace            │       │ model                   │
│ severity               │       │ api_key_ref             │
│ status                 │       │ is_active               │
│ occurrence_count       │       │ permissions (JSONB)     │
│ auto_fixable           │◀──┐   │ created_at              │
│ fix_category           │   │   └─────────────────────────┘
│ ai_analysis            │   │              │
│ created_at             │   │              │
└────────────────────────┘   │              ▼
         │                   │   ┌─────────────────────────┐
         │                   │   │  llm_fix_requests       │
         ▼                   │   ├─────────────────────────┤
┌────────────────────────┐   │   │ id (PK)                 │
│    fix_approvals       │   │   │ error_id (FK)           │───┐
├────────────────────────┤   │   │ agent_id (FK)           │   │
│ id (PK)                │   │   │ fix_type                │   │
│ fix_request_id (FK)    │───┼───│ proposed_fix (JSONB)    │   │
│ approved_by            │   │   │ files_affected          │   │
│ approval_status        │   │   │ status                  │   │
│ approved_at            │   │   │ approval_required       │   │
│ rejection_reason       │   │   │ created_at              │   │
│ created_at             │   │   └─────────────────────────┘   │
└────────────────────────┘   │              │                  │
                             │              ▼                  │
                             │   ┌─────────────────────────┐   │
                             │   │   fix_executions        │   │
                             │   ├─────────────────────────┤   │
                             │   │ id (PK)                 │   │
                             └───│ fix_request_id (FK)     │───┘
                                 │ executed_by_agent       │
                                 │ execution_status        │
                                 │ git_commit_sha          │
                                 │ github_pr_url           │
                                 │ files_changed (JSONB)   │
                                 │ rollback_available      │
                                 │ executed_at             │
                                 └─────────────────────────┘

┌────────────────────────┐       ┌─────────────────────────┐
│   github_integrations  │       │   devops_notifications  │
├────────────────────────┤       ├─────────────────────────┤
│ id (PK)                │       │ id (PK)                 │
│ organization_id (FK)   │       │ error_id (FK)           │
│ repo_owner             │       │ channel (github/slack/  │
│ repo_name              │       │          windsurf/      │
│ github_token_ref       │       │          webhook)       │
│ default_branch         │       │ notification_type       │
│ auto_create_issues     │       │ payload (JSONB)         │
│ auto_create_prs        │       │ status                  │
│ is_active              │       │ sent_at                 │
│ created_at             │       └─────────────────────────┘
└────────────────────────┘
```

## LLM Agent Permission Matrix

| Permission Level | Description | Allowed Actions | Requires Approval |
|------------------|-------------|-----------------|-------------------|
| **NONE** | No access | Nothing | N/A |
| **READ_ONLY** | View errors only | Read error details, view analysis | No |
| **SUGGEST** | Can suggest fixes | Propose fixes, create draft PRs | No |
| **MINOR_FIX** | Auto-fix minor issues | Fix typos, imports, formatting | No |
| **MAJOR_FIX** | Fix with approval | Logic fixes, API changes | **Yes** |

### Restricted Operations (Always require admin approval)
- **UI Changes**: Any modification to React components, styles, or layouts
- **Database Changes**: Schema modifications, migrations, RLS policies
- **Stripe Functions**: Payment processing, subscription logic
- **Security**: Auth flows, permissions, encryption

## Fix Categories

### Category A: Auto-Fixable (No Approval)
```typescript
const AUTO_FIXABLE_CATEGORIES = [
  'typo_in_string',
  'missing_import',
  'unused_variable',
  'formatting_issue',
  'missing_type_annotation',
  'deprecated_api_usage',
  'console_log_removal',
  'comment_cleanup'
];
```

### Category B: Requires Approval
```typescript
const APPROVAL_REQUIRED_CATEGORIES = [
  'logic_fix',
  'api_endpoint_change',
  'service_modification',
  'hook_logic_change',
  'utility_function_fix'
];
```

### Category C: Admin Only (Never Auto-Fix)
```typescript
const ADMIN_ONLY_CATEGORIES = [
  'ui_component_change',
  'database_schema_change',
  'stripe_payment_logic',
  'auth_security_change',
  'rls_policy_change',
  'environment_variable_change'
];
```

## Approval Workflow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Error     │────▶│   Analyze    │────▶│  Categorize  │
│   Detected   │     │  with LLM    │     │     Fix      │
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                                                  ▼
                     ┌────────────────────────────┴────────────────────────────┐
                     │                                                         │
              ┌──────┴──────┐                ┌────────┴────────┐        ┌─────┴─────┐
              │  Auto-Fix   │                │ Approval Queue  │        │  Admin    │
              │  (Cat A)    │                │   (Cat B)       │        │  Review   │
              └──────┬──────┘                └────────┬────────┘        │  (Cat C)  │
                     │                                │                 └─────┬─────┘
                     ▼                                ▼                       │
              ┌──────────────┐                ┌──────────────┐               │
              │   Execute    │                │   Wait for   │               │
              │     Fix      │                │   Approval   │◀──────────────┘
              └──────┬──────┘                └──────┬───────┘
                     │                              │
                     ▼                              ▼
              ┌──────────────┐                ┌──────────────┐
              │  Create PR   │                │  Approved?   │
              │  (if config) │                └──────┬───────┘
              └──────┬──────┘                       │
                     │                    ┌────────┴────────┐
                     ▼                    │                 │
              ┌──────────────┐     ┌──────▼──────┐   ┌──────▼──────┐
              │   Notify     │     │   Execute   │   │   Reject    │
              │  (GitHub,    │     │     Fix     │   │   Log       │
              │   Slack)     │     └─────────────┘   └─────────────┘
              └──────────────┘
```

## DevOps Integrations

### GitHub Integration
- **Issue Creation**: Auto-create issues for critical errors
- **PR Creation**: Create pull requests for fixes
- **Commit Signing**: Track LLM-generated commits
- **Branch Strategy**: `fix/error-{error_id}` branches

### Windsurf Integration
- **Real-time Notifications**: Push errors to Windsurf IDE
- **Quick Actions**: One-click approval from IDE
- **Context Sharing**: Share error context for faster fixes

### Webhook Support
- **Slack**: Error alerts to channels
- **Discord**: Team notifications
- **Custom Endpoints**: Flexible integrations

## API Endpoints

### Error Management
```
GET    /api/errors                    # List all errors
GET    /api/errors/:id                # Get error details
PATCH  /api/errors/:id/status         # Update error status
POST   /api/errors/:id/analyze        # Request AI analysis
```

### Fix Requests
```
GET    /api/fix-requests              # List pending fixes
POST   /api/fix-requests              # Create fix request
PATCH  /api/fix-requests/:id/approve  # Approve fix
PATCH  /api/fix-requests/:id/reject   # Reject fix
POST   /api/fix-requests/:id/execute  # Execute approved fix
```

### DevOps
```
POST   /api/devops/github/issue       # Create GitHub issue
POST   /api/devops/github/pr          # Create pull request
POST   /api/devops/notify             # Send notification
```

## Security Considerations

1. **API Key Storage**: All LLM API keys stored encrypted in Supabase secrets
2. **GitHub Token**: OAuth or PAT stored securely, scoped to repo access
3. **Audit Trail**: All fix actions logged with user/agent attribution
4. **Rollback**: Every fix has rollback capability within 24h
5. **Rate Limiting**: LLM calls limited to prevent abuse

## File Structure

```
src/
├── modules/
│   └── error-monitoring/
│       ├── components/
│       │   ├── ErrorMonitoringTab.tsx      # Main tab for Backend Dashboard
│       │   ├── ErrorListSection.tsx        # Error listing with filters
│       │   ├── ErrorDetailDrawer.tsx       # Error details + AI analysis
│       │   ├── FixApprovalQueue.tsx        # Pending fixes approval UI
│       │   ├── LLMAgentConfig.tsx          # Agent configuration panel
│       │   └── DevOpsIntegrations.tsx      # GitHub/Windsurf settings
│       ├── services/
│       │   ├── devops.service.ts           # GitHub, Windsurf, webhooks
│       │   ├── llmAgent.service.ts         # LLM agent management
│       │   └── fixExecution.service.ts     # Fix execution logic
│       └── types/
│           └── devops.types.ts             # DevOps type definitions
│
├── components/
│   └── backend/
│       └── ErrorMonitoringTab.tsx          # Tab export for dashboard
│
└── pages/
    └── BackendDashboard.tsx                # Uses modular tabs
```

## Implementation Priority

1. **Phase 1**: Database migration + types
2. **Phase 2**: ErrorMonitoringTab component  
3. **Phase 3**: LLM Agent service with permissions
4. **Phase 4**: GitHub integration
5. **Phase 5**: Windsurf/webhook integrations
6. **Phase 6**: Full approval workflow UI
