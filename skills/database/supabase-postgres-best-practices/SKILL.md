---
name: supabase-postgres-best-practices
description: Postgres performance optimization and best practices from Supabase. Use this skill when writing, reviewing, or optimizing Postgres queries, schema designs, or database configurations. Also use when auditing RLS policies, checking for missing RLS on tables, or reviewing Supabase Security Advisor findings.
license: MIT
metadata:
  author: supabase
  version: "1.1.0"
  organization: Supabase
  date: January 2026
  abstract: Comprehensive Postgres performance optimization guide for developers using Supabase and Postgres. Contains performance rules across 8 categories, prioritized by impact from critical (query performance, connection management) to incremental (advanced features). Each rule includes detailed explanations, incorrect vs. correct SQL examples, query plan analysis, and specific performance metrics to guide automated optimization and code generation.
---

# Supabase Postgres Best Practices

Comprehensive performance optimization guide for Postgres, maintained by Supabase. Contains rules across 8 categories, prioritized by impact to guide automated query optimization and schema design.

## When to Apply

Reference these guidelines when:
- Writing SQL queries or designing schemas
- Implementing indexes or query optimization
- Reviewing database performance issues
- Configuring connection pooling or scaling
- Optimizing for Postgres-specific features
- Working with Row-Level Security (RLS)
- **Auditing RLS coverage** (missing RLS, overly permissive policies)
- **Responding to Supabase Security Advisor** findings
- Adding new tables (ensure RLS is enabled before merge)

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Query Performance | CRITICAL | `query-` |
| 2 | Connection Management | CRITICAL | `conn-` |
| 3 | Security & RLS | CRITICAL | `security-` |
| 4 | Schema Design | HIGH | `schema-` |
| 5 | Concurrency & Locking | MEDIUM-HIGH | `lock-` |
| 6 | Data Access Patterns | MEDIUM | `data-` |
| 7 | Monitoring & Diagnostics | LOW-MEDIUM | `monitor-` |
| 8 | Advanced Features | LOW | `advanced-` |

## Security & RLS Rules (6 rules)

| Rule | Impact | File | What it catches |
|------|--------|------|-----------------|
| RLS Basics | CRITICAL | `security-rls-basics.md` | テーブルにRLSが未有効 |
| RLS Audit | CRITICAL | `security-rls-audit.md` | RLS未設定テーブルの一括発見（`pg_tables`クエリ） |
| RLS Overly Permissive | CRITICAL | `security-rls-overly-permissive.md` | `USING (true)` 等の過剰許可ポリシー検出 |
| RLS Indirect Tenant | HIGH | `security-rls-indirect-tenant.md` | `company_id` 無しテーブルのJOIN型テナント分離 |
| RLS Performance | HIGH | `security-rls-performance.md` | `(SELECT ...)` ラップによるRLS高速化 |
| Privileges | MEDIUM | `security-privileges.md` | 最小権限の原則 |

## How to Use

Read individual rule files for detailed explanations and SQL examples:

```
references/query-missing-indexes.md
references/schema-partial-indexes.md
references/security-rls-audit.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect SQL example with explanation
- Correct SQL example with explanation
- Optional EXPLAIN output or metrics
- Additional context and references
- Supabase-specific notes (when applicable)

## References

- https://www.postgresql.org/docs/current/
- https://supabase.com/docs
- https://wiki.postgresql.org/wiki/Performance_Optimization
- https://supabase.com/docs/guides/database/overview
- https://supabase.com/docs/guides/auth/row-level-security
