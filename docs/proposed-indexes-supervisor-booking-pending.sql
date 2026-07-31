-- Proposed indexes for supervisor-booking-pending performance fix
-- Generated: 2026-07-27
-- Scope: homevisitor_app, homevisitor_result, homevisitor_sample_students (database `parenting2025`)
--
-- STATUS: NOT EXECUTED. This file is a proposal only.
-- Run `SHOW INDEX FROM <table>` on production first to confirm no equivalent
-- index already exists before applying anything here. Both homevisitor_app
-- and homevisitor_result are ENGINE=MyISAM, so CREATE INDEX takes a
-- table-level lock for the duration of the index build — schedule outside
-- peak usage hours (supervisor approve/correction actions write to these
-- tables).
--
-- Current indexes confirmed from schema dump (parenting2025.sql):
--   homevisitor_app        : PRIMARY KEY (recby, project, stid, time_visit) -- no secondary index
--   homevisitor_result     : PRIMARY KEY (project, stid, time_visit)        -- no secondary index
--   homevisitor_sample_students : PRIMARY KEY (stid)                       -- no secondary index

-- 1) homevisitor_app
-- Used by both gethomevisit_result_data.php and gethomevisit_resultlist.php as:
--   - self-join key in the `prev_map` derived table (stid, deleted_at, time_visit)
--   - main join key into homevisitor_result (stid, time_visit, recby)
-- `project` (the PK's leading column) is never referenced in any WHERE/JOIN
-- predicate in either query, so the existing PK cannot be used as an index
-- seek for these access patterns. This composite covers both usages via a
-- shared leftmost prefix (stid, deleted_at).
CREATE INDEX idx_homevisitor_app_stid_deleted_time_recby
  ON parenting2025.homevisitor_app (stid, deleted_at, time_visit, recby);

-- 2) homevisitor_result
-- Used as the driving table (gethomevisit_result_data.php) and as a JOIN
-- target (gethomevisit_resultlist.php) keyed on stid/time_visit/recby,
-- never on `project` (PK leading column) — same problem as above.
CREATE INDEX idx_homevisitor_result_stid_deleted_time_recby
  ON parenting2025.homevisitor_result (stid, deleted_at, time_visit, recby);

-- 3) homevisitor_sample_students
-- `homevisitor` (mapped from the `user_id` GET param) is filtered on every
-- call when a visitor filter is active, with no supporting index today.
CREATE INDEX idx_homevisitor_sample_students_homevisitor
  ON parenting2025.homevisitor_sample_students (homevisitor);

-- 4) homevisitor_sample_students — tam_code
-- NOTE: current queries filter with `SUBSTR(b.stid,1,6) = ?` instead of the
-- existing `tam_code` column, which is non-sargable (function wraps the
-- column) and would make this index unusable as-is. Do NOT switch the query
-- to `b.tam_code = ?` until someone with DB access verifies that
-- `tam_code` is populated and consistent with SUBSTR(stid,1,6) for every
-- row — a mismatch would silently change query results. This index is
-- prepared in advance so the query rewrite (a separate, follow-up change)
-- has an index ready to use once verified.
CREATE INDEX idx_homevisitor_sample_students_tam_code
  ON parenting2025.homevisitor_sample_students (tam_code);

-- Not proposed in this round:
-- - Any index keyed on a CAST()-wrapped expression (e.g. functional index on
--   CAST(time_visit AS SIGNED)) — would require confirming the MySQL/MariaDB
--   version supports functional indexes, which could not be verified without
--   DB access. The composite indexes above still help by narrowing the
--   self-join/join to a single stid (+deleted_at) group before MySQL has to
--   fall back to a non-indexed comparison on time_visit.
