# Dataset options for SwarmSync comparisons

> Scope reviewed 31 October 2026: dated reference research for optional extensions. Dataset/model training, executable language runtimes and Android measurements are not prerequisites for the [current synthetic study](RESEARCH-COMPLETION-PLAN.md). Original evidence dates and source claims below have not been revalidated.

Checked 25 October 2026 against dataset creators, official repositories, institutional pages and original data articles. No full dataset was downloaded, no account was created, and no click-through terms were accepted. Counts below describe the cited release/report, not a newly audited local manifest.

## Recommendation: maintain separate ground/social-photo and overhead tracks

For a first disaster-photo study, use **CrisisMMD v2 damage severity**: a small, clearly defined three-class image task with released split annotations. Treat it as social-media imagery, which may contain mixed viewpoints, rather than claiming every image was captured by a responder's phone. Use its associated text only in a separate multimodal experiment and check image/text agreement. **MEDIC** is a useful larger follow-up with explicit release licensing, but includes CrisisMMD and therefore cannot be an independent external test set without a source-level overlap audit.

For overhead building assessment, use **xBD/xView2** as a separate pre/post-satellite-image task. Add **RescueNet** only as a separate UAV segmentation track if drone imagery is part of the research question. For an explicitly smartphone-oriented object-detection benchmark, **RDD2022** is useful, but its task is pavement distress, not earthquake building safety. **FloodNet** is an alternative UAV track with a different target and license.

Keep each dataset's label semantics, task metrics and results separate. A shared event/observation envelope can transport outputs across the simulator; it does not make an image-level severe-damage label equivalent to a building polygon grade or road-blockage mask. Do not pool these into one accuracy number.

## 1. CrisisMMD v2 — image severity and optional associated text

**Primary source:** [QCRI dataset page](https://crisisnlp.qcri.org/crisismmd), [QCRI terms](https://crisisnlp.qcri.org/terms-of-use.html).

The v2 page reports **18,082 images and 16,058 texts**, but only **3,526 image damage-severity examples**: 475 little/no damage, 839 mild and 2,212 severe. Other annotations cover informativeness and humanitarian categories. Data span seven 2017 disasters, including Mexico and Iraq–Iran earthquakes. A ~1.8 GB image/text archive and split annotations are linked publicly. The agreed-label multimodal split is a different, filtered population; do not mix its counts with the full release. Severity is image-labeled; paired text may describe different content.

Use macro-F1, per-class recall and a confusion matrix; severe-class prevalence makes overall accuracy alone misleading. Preserve original splits for comparability, add duplicate/event-held-out evaluation separately, and never split near-duplicate photos across train/test. The visible terms page is not a complete named permissive data license; inspect archive terms and underlying source conditions before redistribution. Image labels describe visible disaster damage, not verified structural safety.

**Annotation archive verified during this pass:** the creator-linked [all-label split ZIP](https://crisisnlp.qcri.org/data/crisismmd/crisismmd_datasplit_all.zip) was downloaded in memory and its TSV records counted. The severity files contain **2,468 train / 529 dev / 529 test** records, totaling 3,526. Their combined class counts match the page: 475 little/no, 839 mild, 2,212 severe. ZIP size: 3,072,270 bytes; SHA-256: `daee55291203af7ed6fd7f5bbb51153d5ec5b9c6662b36e3e289d9ce4a375a53`. No image archive was downloaded and no tweet text was retained in project files. This verifies annotation records, not successful image acquisition or duplicate-free splits.

## 2. MEDIC v1 — larger disaster-image classification extension

**Primary source:** [QCRI MEDIC page](https://crisisnlp.qcri.org/medic/), [authors' repository](https://github.com/firojalam/medic/).

The release page reports **71,198 images** aggregated from CrisisMMD, AIDR and Damage Multimodal Dataset sources. It supplies train/dev/test TSV files with IDs, source/event information, image paths and task labels for disaster type, informativeness, humanitarian content and damage severity. The archive is listed as ~11 GB. The total image count is not the number of valid severity labels; count usable records per task after acquisition rather than assuming all tasks are fully labeled.

The page names **CC BY-NC-SA 4.0** and includes release license/terms files. Its outbound Creative Commons link text/URL is inconsistent, so retain and inspect the actual archive's named license text. Prefer this larger release only after a small baseline works. Because it explicitly includes CrisisMMD, test on a source/event-disjoint subset or deduplicate across both releases; calling MEDIC an independent CrisisMMD generalization benchmark would be invalid without that check.

## 3. xBD / xView2 — satellite pre/post building-damage assessment

**Primary sources:** [official data portal](https://xview2.org/dataset), [CMU SEI project](https://www.sei.cmu.edu/projects/xview-2-challenge/), [authors' full-release report](https://arxiv.org/abs/1911.09296), [official baseline](https://github.com/DIUx-xView/xView2_baseline).

The November 2019 authors' report states **850,736 building annotations across 45,362 km²**. These are building annotations, not image count; they supersede the earlier preliminary paper's projected counts. The task uses aligned pre/post-disaster satellite imagery, building polygons and four ordinal grades: no damage, minor, major and destroyed. The official baseline documents paired inputs and labeled raster outputs. It also documents registration/login for downloads; the current portal returned only a JavaScript shell during this read-only pass.

Keep pre/post pairs, spatial neighbors and related disaster scenes together when defining additional splits. Evaluate localization and damage classification separately with the official challenge protocol where available. CMU confirms Creative Commons distribution, but the precise current dataset license and accessible split manifests were not visible here; verify those at acquisition. Baseline code licensing does not determine imagery licensing. This dataset does not validate phone-camera inference.

## 4. RescueNet — UAV damage and road-clearance segmentation

**Primary sources:** [authors' repository](https://github.com/BinaLab/RescueNet-A-High-Resolution-Post-Disaster-UAV-Dataset-for-Semantic-Segmentation), [original data article](https://www.nature.com/articles/s41597-023-02799-4), [publisher data collection](https://springernature.figshare.com/collections/RescueNet_A_High_Resolution_UAV_Semantic_Segmentation_Benchmark_Dataset_for_Natural_Disaster_Damage_Assessment/6647354/1).

The official repository reports **4,494 DJI Mavic Pro images after Hurricane Michael**. Its listed mask ontology has ten foreground classes plus background: water, four building-damage levels, clear/blocked roads, vehicle, tree and pool. The data article gives **3,595 train / 449 validation / 450 test** images. Use the published splits and record them; additional spatial/flight-group holdouts would be a separate generalization experiment. Report per-class IoU and recall for blocked roads and heavily damaged buildings.

The repository explicitly labels the **dataset CC BY-NC-ND 4.0**, while its code license is MIT. The publisher collection was inaccessible in this pass; confirm the downloaded release terms. Do not assume the code license permits redistribution of modified image crops/masks. UAV scenes are not ground-level photos, and hurricane damage is not earthquake coverage. Resizing/tiling requires output stitching and small-object-quality checks.

## 5. RDD2022 — road-damage detection with phone-oriented subsets

**Primary sources:** [authors' official repository](https://github.com/sekilab/RoadDamageDetector), [authors' Figshare release](https://figshare.com/articles/dataset/RDD2022_-_The_multi-national_Road_Damage_Dataset_released_through_CRDDC_2022/21431547), [original data article](https://doi.org/10.1002/gdj3.260).

The original release reports **47,420 road images across six countries** and more than 55,000 damage instances. Challenge classes are longitudinal cracks (D00), transverse cracks (D10), alligator cracks (D20) and potholes (D40), with Pascal VOC XML annotations. Data include smartphone, other camera and drone sources; select and document the phone-oriented country/subset rather than labeling every record phone-captured. Training annotations are public; the official repository states that challenge test data contain images only.

For reproducible local scoring, derive a fixed grouped validation/test partition from public labeled training records and label it as a custom split. Keep route/capture-sequence neighbors together. Official Figshare metadata lists **CC BY 4.0**; some third-party mirrors claim a different license, so pin the original release and inspect its files. The repository's MIT code license is separate. Road cracks are useful for throughput/robustness comparisons but do not establish bridge or building safety.

## Optional UAV alternative: FloodNet

[The authors' supervised-release repository](https://github.com/BinaLab/FloodNet-Supervised_v1.0) reports **2,343 Hurricane Harvey UAV images**, approximately 60/20/20 train/validation/test. Labels distinguish flooded/non-flooded buildings and roads, water, tree, vehicle, pool, grass and background. It names **Community Data License Agreement—Permissive 1.0** and links the download. This is a flood segmentation task; use it instead of RescueNet if flooded-road detection is the objective. It is not an additional building-severity label source.

## Benchmark and simulator requirements — proposed design

- Download from creator-linked locations; store the release ID, actual license, source URLs, archive/file hashes, item counts and frozen split manifest. Hashes are necessary because a title or mirror alone does not identify a release.
- Use training data only for fitting and validation data only for thresholds/model selection. Final test labels stay outside model prompts, scheduling policies and knowledge messages.
- Report model quality on untouched held-out images first. Compare floating-point versus quantized models at fixed resolution, then sweep resolution as a separate factor. For masks or boxes, specify annotation transformation and reconstruction rules.
- Evaluate language reasoning once with oracle structured observations and once with actual vision outputs. This separates reasoning/communication errors from perception errors; neither oracle labels nor evaluation answers should leak into a deployed agent's context.
- A static image corpus does not provide real multi-device trajectories, synchronized peer views, links or wireless losses. Generate reproducible task-arrival/device-assignment/network traces and label them synthetic. Randomly assigning unrelated photos to agents does not demonstrate multi-view fusion of the same scene.
- Transport records should carry source dataset/release, sample ID, capture/modality metadata where available, task type, predicted label/geometry, confidence/provenance, timestamp and source device. Keep ground truth in an evaluator-only store.
- Use a clearly stated task at the coordinator: for example, record each unique severity prediction by a deadline, or identify blocked-road regions from delivered masks. Score against task-specific annotations and count false alarms, misses, duplicates, stale outputs and incomplete/truncated responses.
- Keep image-size/patch-count limits separate from language context-token limits. CNN detector and segmenter outputs are bounded by input shape/head/postprocessing configuration, not a text context window.

No simulator or application source was changed, and this pass does not claim that data access or a trained model pipeline has been completed.
