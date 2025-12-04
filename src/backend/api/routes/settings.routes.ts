/**
 * Settings API Routes
 * @module backend/api/routes/settings
 */

import { Router, Request, Response } from 'express';
import { supabase } from '../../config/supabase';

const router = Router();

/**
 * GET /api/settings/:organizationId
 * Get organization settings
 */
router.get('/:organizationId', async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.params;

    const { data, error } = await supabase
      .from('organization_settings')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // If no settings exist, return defaults
    if (!data) {
      return res.json({
        organization_id: organizationId,
        business_name: '',
        business_email: '',
        business_phone: '',
        timezone: 'America/New_York',
        currency: 'USD',
        date_format: 'MM/DD/YYYY',
        time_format: '12h',
      });
    }

    return res.json(data);
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/settings/:organizationId
 * Update organization settings
 */
router.put('/:organizationId', async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('organization_settings')
      .upsert({
        organization_id: organizationId,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return res.json(data);
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/settings/:organizationId/notifications/:userId
 * Get notification preferences for a user
 */
router.get('/:organizationId/notifications/:userId', async (req: Request, res: Response) => {
  try {
    const { organizationId, userId } = req.params;

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Return defaults if no preferences exist
    if (!data) {
      return res.json({
        organization_id: organizationId,
        user_id: userId,
        email_new_bookings: true,
        email_booking_changes: true,
        email_cancellations: true,
        email_daily_reports: false,
        email_weekly_reports: true,
        sms_enabled: false,
        push_enabled: true,
      });
    }

    return res.json(data);
  } catch (error: any) {
    console.error('Error fetching notification preferences:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/settings/:organizationId/notifications/:userId
 * Update notification preferences for a user
 */
router.put('/:organizationId/notifications/:userId', async (req: Request, res: Response) => {
  try {
    const { organizationId, userId } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        organization_id: organizationId,
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return res.json(data);
  } catch (error: any) {
    console.error('Error updating notification preferences:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
