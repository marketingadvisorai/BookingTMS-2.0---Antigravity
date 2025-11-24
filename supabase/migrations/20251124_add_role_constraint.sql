-- Add constraint to ensure platform team members have appropriate roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_platform_team_role;

ALTER TABLE users ADD CONSTRAINT check_platform_team_role
  CHECK (
    (is_platform_team = true AND role IN ('system-admin', 'super-admin'))
    OR
    (is_platform_team = false AND role IN ('super-admin', 'admin', 'manager', 'staff', 'member'))
  );
