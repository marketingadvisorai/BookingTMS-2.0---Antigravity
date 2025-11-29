/**
 * Capacity Management Types
 * Types for session blocking and capacity control
 */

export type SessionBlockReason =
  | 'maintenance'
  | 'private_event'
  | 'staff_unavailable'
  | 'weather'
  | 'holiday'
  | 'other';

export interface BlockedSession {
  id: string;
  activityId: string;
  sessionId?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  isFullDay: boolean;
  reason: SessionBlockReason;
  notes?: string;
  blockedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CapacityOverride {
  id: string;
  activityId: string;
  date: string;
  startTime?: string;
  maxCapacity: number;
  reason?: string;
  createdBy: string;
  createdAt: string;
}

export interface BlockSessionRequest {
  activityId: string;
  date: string;
  startTime?: string;
  endTime?: string;
  isFullDay: boolean;
  reason: SessionBlockReason;
  notes?: string;
}

export interface CapacityStats {
  totalSessions: number;
  blockedSessions: number;
  availableSessions: number;
  averageCapacity: number;
  utilizationRate: number;
}
