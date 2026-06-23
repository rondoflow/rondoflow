---
name: query-and-index-elasticsearch
description: "Query and index Elasticsearch with proper mappings, analyzers, and search patterns."
category: "Community"
author: community
version: "1.0.0"
icon: puzzle
---

## Mapping Mistakes

- Always define explicit mappings—dynamic mapping guesses wrong (first "123" makes field integer, later "abc" fails)
- `text` for full-text search, `keyword` for exact match/aggregations—using text for IDs breaks filters
- Can't change field type after indexing—must reindex to new index with correct mapping
- Set `dynamic: "strict"` to reject unmapped fields—catches typos in field names

## Text vs Keyword

- `text` is analyzed (tokenized, lowercased)—"Quick Brown" matches search for "quick"
- `keyword` is exact bytes—"Quick Brown" only matches exactly "Quick Brown"
- Need both? Use multi-field: `"title": { "type": "text", "fields": { "raw": { "type": "keyword" }}}`
- Sort/aggregate on `title.raw`, search on `title`

## Query vs Filter Context

- Query context calculates relevance score—expensive, use for search ranking
- Filter context is yes/no—cacheable, use for exact conditions (status, date ranges)
- Combine: `bool.must` for scoring, `bool.filter` for filtering without scoring
- Range queries on dates/numbers almost always belong in filter, not query

## Analyzers

- `standard` analyzer lowercases and removes punctuation—fine for most text
- `keyword` analyzer keeps exact string—use for codes, SKUs, emails
- Language analyzers (`english`) stem words—"running" matches "run"
- Test analyzer with `_analyze` endpoint before indexing—surprises in production hurt

## Nested vs Object

- Object type flattens arrays—`{"tags": [{"key":"a","val":1}, {"key":"b","val":2}]}` becomes `tags.key: [a,b], tags.val: [1,2]`
- Flattened loses association—query `key=a AND val=2` incorrectly matches above
- Use `nested` type to preserve object boundaries—requires `nested` query wrapper
- Nested is expensive—avoid for high-cardinality arrays

## Pagination Traps

- `from` + `size` limited to 10,000 hits—deep pagination fails
- `search_after` for deep pagination—requires consistent sort, typically `_id`
- Scroll API for bulk export—keeps point-in-time view, but ties up resources
- Don't use scroll for user pagination—search_after is correct choice

## Bulk Operations

- Never index documents one-by-one—use `_bulk` API, 5-15MB batches
- Bulk format: newline-delimited JSON, action line then document line
- Check response for partial failures—bulk can succeed overall with individual doc errors
- Set `refresh=false` during bulk loads—refresh after batch completes

## Performance

- `_source: false` with `stored_fields` if you don't need full document—reduces I/O
- Use `filter` for cacheable conditions—Elasticsearch caches filter results
- Avoid leading wildcards (`*term`)—forces full scan; use `reverse` field for suffix search
- `profile: true` shows query execution breakdown—find slow clauses

## Sharding

- Shard size 10-50GB optimal—too small = overhead, too large = slow recovery
- Number of shards fixed at creation—can't reshard without reindexing
- Replicas for read throughput and availability—set based on query load
- Start with 1 shard for small indices—over-sharding kills performance

## Index Management

- Use index templates—new indices get consistent mappings and settings
- Use aliases for zero-downtime reindexing—point alias to new index after reindex
- ILM (Index Lifecycle Management) for time-series—auto-rollover, delete old indices
- Close unused indices to free memory—closed index uses no heap

## Aggregations

- `terms` agg needs `keyword` field—text fields fail or give garbage
- Default `size: 10` on terms agg—increase to get all buckets, or use composite
- Cardinality is approximate (HyperLogLog)—exact count requires scanning all docs
- Nested aggs require `nested` wrapper—matches nested query pattern

## Common Errors

- "cluster_block_exception"—disk > 85%, cluster goes read-only; clear disk, reset with `_cluster/settings`
- "version conflict"—concurrent update; retry with `retry_on_conflict` or use optimistic locking
- "circuit_breaker_exception"—query uses too much memory; reduce aggregation scope
- Mapping explosion from dynamic fields—set `index.mapping.total_fields.limit` and use strict mapping
