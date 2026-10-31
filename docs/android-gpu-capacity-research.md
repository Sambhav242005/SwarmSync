# Android GPU support, typical RAM and compute capacity

> Scope reviewed 31 October 2026: dated reference research for optional extensions. Dataset/model training, executable language runtimes and Android measurements are not prerequisites for the [current synthetic study](RESEARCH-COMPLETION-PLAN.md). Original evidence dates and source claims below have not been revalidated.

Checked 25 October 2026 for SwarmSync. Research and Context7 workflows were used; runtime claims were checked against official Google documentation, device specifications against manufacturers, and the RAM market figure against the company reporting its own tracker. No Android device was benchmarked.

## Direct answer

**Android apps can run vision inference on the mobile GPU.** A practical simulation baseline is an **8 GB physical-RAM device with an integrated GPU and a named eight-core CPU**, with separate 4/6/8/12 GB test configurations. Those are engineering choices, **not measured averages for all Android phones**. Compute must be tied to a named SoC and a particular model/backend; this review did not establish an Android-wide average GPU TFLOPS or inference FPS.

## GPU support and implementation choices

The current [LiteRT GPU guide](https://developers.google.com/edge/litert/next/gpu) documents GPU execution through `CompiledModel`, Kotlin/C++ support, asynchronous execution and GPU-buffer interoperability. Its Android backend table lists OpenCL and OpenGL. Android also documents [general-purpose GPU compute through Vulkan and OpenGL ES](https://developer.android.com/guide/topics/renderscript/migrate). These are different layers: Android supporting Vulkan does not mean LiteRT's documented Android GPU backend is Vulkan.

Compatibility depends on the device driver, runtime, converted graph and operators. The [Interpreter GPU delegate guide](https://developers.google.com/edge/litert/android/gpu) demonstrates checking GPU availability. The [delegate limitations](https://developers.google.com/edge/litert/performance/gpu) explain that unsupported operations can split execution across CPU/GPU and that synchronization can make the result slower than CPU-only execution. Benchmark the actual converted model and record fallback partitions.

The latter guide describes **FP16/FP32 execution for the Interpreter GPU delegate**. Quantized models can be supported by dequantizing constant tensors and, for quantized input/output, converting values on the CPU for each inference. Consequently, an INT8 model file does not establish native INT8 GPU execution or an INT8 speedup. Compare GPU floating-point options against supported CPU/NPU quantized paths; verify newer accelerator paths separately rather than generalizing legacy-delegate restrictions to every GPU implementation.

**NNAPI is deprecated in Android 15**, according to the [Android NDK guide](https://developer.android.com/ndk/guides/neuralnetworks). SwarmSync's `nnapi` profile label should not be treated as proof that an accelerator is available or as the default plan for a new deployment. Do not infer GPU/NPU use merely because inference succeeds.

### How widespread is graphics support?

Google's [distribution dashboard](https://developer.android.com/about/dashboards) reports 98.24% of its sampled handheld devices at OpenGL ES 3.2 and 7.37% without Vulkan. Its Vulkan observation period is the 28 days ending **24 November 2025**, even though the page was updated in October 2026. This is evidence that graphics capability is widespread in that sample, **not** a percentage of phones compatible with a chosen ML model or LiteRT GPU backend. The dashboard also identifies Play Console Reach and devices as a source of RAM/SoC distributions and CSV exports.

## RAM: market figure versus Android baseline

[Counterpoint's own report](https://counterpointresearch.com/en/insights/Global-Smartphone-Average-DRAM-Hits-Record-8.4GB-in-2025), published 26 February 2026, reports **8.4 GB global average smartphone DRAM in December 2025**, versus 7.4 GB in December 2024, from its Handset Model Sales Tracker. This covers smartphones including iPhones and a period's sales mix. It is **not an Android-only installed-base average**, an India-only statistic, or available application memory. The report's cached body contains an inconsistent 2025 dateline; its publication metadata says 2026. The observation month is stated explicitly here.

For concrete Android configurations, see [manufacturer-sourced device examples](android-device-examples.md): Redmi 14C with 4/6/8 GB; Redmi Note 14 5G India with 6/8 GB; Galaxy A56 India with 8/12 GB; and Galaxy S25 US with 12 GB. These selected examples are not a representative sample for averaging.

Android's [memory-management documentation](https://developer.android.com/topic/performance/memory-management) and the [2024 Mobile GPU 101 presentation hosted by Arm](https://developer.arm.com/cfs-file/__key/communityserver-blogs-components-weblogfiles/00-00-00-20-66/siggraph_5F00_mmg_5F00_2024_5F00_Mobile101.pdf) describe shared CPU/GPU RAM. An 8 GB phone does not have 8 GB RAM plus an independent 8 GB of GPU VRAM. Its operating system, applications, camera buffers, model tensors and GPU allocations share capacity and bandwidth. Software copies can still occur despite shared physical memory. Storage-backed memory extension is not additional physical DRAM.

## Compute capacity: what numbers are defensible?

The four device examples have eight CPU cores but different architectures, clocks and GPU families. Equal core count does not establish equal performance. Their first-party specifications do not provide a comparable absolute GPU FP32 throughput series from which to compute an ecosystem average. Market-share weights would also be necessary for a population mean.

Do not combine CPU GHz, GPU FLOPS, NPU TOPS or benchmark scores into one number. For example, [Exynos 1580's advertised 14.7 TOPS](https://semiconductor.samsung.com/processor/mobile-processor/exynos-1580/) describes its **NPU**, not Xclipse GPU FP32 throughput; the cited claim does not specify precision/sparsity. Peak arithmetic capacity is also different from sustained model execution.

Google's [current LiteRT GPU benchmark table](https://developers.google.com/edge/litert/next/gpu) offers more useful workload-specific examples on a **Samsung Galaxy S24**:

| Model as named in the official table | Reported GPU inference latency |
|---|---:|
| `torchvision_efficientnet_b0` | 3.6 ms |
| `hf_mobilevit_small` | 8.7 ms |
| `torchvision_deeplabv3_mobilenet_v3_large` | 5.7 ms |
| `torchvision_deeplabv3_resnet101` | 35.1 ms |

These are reported model-specific benchmark latencies, not an Android average, our measurements, hazard-model performance or sustained capture-to-alert FPS. Their corresponding model files and benchmark configuration must be pinned before reuse. A simple reciprocal of inference time omits preprocessing, queues, copying, postprocessing and transmission.

## Implications for SwarmSync

- Keep RAM capacities as explicit synthetic scenario levels until a target-device population is selected. Use 8 GB as a working middle configuration, and test lower-memory devices too.
- Replace uncalibrated normalized CPU/GPU/NPU scores with named model/device/backend measurements or explicitly labeled sensitivity assumptions. Include input shape, precision, runtime/driver version, supported operations and concurrency.
- Track physical system RAM, available RAM, process working set, GPU allocations, model weights, activation/workspace peaks and virtual-memory extension separately. Avoid double-counting shared allocations.
- Use a native Android inference component for eventual phone-GPU measurements. The present Next.js simulation and Phaser world do not execute a vision model on a phone GPU merely because the browser renders with GPU acceleration.
- Record cold start, warm and sustained service-time distributions, real backend use, end-to-end delay, task accuracy, memory and thermal state. Supported GPU inference is feasible; higher throughput remains a measurement question.

Only research documents were added. Application code and simulation profiles were not changed.
