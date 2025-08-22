
//(non-code guidance)

// 1) Ensure indices exist for time-series queries:
// - On User(createdAt)
// - On ServiceRequest(createdAt, status)
// - On Payment(createdAt)
// 2) If amounts are stored in cents (integers), SUM returns bigint; cast as needed.
// 3) If you use MySQL:
// - Replace date_trunc with DATE_FORMAT and GROUP BY YEAR(createdAt), MONTH(createdAt) or a CASE for buckets.
// 4) For multi-tenant setups, add tenant/org scoping in every WHERE clause.