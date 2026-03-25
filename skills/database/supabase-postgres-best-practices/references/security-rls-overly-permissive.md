---
title: Detect and Fix Overly Permissive RLS Policies
impact: CRITICAL
impactDescription: USING (true) policies negate RLS entirely, allowing cross-tenant data access
tags: rls, security, multi-tenant, permissive-policy, supabase
---

## Detect and Fix Overly Permissive RLS Policies

A table with RLS enabled but a policy using `USING (true)` is effectively unprotected. This is worse than missing RLS because it gives a false sense of security.

**Incorrect (USING true — RLS is a no-op):**

```sql
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- This policy allows ALL authenticated users to read ALL rows
CREATE POLICY "Service role can access notification logs"
  ON notification_logs FOR ALL
  USING (true)
  WITH CHECK (true);

-- Any user can: SELECT * FROM notification_logs
-- Returns ALL companies' notification logs!
```

**Correct (tenant-scoped policy):**

```sql
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Read: scoped to user's company
CREATE POLICY "Users can view their company notification logs"
  ON notification_logs FOR SELECT
  TO authenticated
  USING (company_id = (SELECT public.get_user_company_id()));

-- service_role key bypasses RLS automatically — no need for USING (true)
```

**Audit query — find overly permissive policies:**

```sql
-- Find policies with USING (true) or WITH CHECK (true)
SELECT schemaname, tablename, policyname, permissive, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND (qual = 'true' OR with_check = 'true')
ORDER BY tablename;
```

### Common Anti-Patterns

| Pattern | Risk | Fix |
|---------|------|-----|
| `USING (true)` | All rows visible to all users | Add tenant filter (`company_id = ...`) |
| `FOR ALL` without `WITH CHECK` | Inserts/updates bypass validation | Add explicit `WITH CHECK` clause |
| `TO public` instead of `TO authenticated` | Anon users can access | Restrict to `authenticated` role |
| Missing `FOR SELECT` separate policy | Admin policy leaks read access | Split SELECT and ALL policies |

### Supabase-Specific Notes

- `service_role` bypasses RLS — never use `USING (true)` as a workaround for service access
- If only backend (service_role) should access a table, enable RLS with NO policies (blocks all client access)
- Supabase Security Advisor flags `USING (true)` as "overly permissive"

Reference: [RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
