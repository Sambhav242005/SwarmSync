# SwarmSync literature review: on-device vision throughput and collaborative perception

> Scope reviewed 31 October 2026: dated reference research for optional extensions. Dataset/model training, executable language runtimes and Android measurements are not prerequisites for the [current synthetic study](RESEARCH-COMPLETION-PLAN.md). Original evidence dates and source claims below have not been revalidated.

Reviewed: 25 October 2026. Audience: the SwarmSync research project. Scope: **17 primary papers**, with method and evaluation sections inspected in accessible full texts. This is a targeted engineering review, not a systematic literature review, an experimental reproduction, or a claim that every paragraph and supplement was read.

## Findings and recommendation

**Optimize local perception and communication as two explicit decisions.** First select an executable model, precision, input resolution and backend for each device. Then decide whether, when and what observations to transmit. Investigate splitting a model across devices separately: its feature-transfer, synchronization and recovery costs differ from sharing completed detections. This is our interpretation of the papers, not a reported SwarmSync result.

The strongest practical starting points are MobileNetV3/V4 for mobile vision, integer-only quantization for precision tradeoffs, MNN for runtime costs, nn-Meter for hardware-specific performance models, and When2com/Where2comm/How2comm for communication selection. DeepThings and DISCO are useful contrasts when considering model partitioning. None establishes a particular FPS, battery life, hazard recall or speedup for the current project.

SwarmSync currently has a TypeScript simulation, not an Android inference implementation. Its inference latency is a calculated value rather than scheduled work; bandwidth/delay/loss do not govern message delivery; agents access a global knowledge store; several resource metrics are zero placeholders. These observations come from the repository inspection, not from the papers. Until corrected, faster model profiles cannot demonstrate higher application throughput.

## Reading index: all 17 reviewed papers

The first eleven have detailed notes below. The final six have detailed method/evaluation notes in [the companion review](literature-collaboration-notes.md). Every row links to the primary full text. Citation keys match [the BibTeX file](literature-review-on-device-vision.bib).

| ID / citation key | Paper | Venue / year | Relevance |
|---|---|---|---|
| P01 `sandler2018mobilenetv2` | [MobileNetV2: Inverted Residuals and Linear Bottlenecks](https://openaccess.thecvf.com/content_cvpr_2018/papers/Sandler_MobileNetV2_Inverted_Residuals_CVPR_2018_paper.pdf) | CVPR 2018 | Mobile backbone and lightweight detector head |
| P02 `howard2019mobilenetv3` | [Searching for MobileNetV3](https://openaccess.thecvf.com/content_ICCV_2019/papers/Howard_Searching_for_MobileNetV3_ICCV_2019_paper.pdf) | ICCV 2019 | Hardware-aware architecture and operator implementation |
| P03 `qin2024mobilenetv4` | [MobileNetV4: Universal Models for the Mobile Ecosystem](https://www.ecva.net/papers/eccv_2024/papers_ECCV/papers/05647.pdf) | ECCV 2024 | Compute/memory bottlenecks and backend portability |
| P04 `tan2019mnasnet` | [MnasNet: Platform-Aware Neural Architecture Search for Mobile](https://openaccess.thecvf.com/content_CVPR_2019/papers/Tan_MnasNet_Platform-Aware_Neural_Architecture_Search_for_Mobile_CVPR_2019_paper.pdf) | CVPR 2019 | Optimize measured target-device latency |
| P05 `tan2019efficientnet` | [EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks](https://proceedings.mlr.press/v97/tan19a/tan19a.pdf) | ICML 2019 | Joint depth, width and resolution choices |
| P06 `jacob2018quantization` | [Quantization and Training of Neural Networks for Efficient Integer-Arithmetic-Only Inference](https://openaccess.thecvf.com/content_cvpr_2018/papers/Jacob_Quantization_and_Training_CVPR_2018_paper.pdf) | CVPR 2018 | Quantized execution and accuracy tradeoffs |
| P07 `wang2019haq` | [HAQ: Hardware-Aware Automated Quantization With Mixed Precision](https://openaccess.thecvf.com/content_CVPR_2019/papers/Wang_HAQ_Hardware-Aware_Automated_Quantization_With_Mixed_Precision_CVPR_2019_paper.pdf) | CVPR 2019 | Precision must match actual accelerator capabilities |
| P08 `lin2020mcunet` | [MCUNet: Tiny Deep Learning on IoT Devices](https://papers.neurips.cc/paper_files/paper/2020/file/86c51678350f656dcc7f490a43946ee5-Paper.pdf) | NeurIPS 2020 | Model/runtime co-design and activation memory |
| P09 `jiang2020mnn` | [MNN: A Universal and Efficient Inference Engine](https://proceedings.mlsys.org/paper_files/paper/2020/file/bc19061f88f16e9ed4a18f0bbd47048a-Paper.pdf) | MLSys 2020 | Fusion, allocation, kernels and backend costs |
| P10 `zhang2021nnmeter` | [nn-Meter: Towards Accurate Latency Prediction of Deep-Learning Model Inference on Diverse Edge Devices](https://air.tsinghua.edu.cn/pdf/nn-Meter-Towards-Accurate-Latency-Prediction-of-Deep-Learning-Model-Inference-on-Diverse-Edge-Devices.pdf) | MobiSys 2021 | Calibrate latency per model/runtime/device |
| P11 `gupta2019xbd` | [Creating xBD: A Dataset for Assessing Building Damage from Satellite Imagery](https://openaccess.thecvf.com/content_CVPRW_2019/papers/cv4gc/Gupta_Creating_xBD_A_Dataset_for_Assessing_Building_Damage_from_Satellite_CVPRW_2019_paper.pdf) | CVPR Workshops 2019 | Define the disaster task and label limitations |
| P12 `kang2017neurosurgeon` | [Neurosurgeon: Collaborative Intelligence Between the Cloud and Mobile Edge](https://ypkang.github.io/downloads/kang17neurosurgeon.pdf) | ASPLOS 2017 | Compute versus activation-transfer cost |
| P13 `zhao2018deepthings` | [DeepThings: Distributed Adaptive Deep Learning Inference on Resource-Constrained IoT Edge Clusters](https://slam.ece.utexas.edu/pubs/codes18.DeepThings.pdf) | CODES+ISSS / TCAD 2018 | Distributed tiles, queues and load balancing |
| P14 `liu2020when2com` | [When2com: Multi-Agent Perception via Communication Graph Grouping](https://openaccess.thecvf.com/content_CVPR_2020/papers/Liu_When2com_Multi-Agent_Perception_via_Communication_Graph_Grouping_CVPR_2020_paper.pdf) | CVPR 2020 | Learn when and with whom to communicate |
| P15 `hu2022where2comm` | [Where2comm: Communication-Efficient Collaborative Perception via Spatial Confidence Maps](https://proceedings.neurips.cc/paper_files/paper/2022/file/1f5c5cd01b864d53cc5fa0a3472e152e-Paper-Conference.pdf) | NeurIPS 2022 | Select useful spatial information |
| P16 `yang2023how2comm` | [How2comm: Communication-Efficient and Collaboration-Pragmatic Multi-Agent Perception](https://proceedings.neurips.cc/paper_files/paper/2023/file/4f31327e046913c7238d5b671f5d820e-Paper-Conference.pdf) | NeurIPS 2023 | Redundancy and stale-message handling |
| P17 `qin2024disco` | [DISCO: Distributed Inference With Sparse Communications](https://openaccess.thecvf.com/content/WACV2024/papers/Qin_DISCO_Distributed_Inference_With_Sparse_Communications_WACV_2024_paper.pdf) | WACV 2024 | Joint model and communication sparsity |

## On-device and task-grounding reading notes

Page references below are physical PDF pages starting at one. Reported numerical examples belong to each paper's experimental setup and are not expected SwarmSync performance.

### P01. MobileNetV2 — Mark Sandler et al.

**Read:** inverted residual/bottleneck discussion and memory-efficient implementation, PDF pp. 4–6; detection and segmentation evaluation, pp. 7–8, especially Tables 4–7.

**Method and evidence:** Narrow residual connections, linear bottlenecks and depthwise convolutions reduce mobile computation and activation storage. SSDLite also replaces expensive detector-head convolutions. Table 6 reports 22.1 COCO mAP and 200 ms for the MobileNetV2 detector on one Pixel 1 large CPU core, using an internal TF-Lite version and 320×320 inputs. Classification results are a different workload.

**SwarmSync interpretation:** Model the full perception task, including its head, input resolution and memory. Do not use backbone classification latency as detector latency. Width/resolution alternatives are candidates to benchmark, not validated hazard models. [Primary text](https://openaccess.thecvf.com/content_cvpr_2018/papers/Sandler_MobileNetV2_Inverted_Residuals_CVPR_2018_paper.pdf)

### P02. MobileNetV3 — Andrew Howard et al.

**Read:** network search and expensive-layer/nonlinearity changes, Sections 4–5, PDF pp. 3–4; measurement and results, Sections 6.1.2–6.3, pp. 6–7.

**Method and evidence:** Combines platform-aware architecture search, layer adaptation and implementation-aware changes such as hard-swish. Table 3's ImageNet measurements use batch one and one large CPU core on Pixel phones. The detection evaluation reports 119 ms and 22.0 mAP for the channel-reduced V3 SSDLite, versus V2's 162 ms and 22.1 mAP. Optimized versus naive operators also change runtime.

**SwarmSync interpretation:** Use mobile detector candidates and measure the converted graph, not just the architecture name. A resolution change may remove small hazard evidence; validate task recall rather than assuming classification scaling transfers unchanged. Paper-era CPU timings do not establish current GPU/NPU rankings. [Primary text](https://openaccess.thecvf.com/content_ICCV_2019/papers/Howard_Searching_for_MobileNetV3_ICCV_2019_paper.pdf)

### P03. MobileNetV4 — Danfeng Qin et al.

**Read:** roofline argument, Sections 3–5, PDF pp. 3–4 and 6–8; classification/detection evaluation, Section 7, pp. 10–12, Tables 6–7.

**Method and evidence:** Universal inverted bottlenecks and mobile multi-query attention account for both arithmetic and memory traffic. Evaluates several mobile CPU/GPU/DSP/accelerator targets. Table 6 explicitly records unsupported model/backend combinations. Table 7's complete 384-pixel Conv-M detector reports 32.6 COCO AP at 51.3 ms on Pixel 6 CPU; this is distinct from its classification benchmarks.

**SwarmSync interpretation:** Candidate models need a device/backend compatibility matrix, plus measured service-time and memory distributions. The current average of CPU, GPU and NPU scores cannot express these differences. Backend portability is empirical; an NPU label alone is insufficient. [Primary text](https://www.ecva.net/papers/eccv_2024/papers_ECCV/papers/05647.pdf)

### P04. MnasNet — Mingxing Tan et al.

**Read:** latency-aware objective and search, Sections 3–4, PDF pp. 3–4; setup and comparisons, Sections 5–6, pp. 5–6.

**Method and evidence:** Searches a diverse mobile architecture space using accuracy and actual target-phone latency, instead of relying on operation count alone. Table 1 reports MnasNet-A1 at 75.2% ImageNet top-1 and 78 ms; latency is batch-one execution on a single Pixel 1 big CPU core. Search itself uses substantial training resources.

**SwarmSync interpretation:** Select among existing candidate models using a measured accuracy/latency frontier. Re-running architecture search is outside the one-month scope. Do not equate low FLOPs, smaller files, or higher abstract device scores with proportionally higher throughput. [Primary text](https://openaccess.thecvf.com/content_CVPR_2019/papers/Tan_MnasNet_Platform-Aware_Neural_Architecture_Search_for_Mobile_CVPR_2019_paper.pdf)

### P05. EfficientNet — Mingxing Tan and Quoc V. Le

**Read:** scaling formulation and width/depth/resolution analysis, Section 3, PDF pp. 3–4; ImageNet and measured-latency comparisons, Section 5.2 and Tables 2–4, p. 6.

**Method and evidence:** Coordinates depth, width and resolution rather than scaling one dimension arbitrarily. Evaluates classification and transfer tasks. Table 4's often-cited 6.1× inference comparison is measured at batch one on a single Intel Xeon E5-2690 CPU core, not an Android NPU or phone-camera pipeline.

**SwarmSync interpretation:** Include model scale and resolution in profiles, and re-evaluate the actual task at each setting. This supports investigating tradeoffs; it does not justify assigning EfficientNet an Android FPS multiplier. It is supporting architecture literature rather than a direct swarm-policy baseline. [Primary text](https://proceedings.mlr.press/v97/tan19a/tan19a.pdf)

### P06. Integer-only quantization — Benoit Jacob et al.

**Read:** affine quantization and integer arithmetic, Section 2, PDF p. 3; simulated-quantization training, Section 3, p. 5; ImageNet, COCO and face evaluation, Section 4.2, pp. 7–8.

**Method and evidence:** Quantizes weights and activations, with integer accumulation and training that simulates quantization effects. Table 4.4's half-width MobileNet detector changes from 121 ms/16.7 mAP in float to 61 ms/16.6 mAP in 8-bit on one Snapdragon 835 big core. Gains differ with processor and workload.

**SwarmSync interpretation:** Compare a floating-point reference with an actually executable INT8 version on held-out task data. Use quantization-aware training if the chosen conversion loses unacceptable accuracy. Neither a universal INT8 speedup nor automatically faster INT4 execution follows from this paper. [Primary text](https://openaccess.thecvf.com/content_cvpr_2018/papers/Jacob_Quantization_and_Training_CVPR_2018_paper.pdf)

### P07. HAQ — Kuan Wang et al.

**Read:** RL policy, hardware-feedback objective and quantization, Section 3, PDF pp. 3–4; latency/energy comparisons, Section 4, pp. 6–7.

**Method and evidence:** Chooses per-layer weight/activation precision using hardware-specific latency/energy feedback and accuracy. Evaluates ImageNet models using BISMO and BitFusion accelerator configurations; the framework explicitly uses hardware simulation. Different architectures and objectives produce different precision assignments. Table 3 reports approximately 1.4–1.95× latency reductions against fixed 8-bit configurations in its setup.

**SwarmSync interpretation:** Precision belongs to a supported runtime/backend combination, not a global scalar. Mixed precision is an optional later optimization, not an immediate phone capability. This paper does not validate the current `INT4 = 0.8` inference factor or its battery calculations. [Primary text](https://openaccess.thecvf.com/content_CVPR_2019/papers/Wang_HAQ_Hardware-Aware_Automated_Quantization_With_Mixed_Precision_CVPR_2019_paper.pdf)

### P08. MCUNet — Ji Lin et al.

**Read:** TinyNAS/TinyEngine design, Section 3, PDF pp. 4–6; setup and classification evaluation, Sections 4.1–4.2, pp. 6–7.

**Method and evidence:** Co-designs a memory-constrained model with compiled kernels, operation fusion, model-aware buffers and in-place depthwise execution. Tests STM32 microcontrollers, not Android phones. Table 4's 70.7% ImageNet result uses 4-bit deployment on STM32H743 with 512 kB SRAM/2 MB flash; this is not the default INT8 setting.

**SwarmSync interpretation:** Peak activations, temporary buffers and runtime memory can determine whether a model runs at all. Preserve that lesson, while keeping MCU measurements separate from mobile-device profiles. TinyEngine is not selected as the Android runtime by this review. [Primary text](https://papers.neurips.cc/paper_files/paper/2020/file/86c51678350f656dcc7f490a43946ee5-Paper.pdf)

### P09. MNN — Xiaotang Jiang et al.

**Read:** engine architecture and preparation/execution separation, Sections 3.1–3.2, PDF pp. 3–4; experimental settings, runtime comparisons and case study, Section 4, pp. 8–10.

**Method and evidence:** Combines offline graph transformations, backend-aware computation selection, specialized kernels, and preallocated/reused memory. Benchmarks MobileNet-v1, SqueezeNet and ResNet-18 on iPhones, MI6 and Mate20 with CPU/GPU configurations. The controlled benchmark uses one warm-up and averages ten batch-one runs; production observations are a separate case study.

**SwarmSync interpretation:** Initialization, graph execution, buffer copies, thread configuration, and operator fallback need separate accounting. Ten short runs do not characterize thermal steady state. The paper's historical runtime rankings do not establish which current runtime is fastest on a future target phone. [Primary text](https://proceedings.mlsys.org/paper_files/paper/2020/file/bc19061f88f16e9ed4a18f0bbd47048a-Paper.pdf)

### P10. nn-Meter — Li Lyna Zhang et al.

**Read:** fusion-aware kernel prediction, Sections 2–3, PDF pp. 3–4; implementation and evaluation, Sections 5.3–7, pp. 8–10.

**Method and evidence:** Detects backend-specific operator fusion, samples kernel configurations, builds latency predictors, and sums predicted kernel durations. Evaluates 26,000 model variants on Pixel 4 CPU, Mi9 GPU and Intel NCS2 VPU. Section 7.2.2 reports 99.0%, 99.1% and 83.4% of models within a ±10% latency error boundary, respectively. These are prediction accuracies, not classification accuracies or speedups.

**SwarmSync interpretation:** Replace generic capability averages with versioned device/model/backend profiles or validated predictors. Report held-out prediction error and validity ranges. This work assumes sequential kernel execution for its tested systems; concurrent workloads and thermally throttled operation need additional modeling. [Primary text](https://air.tsinghua.edu.cn/pdf/nn-Meter-Towards-Accurate-Latency-Prediction-of-Deep-Learning-Model-Inference-on-Diverse-Edge-Devices.pdf)

### P11. Creating xBD — Ritwik Gupta et al.

**Read:** Joint Damage Scale, labels and quality control, Sections 3.2–3.6, PDF pp. 3–4; challenge formulation and limitations, Section 4, p. 5.

**Method and evidence:** Defines building localization and ordinal damage assessment using pre/post-disaster satellite imagery, expert-informed labels and staged quality control. The authors explicitly describe visual damage assessment as a proxy for in-person functional assessment. This 2019 paper is a preliminary dataset report; its projected counts must not be presented as verified current release statistics. It is not an inference-throughput experiment.

**SwarmSync interpretation:** Specify inputs, ground truth, damage classes and evaluation before modeling “danger.” Satellite results do not validate handheld-camera inspection or structural safety. If used, treat xBD as an overhead-imagery workload; verify release, access terms, splits and actual labels before experiments. [Primary text](https://openaccess.thecvf.com/content_CVPRW_2019/papers/cv4gc/Gupta_Creating_xBD_A_Dataset_for_Assessing_Building_Damage_from_Satellite_CVPRW_2019_paper.pdf)

## What high throughput should mean here

These definitions and the protocol below are proposed for SwarmSync; they are not results reported by the cited papers.

| Measurement | Definition | Why it matters |
|---|---|---|
| Inference throughput | Completed model executions / steady-state seconds | Separates execution capacity from camera frame rate |
| Useful task throughput | Unique, correct task results received at the required destination before their deadlines / observation seconds | Prevents duplicate or late outputs inflating success |
| End-to-end latency | Required-result receipt time minus input capture time | Includes waiting, preprocessing, inference, transfer and fusion |
| Freshness | Receipt/use time minus observation capture time | Detects stale knowledge even when inference is fast |
| Resource cost | Bytes transmitted, peak memory, and measured/explicitly estimated energy per useful task | Makes the system cost visible |

For one sequential worker with no other overhead, an inference duration of `t` seconds implies capacity near `1/t`. This is only a simplified bound. A real pipeline has queues, copies and competing stages. Pipelining can overlap stages where the hardware permits; it does not remove the bottleneck or eliminate input waiting. Parallel phones only help when the work is independent or splitting costs are paid. Report drop rate and task recall alongside FPS so discarding difficult frames cannot manufacture a gain.

## Proposed on-device optimization order

1. **Define the vision workload.** Pick classification, detection or segmentation; choose labeled inputs that match the intended camera modality. A generic detector is not a trained damage assessor. Keep ground truth unavailable to the scheduler.
2. **Establish a full-pipeline baseline.** Measure capture/decode, resize/color conversion, copying, model execution, postprocessing, and optional transmission separately. Time accelerator completion, not merely asynchronous submission.
3. **Compare a small model set.** Start with an executable MobileNetV3-based detector and a MobileNetV4-based candidate, with a floating-point reference and supported INT8 conversion. Preserve identical task labels and evaluation splits. Availability and successful conversion remain gates, not assumed completed work.
4. **Benchmark CPU/GPU/NPU options that actually support each converted model.** Record fallback partitions, transfer overhead, memory, runtime version and driver. Choose from measured results rather than forcing the NPU.
5. **Reduce waste.** Reuse buffers, avoid repeated model loading, fuse supported preprocessing, and bound frame queues. Use batch one initially; test batching as a separate offline-throughput option with its added waiting time.
6. **Adapt to load.** Compare fixed settings with explicit model/resolution/admission choices. Any change or frame-skipping policy must retain its task-quality and deadline accounting. Set thresholds on validation data, not on the final test set.
7. **Test sustained operation.** Separate cold start, warm execution and thermal/load behavior. Fast first-run results are insufficient for an always-on scenario.
8. **Add communication choices.** Initially share completed observations/detections with timestamps and provenance. Use intermediate features or split execution only in a separate configuration with measured/assumed tensor sizes, dependencies and recovery rules.

### Current runtime documentation, separate from the paper count

Context7 was used to check the official LiteRT documentation. The [on-device inference guide](https://developers.google.com/edge/litert/guide/inference) recommends `CompiledModel` for new accelerator features and documents asynchronous execution and buffer interoperability. This is a deployment candidate, not evidence that a particular model will run fully on every NPU. Pin the runtime and verify each actual device/model combination.

The official [benchmark measurement guide](https://developers.google.com/edge/litert/models/measurement) distinguishes initialization, warm-up, steady execution and memory. Its historical model tables must not be treated as benchmarks for the project's future hardware. Its Interpreter benchmark path and a new CompiledModel application must also be identified separately in experimental records. These are documentation sources, **not two additional research papers**.

## Changes SwarmSync needs before evaluating throughput

| Present implementation | Required capability | Literature motivation |
|---|---|---|
| Generic CPU/GPU/NPU average and fixed precision factors | Model × backend × precision × resolution × device compatibility and service-time profiles, with provenance and uncertainty | P03, P07, P10 |
| One agent state transition each tick | Explicit queued/running/completed inference jobs; duration controls completion; concurrent work competes for capacity | P09, P13 |
| Speed multiplies the simulation clock's advance | Fixed scientific time semantics; UI playback speed affects pacing only | Experiment validity requirement |
| One shared knowledge store | Local stores updated only by local inference or successfully delivered messages | P14–P16 |
| Link flap and immediate sharing | Transmission queues, serialization, propagation, drops/retries, receipt events, message age and encoding/control overhead | P12–P17 |
| State-cycle task completion | Checkable task outputs, destination, deadline and independent truth | P11 plus study design |
| Zero resource aggregates | Complete event-level measurements with missing values distinguished from zero | Study validity requirement |
| Scripted damage/conflict paths | Task-grounded observations or explicitly synthetic error processes held fixed across policies | P11, P14–P16 |

A minimal versioned inference profile should identify device/SoC, model/checkpoint hash, task, runtime/version, backend, precision, input shape, concurrency, service-time samples, peak memory, energy provenance, and task-quality evaluation. Mark profiles as `measured`, `paper-derived` or `synthetic`. Do not combine an inference time from one phone with energy from another as a calibrated profile. Published results can support sensitivity ranges when conditions are stated; they do not calibrate unmeasured Android tiers.

For new events, preserve `SimEvent` IDs, simulation timestamps and causality, while adding distinct job queued/started/completed and message sent/received/dropped records. Historical replay must reconstruct the queues, local knowledge and resources. This describes a required interface extension; this literature-review change does not implement it.

## Experiment proposal for the one-month simulation paper

**Candidate question:** Does combining per-device inference configuration with selective sharing increase correct, timely delivered task results under communication/resource limits, compared with fixed local inference and conventional sharing? This is a hypothesis to test, not a novelty or superiority claim.

**Keep the first study small:** six devices, one checkable perception task, reproducible input/error traces, connected/intermittent/disconnected conditions and a defined outage/reconnection case. Hold workload, model-quality assumptions, network traces and failure schedule constant across paired policies. Use independent random streams so policy-dependent random draws cannot change the external environment.

**Use a factorial comparison to distinguish causes:** fixed versus adaptive local inference crossed with no sharing, full sharing and selective sharing. In the fixed condition, match the model/backend/resolution across communication policies. Compare against periodic/relevance sharing if those are implemented and validated within the schedule. No-sharing is allowed to fail tasks requiring remote information; also include tasks solvable locally to expose unnecessary overhead.

**Primary outcome:** unique correct results received by the designated destination before the deadline per simulated second. **Report alongside it:** task recall/precision or task-appropriate AP/F1, p50/p95 capture-to-result latency, bytes including control/retry/encoding overhead, drop/timeout rates, queue size and stale information. Energy is secondary and explicitly estimated until measured. Compare Pareto tradeoffs; do not hide failures in a weighted score.

Use pilot seeds disjoint from final evaluation; default to 30 paired final seeds per condition, with the final count fixed after a pilot uncertainty check. Summarize differences with paired confidence intervals and retain unsuccessful runs. Recompute metrics independently from exported events. Freeze test data, settings, policy thresholds and horizon before final runs.

**Necessary ablations:** fixed local inference with adaptive sharing only; adaptive inference with fixed sharing only; full joint policy; scheduler/encoding overhead included; sensitivity to slower inference, higher transfer delay/loss and noisier observations. A heuristic inspired by Where2comm is a heuristic baseline, not an implementation of its learned spatial-feature model.

**Future hardware validation:** when phones become available, use at least low/mid/high devices if accessible; otherwise state the narrower hardware scope. Record SoC/OS/runtime/backend, ambient/start temperature, power source and background load. Proposed protocol: five independent sessions per supported configuration, separate initialization, 30 warm-up inferences, then ten minutes of continuous pipeline execution; report the warm-up and first minute separately and the following nine minutes as the sustained window. Keep the full time series and report thermal drift rather than presuming it stabilized. Verify output accuracy and actual accelerator use. This is a proposed protocol, not measurements already taken.

## Boundaries, gaps and acquisition record

- The reviewed papers span 2017–2024. Recent-work screening also located [ARIA (MobiSys 2025)](https://doi.org/10.1145/3711875.3729161), [Phoenix (TECS 2026)](https://doi.org/10.1145/3793860), and [viNPU (EuroSys 2026)](https://doi.org/10.1145/3767295.3803619). Their accessible abstracts/author pages suggest relevant mobile scheduling, thermal and NPU work. **They are not counted in the 17 method/evaluation readings:** full texts could not be retrieved during this pass. Obtain them before claiming an up-to-date novelty assessment.
- Once-for-All, Edgent, Who2com and DistrEdge were candidate searches, not additional completed readings. OpenReview verification/access and several PDF endpoints prevented full retrieval. Inaccessible candidates were replaced with accessible primary papers.
- No paper speedup has been multiplied with another paper's speedup, used as a simulated experimental result, or treated as a guarantee for a modern phone.
- Classification accuracy, detection AP, prediction-error accuracy, feature bytes, datacenter throughput and phone-camera FPS are different quantities.
- Current data do not establish hazard probability calibration, structural safety, real Android energy or sustained FPS. Confidence is not automatically correctness probability.
- Research and arXiv literature-search skills were consulted. The arXiv utility failed because its shared `science_skills_common` dependency was absent; no custom arXiv scraper was substituted. Reading proceeded from the primary publisher/author PDFs linked above. Current runtime guidance used Context7 and official documentation.
- Primary PDFs were validated by opening/parsing them, with methods and evaluation pages inspected. Copies stay in temporary local research caches rather than being redistributed in the repository. Check each source's license before redistribution. Notes and citations, not downloaded articles, form the deliverable.
- No Android application, model conversion, benchmark reproduction or simulator repair was performed in this literature-review pass. Repository source code is unchanged.

## Recommended reading order

For the user's immediate throughput question: **P02 → P03 → P06 → P09 → P10**. For the swarm contribution: **P14 → P15 → P16**, using **P12/P13/P17** to understand the separate model-partitioning alternative. Read **P11** before describing a simulated label as real danger detection.
