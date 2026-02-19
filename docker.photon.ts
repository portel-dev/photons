/**
 * Docker - Container management
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @icon 🐳
 * @tags docker, containers, devops
 * @dependencies dockerode@^4.0.0
 */

import Docker from 'dockerode';
import { existsSync } from 'fs';

interface Container {
  id: string;
  name: string;
  image: string;
  status: string;
  state: string;
  created: string;
  ports?: Array<{ private?: number; public?: number; type: string }>;
}

interface Image {
  id: string;
  tags: string[];
  size: string;
  created: string;
}

export default class DockerMCP {
  private docker: Docker;

  constructor(socketPath: string = '/var/run/docker.sock') {
    if (socketPath.startsWith('/') && !existsSync(socketPath)) {
      throw new Error(`Docker socket not found: ${socketPath}`);
    }
    this.docker = new Docker({ socketPath });
  }

  async onInitialize() {
    try {
      const [version, _] = await Promise.all([
        this.docker.version(),
        this.docker.ping(),
      ]);
      console.error(`[docker] ✅ Connected (v${version.Version})`);
    } catch (e: any) {
      console.error(`[docker] ❌ ${e.message}`);
      throw e;
    }
  }

  /**
   * List containers
   * @param all Show all containers {@default false, running only}
   * @format list {@title name, @subtitle image, status}
   * @autorun
   * @icon 📦
   */
  async containers(params?: { all?: boolean }): Promise<Container[]> {
    const list = await this.docker.listContainers({ all: params?.all || false });
    return list.map(c => ({
      id: c.Id.substring(0, 12),
      name: c.Names[0]?.replace(/^\//, '') || 'unnamed',
      image: c.Image,
      status: c.Status,
      state: c.State,
      created: new Date(c.Created * 1000).toISOString(),
      ports: c.Ports.map(p => ({
        private: p.PrivatePort,
        public: p.PublicPort,
        type: p.Type,
      })),
    }));
  }

  /**
   * Start a container
   * @param id Container ID or name {@example my-container}
   * @icon ▶️
   */
  async start(params: { id: string }) {
    await this.docker.getContainer(params.id).start();
    return { id: params.id, started: true };
  }

  /**
   * Stop a container
   * @param id Container ID or name {@example my-container}
   * @param timeout Seconds to wait before killing {@default 10}
   * @icon ⏹️
   */
  async stop(params: { id: string; timeout?: number }) {
    await this.docker.getContainer(params.id).stop({ t: params.timeout ?? 10 });
    return { id: params.id, stopped: true };
  }

  /**
   * Restart a container
   * @param id Container ID or name {@example my-container}
   * @param timeout Seconds to wait before killing {@default 10}
   * @icon 🔄
   */
  async restart(params: { id: string; timeout?: number }) {
    await this.docker.getContainer(params.id).restart({ t: params.timeout ?? 10 });
    return { id: params.id, restarted: true };
  }

  /**
   * Remove a container
   * @param id Container ID or name {@example my-container}
   * @param force Force remove even if running {@default false}
   * @icon 🗑️
   */
  async remove(params: { id: string; force?: boolean }) {
    await this.docker.getContainer(params.id).remove({ force: params.force || false });
    return { id: params.id, removed: true };
  }

  /**
   * Get container logs
   * @param id Container ID or name {@example my-container}
   * @param tail Lines from end {@default 100}
   * @param timestamps Show timestamps {@default true}
   * @icon 📝
   */
  async logs(params: { id: string; tail?: number; timestamps?: boolean }): Promise<string> {
    const logs = await this.docker.getContainer(params.id).logs({
      stdout: true,
      stderr: true,
      tail: params.tail ?? 100,
      timestamps: params.timestamps !== false,
    });

    return logs.toString('utf8').replace(/[\x00-\x08]/g, '').trim();
  }

  /**
   * Get container stats
   * @param id Container ID or name {@example my-container}
   * @format card
   * @icon 📊
   */
  async stats(params: { id: string }) {
    const stats = await this.docker.getContainer(params.id).stats({ stream: false });

    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const cpuPercent = systemDelta > 0
      ? (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100
      : 0;

    const memoryUsage = stats.memory_stats.usage || 0;
    const memoryLimit = stats.memory_stats.limit || 0;
    const memoryPercent = memoryLimit > 0 ? (memoryUsage / memoryLimit) * 100 : 0;

    return {
      id: params.id,
      cpu: {
        percent: cpuPercent.toFixed(2),
        usage: stats.cpu_stats.cpu_usage.total_usage,
      },
      memory: {
        usage: this._formatBytes(memoryUsage),
        limit: this._formatBytes(memoryLimit),
        percent: memoryPercent.toFixed(2),
      },
      network: {
        rx: this._formatBytes(stats.networks?.eth0?.rx_bytes || 0),
        tx: this._formatBytes(stats.networks?.eth0?.tx_bytes || 0),
      },
    };
  }

  /**
   * List images
   * @format list {@title tags[0], @subtitle size, created:date}
   * @autorun
   * @icon 🖼️
   */
  async images(): Promise<Image[]> {
    const list = await this.docker.listImages();
    return list.map(img => ({
      id: img.Id.replace('sha256:', '').substring(0, 12),
      tags: img.RepoTags || [],
      size: this._formatBytes(img.Size),
      created: new Date(img.Created * 1000).toISOString(),
    }));
  }

  /**
   * Pull an image
   * @param name Image name {@example nginx}
   * @param tag Image tag {@default latest}
   * @icon ⬇️
   */
  async pull(params: { name: string; tag?: string }) {
    const image = `${params.name}:${params.tag ?? 'latest'}`;

    const stream = await this.docker.pull(image);
    await new Promise((resolve, reject) => {
      this.docker.modem.followProgress(stream, (err, res) =>
        err ? reject(err) : resolve(res)
      );
    });

    return { image, pulled: true };
  }

  /**
   * Remove an image
   * @param id Image ID or name {@example nginx:alpine}
   * @param force Force removal {@default false}
   * @icon 🗑️
   */
  async drop(params: { id: string; force?: boolean }) {
    await this.docker.getImage(params.id).remove({ force: params.force || false });
    return { id: params.id, removed: true };
  }

  private _formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }
}
