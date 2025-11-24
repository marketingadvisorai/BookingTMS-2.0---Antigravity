-- =====================================================
-- STAFF MANAGEMENT RPC FUNCTIONS
-- =====================================================

-- Function to get staff members with email (joining users and organization_members)
CREATE OR REPLACE FUNCTION get_staff_with_email()
RETURNS TABLE (
  id UUID,
  email VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  role TEXT,
  status TEXT,
  organization_id UUID,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.full_name as first_name, -- Assuming full_name stores the name
    ''::VARCHAR as last_name, -- Split logic if needed, or just return empty
    om.role,
    CASE WHEN u.is_active THEN 'active' ELSE 'inactive' END as status,
    om.organization_id,
    u.created_at
  FROM organization_members om
  JOIN users u ON u.id = om.user_id
  WHERE om.organization_id = (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access
GRANT EXECUTE ON FUNCTION get_staff_with_email() TO authenticated;
