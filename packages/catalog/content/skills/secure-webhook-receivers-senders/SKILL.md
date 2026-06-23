---
name: secure-webhook-receivers-senders
description: "Implement secure webhook receivers and senders with proper verification and reliability."
category: "Integrations"
author: community
version: "1.0.0"
icon: plug
---

## Receiving: Signature Verification

- Always verify HMAC signature—payload can be forged; don't trust without signature
- Common pattern: `HMAC-SHA256(secret, raw_body)` compared to header value
- Use raw body bytes—parsed JSON may reorder keys, breaking signature
- Timing-safe comparison—prevent timing attacks on signature check
- Reject missing or invalid signature with 401—log for investigation

## Receiving: Replay Prevention

- Check timestamp in payload or header—reject if too old (>5 minutes)
- Combine with signature—timestamp without signature can be forged
- Store processed event IDs—reject duplicates even within time window
- Clock skew tolerance: allow 1-2 minutes past—but not hours

## Receiving: Idempotency (Critical)

- Webhooks can arrive multiple times—sender retries on timeout, network issues
- Use event ID for deduplication—store processed IDs in database/Redis
- Make handlers idempotent—same event twice should have same effect
- Idempotency window: keep IDs for 24-72h—balance storage vs protection

## Receiving: Fast Response

- Return 200/202 immediately—process asynchronously in queue
- Senders timeout (5-30s typical)—slow processing = retry = duplicates
- Minimal validation before 200—signature check, then queue
- Background job for actual processing—failures don't affect acknowledgment

## Receiving: Error Handling

- 2xx = success, sender won't retry
- 4xx = permanent failure, sender may stop retrying—use for bad signature, unknown event type
- 5xx = temporary failure, sender will retry—use for downstream issues
- Log full payload on error—helps debugging; redact sensitive fields

## Sending: Retry Strategy

- Exponential backoff: 1min, 5min, 30min, 2h, 8h—then give up or alert
- Cap retries (5-10 attempts)—don't retry forever
- Record delivery attempts—show status to user
- Different retry for 4xx vs 5xx—4xx often means stop retrying

## Sending: Signature Generation

- Include timestamp in signature—prevents replay of captured webhooks
- Sign raw JSON body—document exact signing algorithm
- Header format: `t=timestamp,v1=signature`—allows versioned signatures
- Provide verification code examples—reduce integration friction

## Sending: Timeouts

- 5-10 second timeout—don't wait forever for slow receivers
- Treat timeout as failure—retry later
- Don't follow redirects—or limit to 1-2; prevents redirect loops
- Validate HTTPS certificate—don't skip verification

## Event Design

- Include event type: `{"type": "order.created", ...}`—receivers filter by type
- Include timestamp: ISO 8601 with timezone—for ordering and freshness
- Include full resource or ID—prefer full data; saves receiver a lookup
- Version events: `api_version` field—allows breaking changes

## Delivery Tracking

- Log every attempt: URL, status code, response time, response body
- Dashboard for retry queue—let users see pending/failed deliveries
- Manual retry button—for stuck webhooks after receiver fix
- Webhook logs retention: 7-30 days—balance debugging vs storage

## Security Checklist

- HTTPS only—never send webhooks to HTTP endpoints
- Rotate secrets periodically—support multiple active secrets during rotation
- IP allowlisting optional—document your IP ranges if offered
- Don't include secrets in payload—webhook URL should be secret enough
- Rate limit per endpoint—one slow receiver shouldn't affect others

## Common Mistakes

- No signature verification—anyone can POST fake events to your endpoint
- Processing before responding—timeout causes retries, duplicate processing
- No idempotency handling—double charges, duplicate records
- Trusting event data blindly—always verify by fetching from source API for critical actions
