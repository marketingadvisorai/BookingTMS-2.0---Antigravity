/**
 * Google Drive Service
 * @module media/services/googleDrive
 * 
 * Handles Google Drive OAuth and file operations
 */

import { supabase } from '../../../lib/supabase';
import {
  ConnectedDrive,
  GoogleDriveFile,
  GoogleDriveAuthResult,
} from '../types';

// Google Drive API constants
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.file',
].join(' ');

class GoogleDriveService {
  private accessToken: string | null = null;

  /**
   * Initialize OAuth flow
   */
  async initiateAuth(): Promise<string> {
    const redirectUri = `${window.location.origin}/auth/google-drive/callback`;
    
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', GOOGLE_SCOPES);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    
    return authUrl.toString();
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(code: string, organizationId: string): Promise<GoogleDriveAuthResult> {
    try {
      // Exchange code for tokens via edge function
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/google-drive-auth`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            code,
            redirectUri: `${window.location.origin}/auth/google-drive/callback`,
          }),
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to authenticate' };
      }

      // Save connection to database
      await this.saveConnection({
        userId: user.id,
        organizationId,
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
        expiresAt: result.expires_at,
        email: result.email,
      });

      this.accessToken = result.access_token;

      return {
        success: true,
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
        expiresAt: result.expires_at,
        email: result.email,
      };
    } catch (error: any) {
      console.error('[GoogleDriveService] Auth error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save connection to database
   */
  private async saveConnection(params: {
    userId: string;
    organizationId: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    email: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('connected_drives')
      .upsert({
        user_id: params.userId,
        organization_id: params.organizationId,
        provider: 'google_drive',
        access_token: params.accessToken,
        refresh_token: params.refreshToken,
        token_expires_at: params.expiresAt,
        account_email: params.email,
        is_connected: true,
      } as never, {
        onConflict: 'user_id,organization_id,provider',
      });

    if (error) throw error;
  }

  /**
   * Get existing connection
   */
  async getConnection(organizationId: string): Promise<ConnectedDrive | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('connected_drives')
      .select('*')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .eq('provider', 'google_drive')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as ConnectedDrive;
  }

  /**
   * Disconnect Google Drive
   */
  async disconnect(organizationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('connected_drives')
      .delete()
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .eq('provider', 'google_drive');

    if (error) throw error;
    this.accessToken = null;
  }

  /**
   * List files from Google Drive
   */
  async listFiles(
    folderId?: string,
    pageToken?: string
  ): Promise<{ files: GoogleDriveFile[]; nextPageToken?: string }> {
    if (!this.accessToken) {
      throw new Error('Not connected to Google Drive');
    }

    const url = new URL('https://www.googleapis.com/drive/v3/files');
    url.searchParams.set('pageSize', '50');
    url.searchParams.set(
      'fields',
      'nextPageToken,files(id,name,mimeType,size,thumbnailLink,webViewLink,webContentLink,createdTime,modifiedTime)'
    );
    url.searchParams.set(
      'q',
      folderId
        ? `'${folderId}' in parents and trashed = false`
        : `('root' in parents or sharedWithMe) and trashed = false`
    );
    
    if (pageToken) {
      url.searchParams.set('pageToken', pageToken);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to list files');
    }

    const data = await response.json();
    return {
      files: data.files || [],
      nextPageToken: data.nextPageToken,
    };
  }

  /**
   * Search files in Google Drive
   */
  async searchFiles(query: string): Promise<GoogleDriveFile[]> {
    if (!this.accessToken) {
      throw new Error('Not connected to Google Drive');
    }

    const url = new URL('https://www.googleapis.com/drive/v3/files');
    url.searchParams.set('pageSize', '30');
    url.searchParams.set(
      'fields',
      'files(id,name,mimeType,size,thumbnailLink,webViewLink,webContentLink)'
    );
    url.searchParams.set(
      'q',
      `name contains '${query}' and trashed = false and (mimeType contains 'image/' or mimeType contains 'video/')`
    );

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search files');
    }

    const data = await response.json();
    return data.files || [];
  }

  /**
   * Get file by ID
   */
  async getFile(fileId: string): Promise<GoogleDriveFile | null> {
    if (!this.accessToken) {
      throw new Error('Not connected to Google Drive');
    }

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,thumbnailLink,webViewLink,webContentLink`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to get file');
    }

    return response.json();
  }

  /**
   * Get storage quota
   */
  async getStorageQuota(): Promise<{ limit: number; usage: number } | null> {
    if (!this.accessToken) {
      return null;
    }

    try {
      const response = await fetch(
        'https://www.googleapis.com/drive/v3/about?fields=storageQuota',
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      return {
        limit: parseInt(data.storageQuota?.limit || '0'),
        usage: parseInt(data.storageQuota?.usage || '0'),
      };
    } catch {
      return null;
    }
  }

  /**
   * Set access token (for reconnecting)
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return !!this.accessToken;
  }
}

// Export singleton instance
export const googleDriveService = new GoogleDriveService();
