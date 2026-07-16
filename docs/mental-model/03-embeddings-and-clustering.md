# Embeddings & Clustering — Finding Systemic Patterns in Unstructured Text

## The Problem

You have 2000 worker complaints in your grievance system. They're written in Vietnamese, Bengali, Khmer, Mandarin, English — sometimes mixed. Workers describe the same problem in completely different words:

- "manager hit me" (English)
- "bị quản lý đánh" (Vietnamese — same meaning)
- "overtime too much cannot go home"
- "forced to work past midnight every day"

The last two describe the same issue (excessive overtime) with zero shared keywords. You can't use keyword matching to group these. And you certainly can't read 2000 complaints by hand.

**Question:** How do you automatically discover that these 2000 individual complaints actually represent, say, 5 systemic patterns?

## Concept 1: Embeddings — Turning Words Into Geometry

An **embedding** converts text into a list of numbers (a "vector") such that similar meanings produce similar numbers.

### The Intuition

Imagine a 2D space where:
- The x-axis represents "severity" (minor → extreme)
- The y-axis represents "topic" (wages → safety)

A complaint about "late salary" might land at (2, 1) — low severity, wage topic.
A complaint about "not paid for three months" might land at (8, 1) — high severity, same topic.
A complaint about "machine crushed my hand" might land at (9, 8) — high severity, safety topic.

Now imagine this with **1024 dimensions** instead of 2. You can't visualize it, but the math works exactly the same. Each dimension captures some aspect of meaning — topic, severity, formality, language, emotion — in ways that aren't individually interpretable but collectively capture the semantic content.

### BGE-M3: Why This Specific Model?

SupplyChain+ uses **BGE-M3** via Ollama. BGE-M3 is specifically designed for:
- **Multi-lingual** text (handles Vietnamese, Bengali, etc. natively)
- **Multi-granularity** (works well on both short and long text)
- **1024-dimensional** output (rich enough to capture nuance, not so large as to be wasteful)

### Why Local Ollama, Not a Cloud API?

Three reasons in order of importance:
1. **Privacy.** Worker grievance messages describe real abuse — harassment, wage theft, unsafe conditions. Sending these to a third-party embedding API creates data privacy risks.
2. **Cost.** 2000 embeddings per run, potentially daily. API embedding costs compound.
3. **Latency.** Local GPU inference avoids network round-trips.

**The tradeoff:** Local inference requires a GPU with enough VRAM. BGE-M3 fits in ~4GB. But only one model can run at a time — if another job tries to use the GPU simultaneously, models swap in and out of VRAM, destroying performance. This is why the queue engine has an `EMBEDDING_JOBS` flag (see [08-queue-engine.md](08-queue-engine.md)).

## Concept 2: Cosine Similarity — Measuring Meaning Distance

Once you have vectors, you need to measure "how similar are these two complaints?" There are many distance/similarity metrics. SupplyChain+ uses **cosine similarity**.

### Why Cosine, Not Euclidean Distance?

**Euclidean distance** measures the straight-line distance between two points. Problem: in high dimensions (1024), it becomes unreliable. All points tend to be roughly equidistant from each other — this is the "curse of dimensionality."

**Cosine similarity** measures the *angle* between two vectors, ignoring their length:

```
cosine_similarity(A, B) = dot(A, B) / (|A| * |B|)
```

- Result of 1.0 = identical direction = same meaning
- Result of 0.0 = perpendicular = unrelated
- Result of -1.0 = opposite direction = opposite meaning

The key advantage: **magnitude-invariant**. A short complaint ("no pay") and a long complaint ("I have not received my salary for three months, the manager says it is delayed but gives no explanation") can have very similar cosine similarity if they're about the same topic, even though their vectors have different lengths.

### The 0.75 Threshold

SupplyChain+ considers two complaints "similar" if their cosine similarity exceeds 0.75. This was chosen empirically:
- **Too low (e.g., 0.5):** Everything clusters together. "Overtime" and "wages" merge because they're both "labor issues."
- **Too high (e.g., 0.95):** Only near-identical complaints cluster. You miss the pattern-level grouping.
- **0.75:** Captures "same topic" while allowing vocabulary and language variation.

Configurable via `CLUSTER_SIMILARITY_THRESHOLD` env var.

## Concept 3: HNSW — Fast Nearest-Neighbor Search

You have 2000 vectors. For each one, you need to find its neighbors (other vectors with cosine similarity > 0.75). The naive approach: compare every pair.

**2000 * 2000 = 4 million comparisons.** Each comparison involves a 1024-element dot product. It works, but it's slow.

### What HNSW Does

**HNSW (Hierarchical Navigable Small World)** is an approximate nearest-neighbor index. Think of it as a multi-layered graph:

- **Bottom layer:** All 2000 points, connected to their nearest neighbors.
- **Higher layers:** Progressively fewer points, forming "express lanes."

To find neighbors of point X:
1. Start at a random point in the top layer (few points, big jumps).
2. Greedily move toward X — each step gets closer.
3. Drop to the next layer (more points, finer resolution).
4. Repeat until you reach the bottom layer.
5. Now you're near X's actual neighbors — explore the local neighborhood.

This is O(n * log n) instead of O(n^2). For 2000 vectors, that's ~22,000 operations instead of 4 million.

**"Approximate"** means HNSW might miss some true neighbors (it trades recall for speed). For clustering, this is acceptable — missing one edge in a cluster of 20 cases doesn't change the result.

### pgvector Integration

PostgreSQL doesn't natively understand vectors. The `pgvector` extension adds:
- A `vector(1024)` column type
- The `<=>` operator for cosine distance (note: distance, not similarity; distance = 1 - similarity)
- HNSW indexing for fast kNN queries

```sql
CREATE INDEX idx_embedding_hnsw ON case_embeddings
USING hnsw (embedding vector_cosine_ops);
```

This means similarity search happens inside PostgreSQL — you don't need a separate vector database (Pinecone, Weaviate, etc.). One less service to operate.

## Concept 4: Union-Find — Turning Neighbors Into Clusters

Finding neighbors gives you pairwise relationships: "A is similar to B", "B is similar to C", "D is similar to E." You need to group these into clusters: {A, B, C} and {D, E}.

This is the **connected components** problem from graph theory. Union-Find is the classic solution.

### How Union-Find Works

Maintain a "parent" pointer for each element. Initially, every element is its own parent (singleton cluster).

**Union(A, B):** Make A's root point to B's root (or vice versa). Now A and B are in the same cluster.

**Find(X):** Follow parent pointers until you reach the root. That root identifies which cluster X belongs to.

**Path compression:** When you call Find(X), point X directly to the root. Future Find(X) calls are O(1).

**Union by rank:** When merging two clusters, attach the shorter tree to the taller one. This keeps trees shallow.

With both optimizations, Find and Union are both O(alpha(n)) — effectively O(1) for any realistic input.

### The Full Clustering Pipeline

```
1. Fetch 2000 messages from SQL Server (filtered: length > 20 chars)
2. For each message: generate embedding via Ollama BGE-M3 (truncate to 1000 chars)
3. Store embeddings in wovo_ai.caseEmbeddings (pgvector)
4. For each embedding: find neighbors via HNSW where (1 - distance) > 0.75
5. For each neighbor pair: Union(embedding_A, embedding_B)
6. Extract connected components (clusters)
7. Filter: keep only clusters with >= 3 cases AND >= 2 unique suppliers
8. Label each cluster via LLM (generate name, summary, severity)
9. Atomic swap: delete old clusters, insert new ones in a transaction
10. Save daily snapshot for trend history
```

### Why >= 2 Suppliers?

If all 15 cases in a cluster come from one factory, that's Factory A's problem — not a systemic pattern. A cluster spanning multiple factories suggests an industry-wide or regional issue. Brands need to know about cross-factory patterns because they indicate root causes that can't be solved by fixing one factory.

### Atomic Swap and Daily Snapshots

Clusters are fully rebuilt each run. The database transaction:
```
BEGIN
  Clear cluster references from embeddings
  DELETE all old clusters
  INSERT new clusters
  UPDATE embeddings with new cluster IDs
COMMIT
```

If anything fails, the old clusters remain intact (transaction rollback).

But you need trend data: "Were there more critical clusters last week?" The `clusterSnapshots` table saves today's counts before the swap. These snapshots survive rebuilds and power the trend charts.

### LLM Cluster Labeling

After clustering, the system sends representative messages from each cluster to an LLM:

```
Given these worker complaints from a cluster:
- "no salary for two months"
- "payment always delayed"
- "manager says money coming but never does"
What is this pattern? Return: {label, summary (2-3 sentences), severity}
```

The LLM generates human-readable labels like "Wage Payment Delays" instead of "Cluster #7." If two clusters get the same label, the system appends the region or case count to disambiguate.
