# Android capacity examples for SwarmSync

Checked 25 October 2026 against primary manufacturer and platform sources. These are **representative device configurations, not a sales-weighted or installed-base average**. The examples span budget through flagship devices released in 2024–2025. Capacity and availability vary by region; figures describe physical RAM rather than storage-backed memory extension.

## Concrete phones

| Example | Physical RAM options in the cited market | CPU information published by the manufacturer | Integrated GPU |
|---|---|---|---|
| Redmi 14C, Sri Lanka/global-style configurations | 4, 6 or 8 GB LPDDR4X | Helio G81-Ultra; 2 Cortex-A75 + 6 Cortex-A55; overall maximum 2.0 GHz. The cited page does not assign a separate maximum to each cluster. | Mali-G52 MC2 |
| Redmi Note 14 5G, India | 6 or 8 GB LPDDR4X | Dimensity 7025-Ultra; 2 Cortex-A78 at up to 2.5 GHz + 6 Cortex-A55 at up to 2.0 GHz | IMG BXM-8-256 |
| Samsung Galaxy A56 5G, India | 8 or 12 GB | Exynos 1580; 1 Cortex-A720 at 2.9 GHz + 3 Cortex-A720 at 2.6 GHz + 4 Cortex-A520 at 1.95 GHz | Samsung Xclipse 540 |
| Samsung Galaxy S25, US memory configuration / UK published clocks | 12 GB | Snapdragon 8 Elite for Galaxy; Qualcomm Oryon CPU. Samsung lists octa-core and 4.47/3.5 GHz; no cluster-count breakdown is inferred from those frequencies. | Qualcomm Adreno; the cited first-party release does not give a numerical Adreno model |

### Sources for the rows

- **Redmi 14C:** [Xiaomi specifications](https://www.mi.com/lk/product/redmi-14-c/specs/) give the RAM configurations, maximum CPU frequency and GPU. [Xiaomi support FAQ](https://www.mi.co.id/id/support/faq/details/KA-685704/) explicitly identifies two A75 plus six A55 cores. The 16 GB extension claim on the specifications page is based on an 8 GB physical-RAM model plus storage, not 16 GB of physical DRAM.
- **Redmi Note 14 5G:** [Xiaomi India specifications](https://www.mi.com/in/product/redmi-note-14-5g/specs/) give the CPU topology, clocks and GPU. [Xiaomi India's product article](https://www.mi.com/in/blog/smartphones/redmi-note-14-5g/) lists 6 GB/128 GB, 8 GB/128 GB and 8 GB/256 GB configurations. The [global specifications](https://www.mi.com/global/product/redmi-note-14-5g/specs/) additionally list a 12 GB/512 GB model; that is not treated as an Indian configuration here.
- **Galaxy A56 5G:** [Samsung India launch configuration table](https://news.samsung.com/in/samsung-india-launches-galaxy-a56-5g-galaxy-a36-5g-featuring-awesome-intelligence-all-new-design-and-enhanced-durability) lists 8 GB and 12 GB models. The [Samsung processor finder](https://semiconductor.samsung.com/processor/mobile-processor/) gives Exynos 1580's CPU clusters and Xclipse 540 GPU; Samsung's [India introduction](https://news.samsung.com/in/samsung-marks-a-step-forward-with-ai-for-everyone-by-introducing-new-galaxy-a56-5g-galaxy-a36-5g-and-galaxy-a26-5g) identifies the A56's Exynos 1580.
- **Galaxy S25:** [Samsung's US specification sheet, PDF p. 2](https://images.samsung.com/is/content/samsung/assets/us/business/mobile/phones/galaxy-s25/02052025/S25_Series_B2B_Spec_Sheet_HRc.pdf) states 12 GB and Snapdragon 8 Elite for Galaxy. [Samsung UK specifications](https://www.samsung.com/uk/smartphones/galaxy-s/galaxy-s25-navy-256gb-certified-re-newed-sm5s931bdbgeub/) list octa-core, 4.47 GHz/3.5 GHz. [Qualcomm's launch release](https://www.qualcomm.com/news/releases/2025/01/qualcomm-and-samsung-redefine-premium-performance-by-bringing-th) confirms the Oryon CPU, Adreno GPU and Hexagon NPU for the S25 series.

The row labels are engineering examples, not conclusions that a given capacity always identifies a performance tier. A 12 GB version of a cheaper phone does not thereby acquire flagship compute performance. It would also be invalid to average these four deliberately selected examples and call that the average Android phone.

## GPU memory and available application RAM

Android's [memory allocation documentation](https://developer.android.com/topic/performance/memory-management) explicitly says that the CPU and GPU access the same RAM. For these mobile SoCs, total phone RAM must not be presented as a dedicated desktop-style VRAM capacity. The operating system, other processes, camera buffers, model weights, intermediate tensors and GPU resources compete for memory. A phone with 8 GB physical RAM therefore does **not** grant one inference application 8 GB of usable GPU memory.

The [Xiaomi memory-extension FAQ](https://www.mi.com/global/support/faq/details/KA-524533/) describes extension as using part of ROM/internal storage as virtual RAM. Treat physical DRAM, available RAM, process memory, GPU allocations and virtual-memory extension as different fields. Do not count extension as extra fast inference capacity.

## Why no average GPU TFLOPS is assigned

No comparable, absolute FP32 GPU-throughput figures were established in the cited first-party specifications for these four configurations. They establish GPU identity and CPU characteristics, not a measured inference rate. Clock frequency and core count cannot by themselves be converted into reliable model FPS. Samsung's [processor FAQ](https://semiconductor.samsung.com/processor/mobile-processor/) also explains that work per cycle and scheduling affect performance, so frequency alone is not proportional to performance.

Samsung does advertise **up to 14.7 TOPS** on the [Exynos 1580 page](https://semiconductor.samsung.com/processor/mobile-processor/exynos-1580/), but explicitly labels this as the **NPU**. The cited claim does not state numerical precision or dense-versus-sparse accounting. It must not be quoted as 14.7 GPU TFLOPS, added to CPU capacity, converted directly to detector FPS, or used as an ecosystem average.

For SwarmSync, retain the existing 4/6/8/12 GB capacities only as declared synthetic test levels until mapped to a sampled target population. Replace invented normalized compute scores with versioned measurements or explicitly assumed ranges for a named model, input resolution, precision, runtime, backend and concurrency. Report warm and sustained inference latency/FPS, task accuracy, peak resident/GPU memory, temperature behavior and energy provenance. This is a proposed measurement requirement, not measurements already taken.

No application or simulator code was changed by this research pass.
