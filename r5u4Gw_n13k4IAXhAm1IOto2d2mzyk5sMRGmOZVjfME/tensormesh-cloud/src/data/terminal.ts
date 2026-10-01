/**
 * TENSOR MESH — terminal payloads, node tables and deploy log streams
 */

export interface NodeRow {
  hostname: string
  gpu: string
  gpus: string
  vram: string
  ecc: string
  pcie: string
  nvlink: string
  temp: string
  util: string
  state: 'READY' | 'DRAINING' | 'RESERVED'
}

export const SAMPLE_NODES: NodeRow[] = [
  {
    hostname: 'tm-zrh-h100-A01-node-01',
    gpu: 'H100-SXM5-80G',
    gpus: '8/8',
    vram: '640 GiB',
    ecc: 'CLEAN',
    pcie: 'GEN5 x16 · 32.0GT/s',
    nvlink: '4.2 TB/s',
    temp: '61°C',
    util: '0%',
    state: 'READY',
  },
  {
    hostname: 'tm-zrh-h100-A01-node-02',
    gpu: 'H100-SXM5-80G',
    gpus: '8/8',
    vram: '640 GiB',
    ecc: 'CLEAN',
    pcie: 'GEN5 x16 · 32.0GT/s',
    nvlink: '4.2 TB/s',
    temp: '58°C',
    util: '0%',
    state: 'READY',
  },
  {
    hostname: 'tm-zrh-h100-A01-node-03',
    gpu: 'H100-SXM5-80G',
    gpus: '8/8',
    vram: '640 GiB',
    ecc: 'CLEAN',
    pcie: 'GEN5 x16 · 32.0GT/s',
    nvlink: '4.2 TB/s',
    temp: '63°C',
    util: '0%',
    state: 'READY',
  },
  {
    hostname: 'tm-zrh-h100-A01-node-04',
    gpu: 'H100-SXM5-80G',
    gpus: '8/8',
    vram: '640 GiB',
    ecc: 'CLEAN',
    pcie: 'GEN5 x16 · 32.0GT/s',
    nvlink: '4.2 TB/s',
    temp: '60°C',
    util: '0%',
    state: 'READY',
  },
  {
    hostname: 'tm-zrh-h100-A01-node-05',
    gpu: 'H100-SXM5-80G',
    gpus: '8/8',
    vram: '640 GiB',
    ecc: 'CLEAN',
    pcie: 'GEN5 x16 · 32.0GT/s',
    nvlink: '4.2 TB/s',
    temp: '59°C',
    util: '0%',
    state: 'READY',
  },
  {
    hostname: 'tm-zrh-h100-A01-node-06',
    gpu: 'H100-SXM5-80G',
    gpus: '8/8',
    vram: '640 GiB',
    ecc: 'CLEAN',
    pcie: 'GEN5 x16 · 32.0GT/s',
    nvlink: '4.2 TB/s',
    temp: '62°C',
    util: '0%',
    state: 'READY',
  },
  {
    hostname: 'tm-zrh-h100-A01-node-07',
    gpu: 'H100-SXM5-80G',
    gpus: '8/8',
    vram: '640 GiB',
    ecc: 'CLEAN',
    pcie: 'GEN5 x16 · 32.0GT/s',
    nvlink: '4.2 TB/s',
    temp: '64°C',
    util: '0%',
    state: 'READY',
  },
  {
    hostname: 'tm-zrh-h100-A01-node-08',
    gpu: 'H100-SXM5-80G',
    gpus: '8/8',
    vram: '640 GiB',
    ecc: 'CLEAN',
    pcie: 'GEN5 x16 · 32.0GT/s',
    nvlink: '4.2 TB/s',
    temp: '61°C',
    util: '0%',
    state: 'READY',
  },
]

export interface DeployLogLine {
  /** milliseconds after the command is issued */
  at: number
  text: string
  tone?: 'muted' | 'good' | 'amber' | 'rail'
}

export const DEPLOY_LOG: DeployLogLine[] = [
  { at: 120, text: '→ resolving allocation cl-zurich-01 (eu-central-1) ...', tone: 'muted' },
  { at: 420, text: '✔ allocation lease acquired · 64 × H100 SXM5 dedicated', tone: 'good' },
  { at: 760, text: '  subnet 10.240.211.0/16 bound to private VPC vpc-zrh-tm-4471', tone: 'muted' },
  { at: 1080, text: '→ pulling registry.tensormesh.cloud/cuda-12.6-pytorch-2.4:latest', tone: 'muted' },
  { at: 1560, text: '  [██████████████████████████] 100% · 9.41 GiB · 3.2 s', tone: 'rail' },
  { at: 1900, text: '→ writing NCCL topology file (nvml_topology.xml)', tone: 'muted' },
  { at: 2260, text: '✔ InfiniBand NDR fabric mapped · 8 rails · SHARPv3 enabled', tone: 'good' },
  { at: 2600, text: '✔ GPUDirect RDMA verification passed on 8/8 nodes', tone: 'good' },
  { at: 2960, text: '→ starting kubelet + device-plugin-nvidia ...', tone: 'muted' },
  { at: 3400, text: '✔ cluster ready · 512 GPUs schedulable · cold-start 41.8 s', tone: 'good' },
  { at: 3720, text: '', tone: 'muted' },
  { at: 3800, text: 'ACCESS ENDPOINT', tone: 'amber' },
  { at: 3860, text: '  ssh -i ~/.ssh/tensormesh_ed25519 -p 2222 ops@cl-zurich-01.ingress.eu-central-1.tensormesh.cloud', tone: 'rail' },
  { at: 3920, text: '  image : cuda-12.6-pytorch-2.4 · nccl 2.22.3 · cuda 12.6', tone: 'muted' },
]

export const ALLREDUCE_STAGES: Array<{ label: string; at: number }> = [
  { label: 'allocating 64 rank communicator groups', at: 260 },
  { label: 'ring topology discovery (NCCL_RING_ALGO=1)', at: 620 },
  { label: 'warmup 20 iters · 512 MiB message size', at: 1020 },
  { label: 'measurement window 200 iters', at: 1480 },
]

export const ALLREDUCE_RESULT = [
  { k: 'Ring algorithm avg latency', v: '1.84 μs' },
  { k: 'Tree algorithm avg latency', v: '2.07 μs' },
  { k: 'Bus bandwidth (ALG_BW)', v: '412.6 GB/s' },
  { k: 'Sustained all-reduce throughput', v: '3.19 TB/s' },
  { k: 'Minimum / maximum jitter', v: '±0.11 μs' },
]

export const CLI_HELP: Array<[string, string]> = [
  ['tensormesh nodes list', 'Enumerate allocated SXM5 nodes, GPU health, PCIe + NVLink state'],
  ['tensormesh bench --allreduce', 'Run the ring all-reduce latency benchmark on the active fabric'],
  ['tensormesh deploy --cluster <id> --image <img>', 'Materialise a cluster image and return the access endpoint'],
  ['tensormesh regions list', 'Show campus telemetry, spot floor pricing and live RTT'],
  ['tensormesh ssh <cluster>', 'Open an interactive session against the cluster ingress'],
  ['clear', 'Clear the terminal buffer'],
]

/** Python SDK sample rendered in the terminal drawer's third tab */
export const PYTHON_SDK = `from tensormesh import Fabric, ClusterSpec

fabric = Fabric(region="eu-central-1", token=os.environ["TM_TOKEN"])

spec = ClusterSpec(
    gpus=64,                 # 8 × HGX SXM5 nodes
    interconnect="ib-ndr",   # 800Gbps InfiniBand NDR
    storage="weka-100tb",
    term="reserved",
)

cluster = fabric.provision(spec)          # -> 41.8 s median cold-start
print(cluster.allocation_id)              # CL-9428-H100
print(cluster.ssh)                        # ops@cl-zrh-14.ingress...

cluster.exec("torchrun --nproc_per_node=8 train.py")`
