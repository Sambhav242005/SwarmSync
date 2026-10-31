# Collaborative inference and perception: six primary-paper reading notes

> Scope reviewed 31 October 2026: dated reference research for optional extensions. Dataset/model training, executable language runtimes and Android measurements are not prerequisites for the [current synthetic study](RESEARCH-COMPLETION-PLAN.md). Original evidence dates and source claims below have not been revalidated.

Reviewed 2026-10-25 for SwarmSync. These are method-and-evaluation readings of six accessible full-text papers, not reproductions of their experiments or claims of line-by-line coverage. Page numbers below are physical PDF pages, starting at 1. The notes distinguish reported results from proposed applications to SwarmSync. Publisher/author PDFs were retrieved to a temporary cache; the project contains these original notes rather than redistributed paper copies.

## 1. Neurosurgeon: Collaborative Intelligence Between the Cloud and Mobile Edge

**Yiping Kang et al., ASPLOS 2017.** [Author full text](https://ypkang.github.io/downloads/kang17neurosurgeon.pdf), DOI: [10.1145/3037697.3037698](https://doi.org/10.1145/3037697.3037698).

**Read:** Sections 3.1, 4–5 and 6, especially PDF pp. 3–4 and 7–12; Algorithm 1 and Figures 11–16.

**Method:** Build hardware-specific regression models for layer latency/power, then choose a single device/cloud partition point using layer outputs, current uplink bandwidth, and server load. Evaluate local-only and cloud-only endpoints as legitimate choices.

**Evidence:** Eight DNN applications; Jetson TK1/Tegra K1 CPU/GPU client and Tesla K40 server; Wi-Fi/LTE/3G conditions. Across the reported configurations, end-to-end latency improves by a geometric mean of 3.1× against cloud-only execution. The separately reported throughput improvement concerns the **datacenter**, not phone-camera FPS.

**Limits and transfer:** This is cloud-assisted model partitioning, not disconnected peer knowledge exchange, and its 2017 hardware does not calibrate present Android devices. Transfer the principle of comparing compute saved against activation transfer and queueing costs; do not assume offloading is automatically beneficial. [Source](https://ypkang.github.io/downloads/kang17neurosurgeon.pdf)

## 2. DeepThings: Distributed Adaptive Deep Learning Inference on Resource-Constrained IoT Edge Clusters

**Zhuoran Zhao, Kamyar Mirzazad Barijough, Andreas Gerstlauer; CODES+ISSS / ESWEEK–TCAD, 2018.** [Lab full text](https://slam.ece.utexas.edu/pubs/codes18.DeepThings.pdf).

**Read:** Section IV's fused tile partitioning, work-stealing and reuse scheduling; Section V evaluation and Section VI limitations, PDF pp. 4–11.

**Method:** Fuse early CNN layers into independently executable spatial tiles; idle devices steal work; schedule tiles to reuse overlapping intermediate data. A gateway tracks busy nodes, assembles outputs, and runs remaining layers.

**Evidence:** Up to six Raspberry Pi 3 workers plus one Pi gateway, each worker restricted to one CPU core, Darknet/NNPACK and YOLOv2 over WLAN. Crucially, reported experiments concern the **first 16 layers**, not complete detector execution. For those stages with six devices, the reuse-aware variant reports 6.8 s average single-frame latency and 3.5× speedup; multi-source results separately report FPS.

**Limits and transfer:** Homogeneous low-end hardware and a gateway; energy optimization and larger heterogeneous clusters are future work. Transfer bounded work queues, load balancing, and separate latency/throughput experiments. This does not demonstrate that splitting a modern mobile detector beats independent local inference. [Source](https://slam.ece.utexas.edu/pubs/codes18.DeepThings.pdf)

## 3. When2com: Multi-Agent Perception via Communication Graph Grouping

**Yen-Cheng Liu, Junjiao Tian, Nathaniel Glaser, Zsolt Kira; CVPR 2020.** [CVF full text](https://openaccess.thecvf.com/content_CVPR_2020/papers/Liu_When2com_Multi-Agent_Perception_via_Communication_Graph_Grouping_CVPR_2020_paper.pdf).

**Read:** Sections 3–4, PDF pp. 3–8; Tables 1–2 and handshake ablations.

**Method:** Broadcast compact queries, retain larger local keys, learn matching/self-attention, and prune weak connections. Train centrally on perception labels but restrict each agent to its own observations and exchanged features during inference.

**Evidence:** AirSim-MAP semantic segmentation and modified ModelNet40 multi-view recognition, with a common ResNet18 backbone for comparisons. In the partial-support segmentation condition, Table 1 reports average mIoU 40.82 at 0.55 MB/frame, versus TarMac's 40.59 at 2.0 MB/frame. These are feature-message volumes, not measured transport throughput.

**Limits and transfer:** Some conditions deliberately guarantee a clean matching view; the partial-support condition removes that assumption. No Android sustained-FPS or battery benchmark is established. Transfer an explicit no-communication option, query/control overhead accounting, and noisy/irrelevant supporter tests. A heuristic communication gate inspired by this work is not a reproduction of its learned model. [Source](https://openaccess.thecvf.com/content_CVPR_2020/papers/Liu_When2com_Multi-Agent_Perception_via_Communication_Graph_Grouping_CVPR_2020_paper.pdf)

## 4. Where2comm: Communication-Efficient Collaborative Perception via Spatial Confidence Maps

**Yue Hu, Shaoheng Fang, Zixing Lei, Yiqi Zhong, Siheng Chen; NeurIPS 2022.** [Proceedings full text](https://proceedings.neurips.cc/paper_files/paper/2022/file/1f5c5cd01b864d53cc5fa0a3472e152e-Paper-Conference.pdf).

**Read:** Sections 3–5, especially message selection, graph construction, fusion, datasets and quantitative results; PDF pp. 3–9.

**Method:** Use spatial detection confidence and complementary request maps to send selected feature locations and indices; fuse aligned features with confidence-aware attention. Adapt message sparsity to the communication budget.

**Evidence:** Camera/LiDAR 3D detection on OPV2V, V2X-Sim, DAIR-V2X and CoPerception-UAVs, evaluated with AP at IoU 0.5/0.7 and message bytes. Figure 3's caption reports approximately 5,000× lower communication volume than When2com while outperforming it on CoPerception-UAVs. This is a specific dataset/comparator tradeoff, not a general speedup.

**Limits and transfer:** Feature alignment uses a common bird's-eye-view coordinate system; localization noise is explicitly evaluated. Message-volume gains do not establish transport latency, energy or Android FPS. Transfer selective information sharing and accuracy-versus-volume curves. SwarmSync's structured facts require their own utility and merge model rather than directly inheriting these numerical results. [Source](https://proceedings.neurips.cc/paper_files/paper/2022/file/1f5c5cd01b864d53cc5fa0a3472e152e-Paper-Conference.pdf)

## 5. How2comm: Communication-Efficient and Collaboration-Pragmatic Multi-Agent Perception

**Dingkang Yang et al., NeurIPS 2023.** [Proceedings full text](https://proceedings.neurips.cc/paper_files/paper/2023/file/4f31327e046913c7238d5b671f5d820e-Paper-Conference.pdf).

**Read:** Sections 3–4, PDF pp. 3–9; Table 1, delay/pose experiments and component ablations.

**Method:** Combine spatial/channel feature selection, mutual-information supervision, feature-flow prediction for delayed messages, and a spatiotemporal fusion transformer.

**Evidence:** LiDAR-based detection on DAIR-V2X, V2XSet and OPV2V. Default evaluation introduces 100 ms transmission delay, 0.2 m localization standard deviation and 0.2° heading standard deviation, with approximately 1 MB message-volume constraint. Table 1 reports DAIR-V2X AP@0.7 of 47.18 for How2comm versus 43.53 for Where2comm under that evaluation. Delay sensitivity spans 0–400 ms.

**Limits and transfer:** Vehicle/infrastructure feature fusion with pose metadata and historical sensor frames; this is not heterogeneous-phone inference throughput evidence. Relative percentage improvements must not be confused with AP percentage-point differences. Transfer timestamps, message age, stale-information tests, and latency-aware fusion into the simulator. The additional neural processing also needs compute/memory accounting before claiming a net systems benefit. [Source](https://proceedings.neurips.cc/paper_files/paper/2023/file/4f31327e046913c7238d5b671f5d820e-Paper-Conference.pdf)

## 6. DISCO: Distributed Inference With Sparse Communications

**Minghai Qin, Chao Sun, Jaco Hofmann, Dejan Vucinic; WACV 2024.** [CVF full text](https://openaccess.thecvf.com/content/WACV2024/papers/Qin_DISCO_Distributed_Inference_With_Sparse_Communications_WACV_2024_paper.pdf).

**Read:** Sections III–V, PDF pp. 3–7; feature/weight equivalence, training procedure, Tables I–IV and latency assumptions.

**Method:** Within-layer model parallelism transmits selected channels between nodes. Map omitted cross-node features to structured weight pruning, then iteratively prune and fine-tune the model to preserve accuracy.

**Evidence:** Evaluates trained models across classification, detection, segmentation and super-resolution. Table III gives SSD300/COCO2017 mAP 26.1 at 90% communication sparsity versus dense-model mAP 26.0. This is a model/communication tradeoff. Section V's latency comparison is **calculated** using assumed 37.5 MB/s bandwidth and 3.75 GOP/s computation, not measured on Android phones.

**Limits and transfer:** Requires specialized retraining, distributed feature execution, and assumptions about compute/communication costs. Feature sparsity is not identical to network byte savings after encoding and metadata. Transfer the need to optimize communication and model structure jointly; treat its latency model as an assumption to test, not phone calibration. [Source](https://openaccess.thecvf.com/content/WACV2024/papers/Qin_DISCO_Distributed_Inference_With_Sparse_Communications_WACV_2024_paper.pdf)

## Synthesis for SwarmSync — interpretation, not paper-reported results

The papers address different decisions and cannot be combined into a single speedup estimate:

| Decision | Supporting papers | What SwarmSync must represent |
|---|---|---|
| Where to execute one model | Neurosurgeon; DeepThings; DISCO | Real or explicitly assumed service times, activation/tile bytes, synchronization, queueing and failure costs |
| Which observations/features to exchange | When2com; Where2comm | Independent local observations, knowledge access restricted by delivery, control overhead, task-grounded usefulness |
| How to use delayed information | How2comm | Capture and arrival timestamps, message age, expiry rules, fusion behavior under staleness |

For a one-month simulation study, keep optimized local vision as the execution baseline and focus the proposed contribution on whether/what/when to share resulting observations. Compare model partitioning only in a separate experiment with its actual data dependencies and transfer costs. This choice is a feasibility judgment, not a novelty claim.

Define **sustained inference throughput** as completed inferences divided by an explicitly stated steady-state observation window. Also report capture-to-result latency distribution, deadline misses, queue length, frame drops, task correctness, useful delivered observations per second, and communication volume. Offline accuracy, fewer feature bytes, faster simulated clock advancement and lower single-frame compute time are different measurements.

The current implementation cannot evaluate these mechanisms faithfully while inference duration does not delay execution, network delay/loss/bandwidth do not govern delivery, knowledge is globally shared, and completion follows state-machine position. These need correction before interpreting a policy comparison.

### Claims this reading does not support

- A given Android device will reach a specified FPS, power draw, or thermal steady state.
- A cluster of six devices will provide six times the throughput of one device.
- Intermediate-feature splitting is always better than independent inference plus compact detections.
- Lower communication volume necessarily means lower end-to-end latency or energy.
- A learned sensor confidence score is calibrated hazard probability or structural-safety evidence.
- The present SwarmSync utility formula is novel, or reproduces any of the learned communication methods above.

### Reading and source limitations

Edgent, Who2com and DistrEdge were searched as candidates but are **not counted as reviewed papers here**: their method-and-evaluation fulltexts were not all successfully retrieved during this pass. When2com, How2comm and DISCO provide accessible primary fulltexts and more directly expose communication and timing assumptions. The six reviewed papers are a targeted foundation, not an exhaustive literature review or a claim to cover the latest work through October 2026.
