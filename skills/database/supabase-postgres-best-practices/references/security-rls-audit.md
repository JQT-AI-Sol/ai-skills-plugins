---
title: Audit Tables for Missing or Disabled RLS
impact: CRITICAL
impactDescription: Unprotected tables expose all data to any authenticated user via anon/authenticated key
tags: rls, audit, security, multi-tenant, supabase
---

## Audit Tables for Missing or Disabled RLS

Every table in the `public` schema that stores tenant or user data MUST have RLS enabled. A single unprotected table can leak sensitive data (PII, credentials, internal logs) to any user with an anon or authenticated key.

**Incorrect (no audit, tables slip through):**

```sql
-- New tables added without RLS
CREATE TABLE slack_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  slack_user_id text,
  message text,
  created_at timestamptz DEFAULT now()
);
-- Developer forgets ALTER TABLE ... ENABLE ROW LEVEL SECURITY
-- Table is now fully exposed via Supabase client
```

**Correct (periodic audit query):**

```sql
-- Find all public tables WITHOUT RLS enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false
ORDER BY tablename;

-- Expected result: 0 rows (all tables protected)
```

**Comprehensive audit (also check for tables with RLS but no policies):**

```sql
-- Tables with RLS enabled but ZERO policies (effectively blocks all access)
SELECT t.schemaname, t.tablename, t.rowsecurity,
       count(p.policyname) AS policy_count
FROM pg_tables t
LEFT JOIN pg_policies p
  ON t.schemaname = p.schemaname AND t.tablename = p.tablename
WHERE t.schemaname = 'public'
GROUP BY t.schemaname, t.tablename, t.rowsecurity
HAVING t.rowsecurity = false
    OR count(p.policyname) = 0
ORDER BY t.rowsecurity, t.tablename;
```

### When to Run

- After adding any new table
- Before each release/deployment
- As a periodic security check (weekly/monthly)
- When Supabase Security Advisor reports errors

### Supabase-Specific Notes

- Supabase Dashboard → Security Advisor automatically detects this
- `service_role` key bypasses RLS, but `anon` and `authenticated` keys do NOT
- Tables without RLS are fully readable/writable by any authenticated user

Reference: [Supabase Security Advisor](https://supabase.com/docs/guides/database/database-advisors)
