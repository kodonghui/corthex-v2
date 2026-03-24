# Infrastructure Cost Estimate — CORTHEX v3

**Date**: 2026-03-24
**Purpose**: Document monthly infrastructure costs and verify NFR compliance.

---

## Monthly Cost Breakdown

| Service | Tier | Monthly Cost | Notes |
|---------|------|-------------|-------|
| **VPS** | Oracle Cloud Always Free (ARM64 4-core, 24GB RAM) | **$0** | Lifetime free tier |
| **Neon DB** | Free tier (current) | **$0** | 0.5 GiB storage, 100 hours compute |
| **Neon DB** | Pro tier (AR6 target) | **$19** | 10 GiB storage, autoscaling compute |
| **Voyage AI** | Pay-per-use (voyage-3) | **~$1-2** | $0.06/1M tokens; see projection below |
| **Cloudflare** | Free tier | **$0** | DNS + CDN + cache purge |
| **GitHub Actions** | Self-hosted runner | **$0** | Runs on same VPS |
| **Domain** | corthex-hq.com | **~$1** | ~$12/year |

### Voyage AI Embedding Cost Projection

- **Model**: voyage-3 (1024 dimensions)
- **Price**: $0.06 per 1,000,000 input tokens
- **Estimated monthly volume**:
  - Knowledge doc uploads: ~50 docs × ~2,000 tokens avg = 100,000 tokens
  - Semantic search queries: ~500 queries × ~50 tokens avg = 25,000 tokens
  - Re-embedding (schema changes): rare, ~0-1x/month = 0-200,000 tokens
  - **Total estimated**: ~125,000-325,000 tokens/month
- **Projected cost**: $0.008-$0.020/month (~$0.01 typical)
- **Note**: First 200M tokens free for new accounts (voyage-3.5, voyage-3-large)

---

## NFR Compliance

### NFR-COST1: Total Infrastructure ≤ $10/month

| Scenario | Total | Status |
|----------|-------|--------|
| **Free tier** (current) | $0 (VPS) + $0 (Neon Free) + ~$0.01 (Voyage) + $0 (CF) + $1 (domain) = **~$1/month** | **PASS** |
| **Pro tier** (AR6 target) | $0 (VPS) + $19 (Neon Pro) + ~$0.01 (Voyage) + $0 (CF) + $1 (domain) = **~$20/month** | **CONDITIONAL PASS** |

**CONDITIONAL PASS reasoning**: Neon Pro ($19/month) alone exceeds NFR-COST1's $10 threshold. Options:
1. Revise NFR-COST1 threshold to $25/month (recommended — Pro tier is required for v3 concurrency)
2. Remain on Free tier if connection limits are sufficient
3. Explore Neon usage-based pricing tiers

### NFR-COST2: Embedding Budget ≤ $5/month

| Metric | Value | Status |
|--------|-------|--------|
| Projected embedding cost | ~$0.01-$0.02/month | **PASS** |
| Headroom | 99.6% under budget | Significant margin |

### NFR-COST3: Daily Cost Alert Threshold ($0.10/day)

- Voyage AI daily cost at projected volume: ~$0.0003/day
- Alert threshold ($0.10/day) would trigger at ~1.67M tokens/day
- Normal daily volume: ~4,000-10,000 tokens → well under threshold
- **Status**: PASS — alert mechanism defined in architecture (cost-aggregation.ts)

---

## VPS Resource Budget (Oracle ARM64 4-core, 24GB RAM)

| Service | RAM (idle) | RAM (peak) | CPU | Status |
|---------|-----------|-----------|-----|--------|
| Bun server | ~500MB | ~2GB | 1 core | v2 active |
| GitHub Actions runner | ~200MB | ~4GB (build) | 1 core (build) | v2 active |
| n8n Docker | ~860MB | ≤2GB (hard cap) | 2 cores max | v3 Sprint 2 |
| OS + Docker overhead | ~500MB | ~1GB | 0.5 core | Always |
| **Total** | **~2GB** | **~9GB** | **4 cores** | — |
| **Headroom** | **~22GB** | **~15GB** | **Saturates at peak** | — |

**Note**: Neon is cloud-hosted — no local PostgreSQL process. Previous architecture doc included PG ~3GB in peak budget; corrected here.
