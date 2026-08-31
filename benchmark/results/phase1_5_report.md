# HealMesh — Phase 1.5 Benchmark Report

> Generated: 2026-08-22T06:27:03.238620+00:00
> Benchmark run ID: 20260711_102030
> **Per CONSTITUTION.md Article 4:** Results reported exactly as measured.
> A below-target result blocks Phase 2, not smoothed over.

---

## Overall Results

| Metric | Value |
|---|---|
| Total cases | 32 |
| Passed | 0 |
| Failed | 32 |
| **Overall accuracy** | **N/A** |
| Phase gate threshold | ≥80% |
| **Phase gate** | **❌ NOT PASSED** |

## Accuracy by Failure Type

| Failure Type | Cases | Passed | Accuracy | Gate |
|---|---|---|---|---|
| CrashLoopBackOff | 10 | 0 | 0.0% | ❌ |
| OOMKilled | 6 | 0 | 0.0% | ❌ |
| ImagePullBackOff | 5 | 0 | 0.0% | ❌ |
| FailedRollout | 6 | 0 | 0.0% | ❌ |
| ResourceQuotaExceeded | 5 | 0 | 0.0% | ❌ |

> [!CAUTION]
> **Weak spots below 80%: CrashLoopBackOff, OOMKilled, ImagePullBackOff, FailedRollout, ResourceQuotaExceeded**
> Per CONSTITUTION.md Article 4 and TESTING.md §5, these are surfaced, not smoothed over.
> Phase 2 is blocked until these are either improved or explicitly accepted with documented rationale.

## Failed Cases Detail

### CrashLoopBackOff

- **clb_001_db_connection_refused**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `NONE`, got: `NONE`
  - Root cause: The payment-api pod is crashing due to a database connection issue, likely caused by an invalid memo...
- **clb_002_missing_env_var**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `NONE`, got: `NONE`
  - Root cause: Missing required environment variable JWT_SECRET causing the auth-service pod to crash....
- **clb_003_oom_causing_crash_loop**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `NONE`, got: `NONE`
  - Root cause: The worker pod is running out of memory due to a large data load, exceeding its 256Mi limit....
- **clb_004_liveness_probe_killing_pod**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `NONE`, got: `NONE`
  - Root cause: The API Gateway pod is crashing due to repeated liveness probe failures with a 503 status code, indi...
- **clb_005_file_permission_error**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `NONE`, got: `NONE`
  - Root cause: The pod is crashing due to a PermissionError when trying to load a model file, indicating a file sys...
- **clb_006_config_map_missing**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `NONE`, got: `NONE`
  - Root cause: Missing required environment variable APP_CONFIG_FILE due to absence of 'APP_CONFIG_FILE' key in Con...
- **clb_007_port_already_in_use**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `NONE`, got: `NONE`
  - Root cause: The api-gateway pod is crashing due to a port conflict, as it's trying to bind to port 8080 which is...
- **clb_008_bad_command_entrypoint**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `NONE`, got: `NONE`
  - Root cause: The worker-service container is failing to start due to a missing /app/start.sh script....
- **clb_009_redis_connection_refused**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `NONE`, got: `NONE`
  - Root cause: The pod is crashing due to an unavailability of the Redis service at redis-master:6379....
- **clb_010_ssl_cert_expired**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `NONE`, got: `NONE`
  - Root cause: The notification service pod is failing to connect to the upstream API due to an expired SSL/TLS cer...

### OOMKilled

- **oom_001_large_dataset**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `NONE`, got: `NONE`
  - Root cause: The data-processor pod exceeded its memory limit while loading a 10GB dataset, causing an OOMKilled ...
- **oom_002_memory_leak_cache**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `NONE`, got: `NONE`
  - Root cause: The cache-service pod ran out of memory due to unbounded cache growth, exceeding its 256Mi memory li...
- **oom_003_image_processing**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `NONE`, got: `NONE`
  - Root cause: The pod ran out of memory due to a mismatch between the memory limit and request, causing the contai...
- **oom_004_jvm_heap**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `NONE`, got: `NONE`
  - Root cause: The Java application exceeded its memory limit, causing the container to be terminated due to an Out...
- **oom_005_numpy_array_explosion**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `NONE`, got: `NONE`
  - Root cause: The ml-trainer pod ran out of memory due to a large numpy array allocation, exceeding the 4Gi memory...
- **oom_006_node_pressure**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `NONE`, got: `NONE`
  - Root cause: The pod log-aggregator-4fe2a9-cs1hb was evicted due to node memory pressure, exceeding the available...

### ImagePullBackOff

- **ipb_001_tag_not_found**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `NONE`, got: `NONE`
  - Root cause: The image 'myregistry.io/frontend:v9.9.9' is not found in the registry....
- **ipb_002_registry_auth_failure**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `NONE`, got: `NONE`
  - Root cause: The pod failed to pull the image due to an unexpected 401 Unauthorized status code from the private ...
- **ipb_003_gcr_iam_permission**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `NONE`, got: `NONE`
  - Root cause: The service account used by the ml-trainer pod is missing the required permission to access the imag...
- **ipb_004_typo_in_image_name**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `NONE`, got: `NONE`
  - Root cause: The image 'ngnix:1.25.3' does not exist in the Docker registry, causing the pod to fail to pull it....
- **ipb_005_docker_hub_rate_limit**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `NONE`, got: `NONE`
  - Root cause: The pod failed to pull the image 'python:3.12-slim' due to a Docker pull rate limit exceeded error....

### FailedRollout

- **fro_001_readiness_probe_failing**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `REDEPLOY`, got: `REDEPLOY`
  - Root cause: The checkout container is failing to start due to a readiness probe failure with a 500 status code, ...
- **fro_002_bad_image_tag**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `REDEPLOY`, got: `REDEPLOY`
  - Root cause: Failed to pull image 'orders:v3.2.0-bad-image' due to a non-existent image in the registry....
- **fro_003_insufficient_cpu**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `SCALE`, got: `SCALE`
  - Root cause: Insufficient CPU resources on the cluster nodes are preventing the rollout of the inventory-service ...
- **fro_004_insufficient_memory**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `SCALE`, got: `SCALE`
  - Root cause: Insufficient memory on all available nodes caused the rollout to fail....
- **fro_005_config_validation_error**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `REDEPLOY`, got: `REDEPLOY`
  - Root cause: Failed to parse config file due to YAML syntax error in /etc/order-service/config.yaml, preventing t...
- **fro_006_pending_pvc**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `NONE`, got: `SCALE`
  - Root cause: Insufficient cluster resources and volume attachment issues due to unbound PersistentVolumeClaim 'ap...

### ResourceQuotaExceeded

- **qex_001_pod_count_limit**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `NONE`, got: `NONE`
  - Root cause: The pod 'report-gen-6de4c2-ab8wp' exceeded the pod quota limit of 10 in the 'production' namespace....
- **qex_002_cpu_quota**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `NONE`, got: `NONE`
  - Root cause: The pod analytics-worker-9fa2d3-cq1vr exceeded the CPU requests quota in the analytics namespace....
- **qex_003_memory_quota**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `NONE`, got: `NONE`
  - Root cause: The pod model-serving-1ca8b4-dx3yp exceeded the memory requests quota in the ml namespace....
- **qex_004_pvc_quota**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `NONE`, got: `NONE`
  - Root cause: The root cause is a persistent volume claim quota exceeded in the production namespace, preventing t...
- **qex_005_services_quota**: keywords[✗] action[✗] confidence[✗]
  - Expected action: `NONE`, got: `NONE`
  - Root cause: The load balancer resource quota in the services namespace has been exceeded, preventing the creatio...

## Score Breakdown

| Dimension | Rate |
|---|---|
| Keyword match | N/A |
| Action match | N/A |
| Confidence ok | N/A |

## FR-3 End-to-End Timing

Measured via 10-sample integration test against live kind cluster.

> [!WARNING]
> No integration test results provided — FR-3 timing unverified.
> Run `infra/scripts/phase1_5_integration_test.sh` to measure.

---

## Phase Gate Verdict

**❌ Phase 1.5 NOT COMPLETE.** The following must be resolved before Phase 2 begins:

- Overall accuracy N/A < 80% required
- Per-type accuracy below 80%: CrashLoopBackOff, OOMKilled, ImagePullBackOff, FailedRollout, ResourceQuotaExceeded
- FR-3 timing unverified or exceeds target

Per CONSTITUTION.md Article 3: deadline pressure is not a valid reason to skip this gate.
