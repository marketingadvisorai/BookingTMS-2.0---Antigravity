/**
 * DevOps Integration Service
 * Handles GitHub, Windsurf, and webhook integrations for error notifications
 * @module error-monitoring/services/devops.service
 */

import { supabase } from '@/lib/supabase/client';

// Types
export interface GitHubIssueInput {
  title: string;
  body: string;
  labels?: string[];
  assignees?: string[];
}

export interface GitHubPRInput {
  title: string;
  body: string;
  head: string; // Branch with changes
  base?: string; // Target branch (default: main)
}

export interface NotificationInput {
  channel: 'github' | 'slack' | 'discord' | 'windsurf' | 'webhook' | 'email';
  type: 'error_detected' | 'fix_proposed' | 'approval_needed' | 'fix_completed' | 'fix_failed';
  errorId?: string;
  fixRequestId?: string;
  payload: Record<string, unknown>;
  recipient?: string;
}

interface GitHubConfig {
  repoOwner: string;
  repoName: string;
  token: string;
  defaultBranch: string;
}

class DevOpsService {
  private githubConfig: GitHubConfig | null = null;

  /**
   * Load GitHub configuration from database
   */
  async loadGitHubConfig(organizationId?: string): Promise<GitHubConfig | null> {
    const { data, error } = await supabase
      .from('github_integrations')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.warn('No GitHub integration configured');
      return null;
    }

    // In production, decrypt the token from secrets
    this.githubConfig = {
      repoOwner: data.repo_owner,
      repoName: data.repo_name,
      token: data.github_token_ref || '', // Will be fetched from secrets
      defaultBranch: data.default_branch || 'main'
    };

    return this.githubConfig;
  }

  /**
   * Create a GitHub issue for an error
   */
  async createGitHubIssue(input: GitHubIssueInput): Promise<{ success: boolean; issueUrl?: string; error?: string }> {
    if (!this.githubConfig) {
      await this.loadGitHubConfig();
    }

    if (!this.githubConfig?.token) {
      return { success: false, error: 'GitHub not configured' };
    }

    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.githubConfig.repoOwner}/${this.githubConfig.repoName}/issues`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.githubConfig.token}`,
            'Accept': 'application/vnd.github+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: input.title,
            body: input.body,
            labels: input.labels || ['bug', 'auto-detected'],
            assignees: input.assignees || []
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Failed to create issue' };
      }

      const data = await response.json();
      return { success: true, issueUrl: data.html_url };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Create a GitHub pull request for a fix
   */
  async createGitHubPR(input: GitHubPRInput): Promise<{ success: boolean; prUrl?: string; error?: string }> {
    if (!this.githubConfig) {
      await this.loadGitHubConfig();
    }

    if (!this.githubConfig?.token) {
      return { success: false, error: 'GitHub not configured' };
    }

    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.githubConfig.repoOwner}/${this.githubConfig.repoName}/pulls`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.githubConfig.token}`,
            'Accept': 'application/vnd.github+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: input.title,
            body: input.body,
            head: input.head,
            base: input.base || this.githubConfig.defaultBranch
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Failed to create PR' };
      }

      const data = await response.json();
      return { success: true, prUrl: data.html_url };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send notification through various channels
   */
  async sendNotification(input: NotificationInput): Promise<{ success: boolean; error?: string }> {
    // Log notification to database
    const { error: dbError } = await supabase
      .from('devops_notifications')
      .insert({
        error_id: input.errorId,
        fix_request_id: input.fixRequestId,
        channel: input.channel,
        notification_type: input.type,
        payload: input.payload,
        recipient: input.recipient,
        status: 'pending'
      });

    if (dbError) {
      console.error('Failed to log notification:', dbError);
    }

    // Send based on channel
    switch (input.channel) {
      case 'github':
        return this.sendGitHubNotification(input);
      case 'slack':
        return this.sendSlackNotification(input);
      case 'webhook':
        return this.sendWebhookNotification(input);
      case 'windsurf':
        return this.sendWindsurfNotification(input);
      default:
        return { success: false, error: `Channel ${input.channel} not implemented` };
    }
  }

  private async sendGitHubNotification(input: NotificationInput): Promise<{ success: boolean; error?: string }> {
    // Create issue for error notifications
    if (input.type === 'error_detected' && input.payload.title && input.payload.body) {
      const result = await this.createGitHubIssue({
        title: input.payload.title as string,
        body: input.payload.body as string,
        labels: ['bug', 'auto-detected', input.payload.severity as string || 'medium']
      });
      return { success: result.success, error: result.error };
    }
    return { success: true };
  }

  private async sendSlackNotification(input: NotificationInput): Promise<{ success: boolean; error?: string }> {
    const webhookUrl = input.recipient;
    if (!webhookUrl) {
      return { success: false, error: 'No Slack webhook URL provided' };
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: this.formatSlackMessage(input)
        })
      });

      return { success: response.ok };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async sendWebhookNotification(input: NotificationInput): Promise<{ success: boolean; error?: string }> {
    const webhookUrl = input.recipient;
    if (!webhookUrl) {
      return { success: false, error: 'No webhook URL provided' };
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: input.type,
          errorId: input.errorId,
          fixRequestId: input.fixRequestId,
          payload: input.payload,
          timestamp: new Date().toISOString()
        })
      });

      return { success: response.ok };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async sendWindsurfNotification(input: NotificationInput): Promise<{ success: boolean; error?: string }> {
    // Windsurf integration via local extension API
    // This would connect to a local Windsurf extension that listens for notifications
    console.log('[Windsurf] Notification:', input.type, input.payload);
    
    // In a real implementation, this would use a local WebSocket or HTTP server
    // that the Windsurf extension connects to
    return { success: true };
  }

  private formatSlackMessage(input: NotificationInput): string {
    const emoji = {
      error_detected: '🚨',
      fix_proposed: '🤖',
      approval_needed: '⏳',
      fix_completed: '✅',
      fix_failed: '❌'
    };

    return `${emoji[input.type]} *${input.type.replace('_', ' ').toUpperCase()}*\n${JSON.stringify(input.payload, null, 2)}`;
  }

  /**
   * Create error issue from system error
   */
  async createErrorIssue(error: {
    id: string;
    message: string;
    error_type: string;
    severity: string;
    stack_trace?: string;
    occurrence_count: number;
  }): Promise<{ success: boolean; issueUrl?: string; error?: string }> {
    const body = `
## Error Details

**Type:** \`${error.error_type}\`
**Severity:** ${error.severity}
**Occurrences:** ${error.occurrence_count}

### Message
\`\`\`
${error.message}
\`\`\`

${error.stack_trace ? `### Stack Trace\n\`\`\`\n${error.stack_trace}\n\`\`\`\n` : ''}

---
*This issue was automatically created by the BookingTMS Error Monitoring system.*
*Error ID: \`${error.id}\`*
    `.trim();

    return this.createGitHubIssue({
      title: `[${error.severity.toUpperCase()}] ${error.error_type}: ${error.message.slice(0, 80)}`,
      body,
      labels: ['bug', 'auto-detected', error.severity]
    });
  }
}

export const devopsService = new DevOpsService();
