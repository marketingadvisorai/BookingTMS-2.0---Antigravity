# Active Tasks - BookingTMS

> **Last Updated**: December 10, 2025 05:43 UTC+06:00  
> **Status**: IN PROGRESS  
> **Agent**: Cascade  
> **Rule**: NO UI OR FUNCTIONALITY CHANGES

---

## Current Task Queue

### Phase 1: Quick Security Wins (5-20 min each)
- [ ] 1.1 Enable leaked password protection (Dashboard - manual)
- [x] 1.2 Add RLS policy to kv_store table ✅
- [x] 1.3 Remove duplicate index on slot_reservations ✅

### Phase 2: Performance - Add FK Indexes (30 min)
- [x] 2.1 Create migration for unindexed foreign keys ✅
- [x] 2.2 Apply migration to database ✅ (4 batches)
- [x] 2.3 Verify indexes created ✅
- [x] 2.4 Remove duplicate indexes created ✅
- [x] 2.5 Add remaining FK indexes ✅

### Phase 3: Security - Fix Function Search Paths (1 hour)
- [x] 3.1 List all functions needing fix ✅
- [x] 3.2 Create migration to fix search_path ✅
- [x] 3.3 Apply migration ✅ (3 batches)
- [x] 3.4 Verify functions updated ✅

### Phase 4: Edge Function Fixes (35 min)
- [x] 4.1 Fix cleanup-reservations syntax error ✅
- [x] 4.2 Deploy fixed function ✅
- [x] 4.3 Verify all edge functions working ✅

### Phase 5: Performance Verification (30 min)
- [x] 5.1 Run health check ✅
- [x] 5.2 Test widget API ✅
- [x] 5.3 Verify Cache-Control headers working ✅
  - cache-control: public, max-age=300, s-maxage=300, stale-while-revalidate=60
  - cdn-cache-control: max-age=300

### Remaining Manual Tasks
- [ ] 1.1 Enable leaked password protection (Supabase Dashboard → Auth → Settings)

---

## Completed Tasks

### Edge Cache Implementation ✅
- [x] Create backup branch and tag
- [x] Create edgeCacheHeaders.ts module
- [x] Create React Query config
- [x] Remove Upstash from _shared/cache.ts
- [x] Update cached-widget-api
- [x] Update health function
- [x] Deploy edge functions
- [x] Remove Upstash secrets
- [x] Verify health endpoint

---

## Task Log

| Time | Task | Status | Notes |
|------|------|--------|-------|
| 05:28 | Edge cache implementation | ✅ Done | Upstash removed |
| 05:33 | Remove Upstash secrets | ✅ Done | Via CLI |
| 05:34 | Get DB advisors | ✅ Done | Found 36 FK issues |
| 05:35 | Create remaining work plan | ✅ Done | docs/REMAINING_WORK_PLAN.md |
| 05:36 | Create task list | ✅ Done | This file |
| 05:37 | Add RLS to kv_store | ✅ Done | Via MCP |
| 05:37 | Remove duplicate index | ✅ Done | slot_reservations |
| 05:38 | Add FK indexes batch 1 | ✅ Done | 13 indexes |
| 05:39 | Add FK indexes batch 2 | ✅ Done | 10 indexes |
| 05:40 | Add FK indexes batch 3 | ✅ Done | 9 indexes |
| 05:41 | Fix function search_paths | ✅ Done | 30 functions (3 batches) |
| 05:42 | Fix cleanup-reservations | ✅ Done | Deploy successful |
| 05:43 | Verify Cache-Control | ✅ Done | Headers working |
| 05:44 | Remove duplicate indexes | ✅ Done | 6 duplicates removed |
| 05:44 | Add remaining FK indexes | ✅ Done | 13 more indexes |

---

## Notes for Other Agents

1. **DO NOT** change any UI components
2. **DO NOT** change any app functionality
3. **DO** focus on backend/database optimizations
4. **DO** maintain backward compatibility
5. **DO** update this file after completing tasks
6. **DO** commit changes with descriptive messages

---

## Rollback Info

If anything breaks:
```bash
git checkout pre-edge-cache-v2.0.0-2025-12-10
git push --force origin main
supabase functions deploy --project-ref qftjyjpitnoapqxlrvfs
```
