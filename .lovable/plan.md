

## Plan: Front payment sends raw utm_campaign

Currently the front payment sends `(FRONT) campaign_name` as `utm_campaign`. The user wants it to send the actual `utm_campaign` value directly — no `(FRONT)` prefix.

### Change

**File: `src/hooks/useUtmTracking.ts` (line 119)**

Change the front campaign logic from:
```typescript
campaign = baseCampaign ? `(FRONT) ${baseCampaign}` : '(FRONT)';
```
To:
```typescript
campaign = baseCampaign || 'front';
```

This way, the PIX for the front payment will carry the exact Facebook campaign name as `utm_campaign`. If there's no campaign (direct traffic), it falls back to `'front'`.

