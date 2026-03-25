---
title: RLS for Tables Without Direct Tenant Column
impact: HIGH
impactDescription: Correct tenant isolation via JOINs for child/junction tables without company_id
tags: rls, multi-tenant, join, indirect, security
---

## RLS for Tables Without Direct Tenant Column

Not every table has a direct `company_id` column. Child tables, junction tables, or log tables may reference tenant data indirectly through foreign keys. RLS policies must still enforce tenant isolation via JOINs or subqueries.

**Incorrect (no tenant filter because no company_id):**

```sql
-- slack_survey_responses has survey_token_id but no company_id
-- Developer skips RLS because "there's no company_id to filter on"

-- Result: all survey responses visible to all tenants!
```

**Correct (JOIN-based tenant isolation):**

```sql
ALTER TABLE slack_survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company slack survey responses"
  ON slack_survey_responses FOR SELECT
  TO authenticated
  USING (
    survey_token_id IN (
      SELECT st.id FROM survey_tokens st
      JOIN surveys s ON st.survey_id = s.id
      WHERE s.company_id = (SELECT public.get_user_company_id())
    )
  );
```

**Pattern for common scenarios:**

```sql
-- Pattern 1: Child table → Parent has company_id
CREATE POLICY "tenant_isolation" ON child_table FOR SELECT
  TO authenticated
  USING (
    parent_id IN (
      SELECT id FROM parent_table
      WHERE company_id = (SELECT public.get_user_company_id())
    )
  );

-- Pattern 2: Junction table → Both sides have company_id
CREATE POLICY "tenant_isolation" ON junction_table FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM table_a a
      WHERE a.id = junction_table.table_a_id
        AND a.company_id = (SELECT public.get_user_company_id())
    )
  );

-- Pattern 3: Shared/system records (company_id IS NULL) + tenant records
CREATE POLICY "view_shared_and_own" ON labels FOR SELECT
  TO authenticated
  USING (
    company_id IS NULL  -- system defaults visible to all
    OR company_id = (SELECT public.get_user_company_id())
  );
```

### Performance Notes

- Always wrap helper functions in `(SELECT ...)` to avoid per-row execution
- Add indexes on foreign key columns used in JOIN-based policies
- For frequently accessed tables, consider adding a denormalized `company_id` column

```sql
-- Add index for JOIN performance in RLS policy
CREATE INDEX idx_survey_tokens_survey_id ON survey_tokens(survey_id);
CREATE INDEX idx_surveys_company_id ON surveys(company_id);
```

### Design Decision: When to Denormalize

| Scenario | Approach |
|----------|----------|
| Table queried rarely by clients | JOIN-based policy is fine |
| High-traffic table (1000+ queries/sec) | Consider adding `company_id` column |
| Deep join chain (3+ hops) | Strongly consider denormalization |
| Junction/log table | JOIN is typically acceptable |

Reference: [RLS with JOINs](https://supabase.com/docs/guides/auth/row-level-security#policies-with-joins)
