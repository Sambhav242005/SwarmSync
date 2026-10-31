# SwarmSync: datasets, context budgets and complete outputs

> Scope reviewed 31 October 2026: dated reference research for optional extensions. Dataset/model training, executable language runtimes and Android measurements are not prerequisites for the [current synthetic study](RESEARCH-COMPLETION-PLAN.md). Original evidence dates and source claims below have not been revalidated.

Research/design note, 25 October 2026. User decisions: include both ground/social imagery and satellite/drone imagery; cover additional requirements needed for a credible comparison. This note specifies proposed behavior; it does not claim the simulator, model conversion or Android adapter already implements it.

## Dataset decision

Start two independent studies, with a drone extension. Keep label ontologies and scores separate:

| Track | Starting dataset | Checkable task | Comparison metrics |
|---|---|---|---|
| Disaster photographs, mixed social-media viewpoints | [CrisisMMD v2](https://crisisnlp.qcri.org/crisismmd) severity subset | Classify visible damage as little/no, mild or severe | Macro-F1, per-class precision/recall, confusion matrix |
| Satellite imagery | [xBD/xView2](https://xview2.org/dataset) | Localize buildings and classify pre/post damage | Official localization/damage metrics plus per-grade errors |
| Drone extension | [RescueNet](https://github.com/BinaLab/RescueNet-A-High-Resolution-Post-Disaster-UAV-Dataset-for-Semantic-Segmentation) | Segment damage levels and clear/blocked roads | Per-class IoU and target-class recall |

Detailed sources, alternatives, access and license conditions are in [dataset-options.md](dataset-options.md). CrisisMMD's actual released severity annotations were inspected: 2,468 train / 529 dev / 529 test. Images have not been acquired. xBD's published 850,736 count describes building annotations, not image count. RescueNet reports 4,494 images. These corpora do not provide matched phone/satellite/drone views of the same object; do not claim cross-view fusion from unrelated examples.

For a strictly phone-camera road-detection workload, RDD2022 is an alternative with road-crack/pothole labels; it is a different target from building damage. Avoid adding all datasets to the first experiment. Implement CrisisMMD first, then the satellite track; add drone segmentation only after the initial experiments work. This preserves the one-month scope while retaining both requested modalities.

Each acquired release needs source URL, release/version, retained terms, archive/file hashes, an item manifest, missing/corrupt-file counts, frozen train/dev/test IDs, modality, task namespace and annotation conversion rules. Keep related scenes, near duplicates and pre/post pairs together in additional holdouts. Preserve official splits for comparable results, and report event/geographic holdouts separately. Test labels belong only to the evaluator.

## What “context length” and “maximum output” mean

The current `llm_int4` and `reason_int8` entries in the repository are synthetic profile names, not selected checkpoints. They currently have no defensible real context/output limits or tokenizer. Pin an actual checkpoint, tokenizer/chat template, conversion artifact, runtime version and backend before setting a model-specific maximum.

Conventional image classifiers, detectors and segmenters have image dimensions, batch/patch limits, output classes and postprocessing bounds. They do not have a language-model text context window. A text-only reasoning model receives structured observations from those models; it cannot inspect image pixels merely because the prompt includes a filename. A future VLM must account for image tokenization, image/patch limits and encoder memory separately.

Examples checked against model creators' sources:

| Candidate | Published/configured sequence capacity | Interpretation |
|---|---:|---|
| [SmolLM2-360M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct/blob/main/config.json) | 8,192 positions in the official config | Small text baseline; no independent fixed output maximum established by this config |
| [Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B) | 32,768 tokens advertised in its model card | Small text reasoning candidate; output shares the effective sequence budget |
| [Gemma 3 1B](https://ai.google.dev/gemma/docs/core/model_card_3) | 32K in the current creator model card | Another text baseline; creator guidance describes output capacity after subtracting input tokens |

These are research candidates, not successful Android conversions. Qwen's [actual config](https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/config.json) lists `max_position_embeddings: 40960`, while its card advertises 32,768. Use 32,768 as the conservative published ceiling until an exact artifact/runtime is validated; do not silently promote a positional-embedding setting or a sample `max_new_tokens` value into a tested deployment limit. Older Gemma cards have also described output limits differently; pin the chosen revision and the runtime's enforced behavior rather than mixing documentation versions.

Define the effective context as the minimum of the documented checkpoint limit, converted artifact limit, runtime-configured capacity and device-validated budget. Record any separate model/runtime output ceiling too. Maximum output for a given request is bounded by that ceiling, application policy and remaining context—not one universal number for all agents or all calls.

## Initial phone-oriented application budgets

These are **proposed starting policies**, not measured hardware maxima:

| Role | Total effective context | Maximum fully rendered input | Maximum generated tokens | Reserved margin |
|---|---:|---:|---:|---:|
| Local observation reasoning | 4,096 | 3,456 | 512 | 128 |
| Coordinator summary/decision | 4,096 | 2,944 | 1,024 | 128 |

Input means the exact tokenized sequence after system instructions, roles, templates, task data, selected history, evidence and any tool schemas/results. Count with the pinned tokenizer/template. Do not estimate from characters or assume tokens equal words. For thinking models, hidden/reasoning tokens also consume the generated-token allocation. Use validated non-thinking execution for the compact baseline; test a separately budgeted reasoning mode as an ablation.

Admission invariant:

```text
rendered_input_tokens + requested_generated_tokens + reserved_margin
    <= effective_context_tokens
```

If an input does not fit, create smaller atomic jobs or select a recorded subset of relevant evidence and retokenize. Never cut a raw serialized prompt/JSON in the middle, remove required task instructions, or silently discard contradictions. Larger 8K/16K contexts are later sensitivity experiments, not the default. Preflight every new turn and retry, including any newly accumulated tool messages or conversation state.

### Why weight size does not determine context capacity

For a conventional full-attention KV cache:

```text
KV bytes ≈ 2 × layers × KV_heads × head_dimension × bytes_per_element × tokens
```

Using Qwen3-0.6B's published config (28 layers, 8 KV heads, head dimension 128), a single FP16/BF16 KV cache is approximately **448 MiB at 4,096 tokens**, **896 MiB at 8,192**, and **3.5 GiB at 32,768**. These are calculations from the config, **not measured Android RAM usage**. Runtime allocation, cache quantization, duplicated buffers and backend layout can change them. Model weights, activations, image encoders and application memory are additional. INT4 weights do not automatically mean an INT4 KV cache.

## Prevent silent cutoffs and make the model aware

Prompt instructions help shape an answer; they cannot guarantee completion within a token limit. The system must enforce a contract and distinguish valid completion from interruption.

1. **Bound the task before generation.** Request one atomic decision per call, with task-specific label enums, short evidence IDs and bounded arrays/strings. Batch or paginate additional records as separate requests. Do not request an unbounded scene report with a 512-token budget.
2. **State the contract in the prompt.** Explain the allowed fields, list bounds and required brevity. Request a complete JSON object, evidence references and an explicit uncertainty/insufficient-evidence option. Avoid long narrative explanations in the compact baseline.
3. **Enforce tokens in the runtime.** Set both total context capacity and generated-token cap. Keep automatic tool loops disabled for the initial benchmark; if later enabled, maintain a total task token/time budget across calls, not only a per-call cap.
4. **Validate output independently.** Check JSON/schema, label namespace, matching task ID, bounds, evidence IDs and required fields. A model's own `complete` claim is not proof. Schema-valid content may still be factually wrong, which is scored separately.
5. **Keep partial results out of committed knowledge.** Buffer streamed fragments until completion checks pass. Preserve rejected output in diagnostic records; do not propagate it as a completed observation.
6. **Classify interruptions.** Distinguish natural/grammar-complete stop, output-cap stop, context exhaustion, timeout, cancellation, invalid output and runtime failure. Do not infer a natural stop from a generic `onDone` callback alone. If the chosen adapter does not expose enough information, use an explicit unknown/possibly-truncated status and validate conservatively.
7. **Allow one bounded recovery attempt.** If context/time still permits, regenerate the atomic result from the original evidence with a smaller output contract. Count both attempts' compute/tokens/delay. Do not blindly concatenate a continuation onto broken JSON. If it still fails or the task deadline expires, return an explicit incomplete result and score the failure.

Suggested prompt contract, to be generated from the actual schema and selected evidence:

```text
Assess this one task using only the supplied observations.
Return one complete JSON object in the provided schema.
Use only permitted labels and supplied evidence IDs.
Keep evidence lists within the schema's bound; omit narrative prose.
Use uncertain/insufficient_evidence when the observations do not support a label.
```

Include the current response allowance as prompt metadata, but do not rely on the model to count its own tokens. A constrained decoder can improve formatting, yet a length/time stop can still interrupt generation; validate its termination too. “Never silently treat a cutoff as success” is enforceable. “Every possible request always finishes” is not a valid guarantee under finite memory and deadlines.

### Current LiteRT-LM capability checked

Context7 and the [official Kotlin configuration source](https://github.com/google-ai-edge/LiteRT-LM/blob/main/kotlin/java/com/google/ai/edge/litertlm/Config.kt) identify total capacity through `EngineConfig.maxNumTokens` and a per-decode output cap through `ConversationConfig.maxOutputToken`. Reasoning and final response count together. Runtime configuration alone is not evidence that a checkpoint supports the selected size. The source also describes thinking controls and response-format support. The official [C++ constrained-decoding guide](https://github.com/google-ai-edge/LiteRT-LM/blob/main/docs/api/cpp/constrained-decoding.md) documents JSON Schema/grammar support. Verify features against the packaged release and backend, not only moving `main`.

The examined sources did not establish a portable Kotlin preflight tokenizer method or a typed termination-reason API suitable for assuming all the classifications above are directly available. Those are **adapter acceptance requirements**, not invented SDK methods. The adapter must supply exact compatible tokenization and sufficient stop telemetry, or declare the limitation. No runtime integration is implemented by this note.

## What else is necessary for a research comparison

| Requirement | Initial decision |
|---|---|
| A checkable task | Dataset-specific classification/geometry; no general “danger detection” claim |
| Actual models | Pin weights, conversion, precision, runtime, tokenizer and input normalization; use task-trained vision heads |
| Baselines | Single-device perception; no sharing; full sharing; selective sharing; rule-based coordinator versus language coordinator |
| Error separation | Perception-only; coordinator with oracle evidence; coordinator with predicted evidence; complete swarm |
| Same experimental conditions | Identical held-out samples, independent RNG streams, task arrivals, failures and network traces per paired comparison |
| Real information boundaries | Local evidence stores; receipt-driven updates; ground truth only in evaluator |
| Timing and queues | Inference duration, prefill/decode, waiting, serialization, retries and message age affect outcomes |
| Primary system outcome | Unique correct results delivered to the designated destination before deadline per observation second |
| Quality and resource outcomes | Task-specific F1/AP/IoU, misses/false alarms, p50/p95 latency, bytes, peak RAM, completion/truncation rates, measured or explicitly estimated energy |
| Uncertainty | Do not treat confidence as calibrated correctness probability; validate thresholds on dev data and allow abstention |
| Reproducibility | Frozen manifests, seeds, revisions, configuration hashes, per-run events, evaluator and metric recomputation |
| Generalization | Report each modality/dataset separately and event/geographic holdouts; no fabricated synchronized multi-view claims |

Static datasets need reproducible **synthetic** device assignment, arrivals and network conditions for swarm experiments. Merely distributing unrelated pictures across agents does not test multi-view fusion. Receiving a known item ID must not reveal its ground-truth label through filenames, split paths, embedded metadata or message payloads.

## Acceptance tests before collecting paper results

- Input exactly fits the budget; one token over is rejected or re-packed before generation; include templates, Unicode, long IDs and growing history.
- The 512/1,024 caps are enforced and reasoning counts toward the cap; retries/tool loops do not reset a cumulative task budget unnoticed.
- Length stop, context overflow, timeout, mid-string JSON interruption, invalid schema and a missing evidence ID never become a successful committed task.
- A normal bounded response validates; uncertainty remains distinct from malformed/incomplete output; an interrupted coordinator cannot invent a completed hazard assessment.
- Dataset splits and labels match the manifests; image transforms preserve box/mask geometry; test labels are absent from all agent inputs.
- Replay and reset are deterministic for simulation traces. Actual ML runs record sampling/backend settings and repeated-run variability rather than promising identical hardware outputs.
- Recompute completed-task, deadline, token, retry and communication metrics from raw events; include failed runs and all recovery costs.

## Status of this pass

Dataset sources, real context examples and runtime semantics were researched. A small CrisisMMD annotation archive was read and its damage split counts checked; no image dataset was downloaded. No model weights were downloaded, no terms accepted on the user's behalf, no Android benchmarks run, and no simulator/application source changed. The two outstanding execution dependencies are acquiring the selected image releases and validating actual converted checkpoints on the chosen runtime/device scope.
