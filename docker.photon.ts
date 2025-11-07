/**
 * Docker - Container management operations
 *
 * Provides Docker container and image operations using Dockerode.
 * Supports container lifecycle, logs, stats, and image management.
 *
 * Common use cases:
 * - Container management: "List running containers", "Start the database container"
 * - Monitoring: "Show container logs", "Get container stats"
 * - Image management: "Pull nginx image", "List all images"
 *
 * Example: listContainers({ all: true })
 *
 * Configuration:
 * - socketPath: Docker socket path (default: /var/run/docker.sock)
 *
 * @dependencies dockerode@^4.0.0
 * @version 1.0.0
 * @author Portel
 * @license MIT
 */

import Docker from 'dockerode';
import { existsSync } from 'fs';

export default class DockerMCP {
  private docker: Docker;
  private socketPath: string;

  constructor(socketPath: string = '/var/run/docker.sock') {
    this.socketPath = socketPath;

    // Check if socket exists (Unix systems)
    const isUnixSocket = socketPath.startsWith('/');
    if (isUnixSocket && !existsSync(socketPath)) {
      throw new Error(`Docker socket not found at ${socketPath}. Is Docker running?`);
    }

    this.docker = new Docker({ socketPath });
  }

  async onInitialize() {
    try {
      // Test Docker connection
      await this.docker.ping();
      const version = await this.docker.version();
      console.error('[docker] ✅ Connected to Docker');
      console.error(`[docker] Version: ${version.Version}`);
      console.error(`[docker] API Version: ${version.ApiVersion}`);
    } catch (error: any) {
      console.error('[docker] ❌ Connection failed:', error.message);
      throw error;
    }
  }

  /**
   * List containers
   * @param all Show all containers (default: false, shows only running)
   */
  async listContainers(params?: { all?: boolean }) {
    try {
      const containers = await this.docker.listContainers({
        all: params?.all || false,
      });

      return {
        success: true,
        count: containers.length,
        containers: containers.map((container) => ({
          id: container.Id.substring(0, 12),
          name: container.Names[0]?.replace(/^\//, ''),
          image: container.Image,
          status: container.Status,
          state: container.State,
          created: new Date(container.Created * 1000).toISOString(),
          ports: container.Ports.map((p) => ({
            private: p.PrivatePort,
            public: p.PublicPort,
            type: p.Type,
          })),
        })),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Start a container
   * @param id Container ID or name
   */
  async startContainer(params: { id: string }) {
    try {
      const container = this.docker.getContainer(params.id);
      await container.start();

      return {
        success: true,
        id: params.id,
        message: `Container '${params.id}' started successfully`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Stop a container
   * @param id Container ID or name
   * @param timeout Seconds to wait before killing (default: 10)
   */
  async stopContainer(params: { id: string; timeout?: number }) {
    try {
      const container = this.docker.getContainer(params.id);
      await container.stop({ t: params.timeout || 10 });

      return {
        success: true,
        id: params.id,
        message: `Container '${params.id}' stopped successfully`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Restart a container
   * @param id Container ID or name
   * @param timeout Seconds to wait before killing (default: 10)
   */
  async restartContainer(params: { id: string; timeout?: number }) {
    try {
      const container = this.docker.getContainer(params.id);
      await container.restart({ t: params.timeout || 10 });

      return {
        success: true,
        id: params.id,
        message: `Container '${params.id}' restarted successfully`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Remove a container
   * @param id Container ID or name
   * @param force Force remove even if running (default: false)
   */
  async removeContainer(params: { id: string; force?: boolean }) {
    try {
      const container = this.docker.getContainer(params.id);
      await container.remove({ force: params.force || false });

      return {
        success: true,
        id: params.id,
        forced: params.force || false,
        message: `Container '${params.id}' removed successfully`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get container logs
   * @param id Container ID or name
   * @param tail Number of lines from the end of logs (default: 100)
   * @param timestamps Show timestamps (default: true)
   */
  async getLogs(params: { id: string; tail?: number; timestamps?: boolean }) {
    try {
      const container = this.docker.getContainer(params.id);

      const logs = await container.logs({
        stdout: true,
        stderr: true,
        tail: params.tail || 100,
        timestamps: params.timestamps !== false,
      });

      // Convert buffer to string and clean up Docker stream format
      const logString = logs
        .toString('utf8')
        .replace(/[\x00-\x08]/g, '') // Remove Docker stream headers
        .trim();

      return {
        success: true,
        id: params.id,
        lines: params.tail || 100,
        logs: logString,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * List images
   */
  async listImages(params: {}) {
    try {
      const images = await this.docker.listImages();

      return {
        success: true,
        count: images.length,
        images: images.map((image) => ({
          id: image.Id.replace('sha256:', '').substring(0, 12),
          tags: image.RepoTags || [],
          size: this._formatBytes(image.Size),
          created: new Date(image.Created * 1000).toISOString(),
        })),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Pull an image
   * @param name Image name (e.g., "nginx", "redis:alpine")
   * @param tag Image tag (default: 'latest')
   */
  async pullImage(params: { name: string; tag?: string }) {
    try {
      const tag = params.tag || 'latest';
      const imageName = `${params.name}:${tag}`;

      // Pull image and wait for completion
      const stream = await this.docker.pull(imageName);

      await new Promise((resolve, reject) => {
        this.docker.modem.followProgress(stream, (err, res) =>
          err ? reject(err) : resolve(res)
        );
      });

      return {
        success: true,
        image: imageName,
        message: `Image '${imageName}' pulled successfully`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Remove an image
   * @param id Image ID or name
   * @param force Force removal even if used by containers (default: false)
   */
  async removeImage(params: { id: string; force?: boolean }) {
    try {
      const image = this.docker.getImage(params.id);
      await image.remove({ force: params.force || false });

      return {
        success: true,
        id: params.id,
        forced: params.force || false,
        message: `Image '${params.id}' removed successfully`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get container stats
   * @param id Container ID or name
   */
  async getStats(params: { id: string }) {
    try {
      const container = this.docker.getContainer(params.id);

      // Get one-time stats (stream: false)
      const stats = await container.stats({ stream: false });

      // Calculate CPU percentage
      const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
      const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
      const cpuPercent = systemDelta > 0 ? (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100 : 0;

      // Calculate memory
      const memoryUsage = stats.memory_stats.usage || 0;
      const memoryLimit = stats.memory_stats.limit || 0;
      const memoryPercent = memoryLimit > 0 ? (memoryUsage / memoryLimit) * 100 : 0;

      return {
        success: true,
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
          rx_bytes: this._formatBytes(stats.networks?.eth0?.rx_bytes || 0),
          tx_bytes: this._formatBytes(stats.networks?.eth0?.tx_bytes || 0),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Private helper methods

  private _formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }
}
