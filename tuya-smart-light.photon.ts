/**
 * Tuya Smart Light - Control Tuya/Wipro/Smart Life WiFi bulbs
 *
 * Provides comprehensive control of Tuya-based smart lights via local network.
 * Automatically syncs devices from Tuya Cloud and discovers them on local network.
 *
 * Common use cases:
 * - Setup: "Configure Tuya Cloud credentials once"
 * - List: "Show all my smart lights"
 * - Control: "Turn on Living Room", "Set brightness to 50%"
 * - Color: "Set color to red", "Set warm white"
 *
 * Example workflow:
 * 1. setup({ client_id, client_secret, region }) - Configure Tuya Cloud (one-time)
 * 2. list() - See all devices (auto-synced from cloud + local network)
 * 3. on({ name: "Living Room" }) - Control by name or device_id
 *
 * Setup Guide for Tuya Cloud API:
 * 1. Create account at https://iot.tuya.com/
 * 2. Create a new Cloud Project
 * 3. Link your Smart Life app account (scan QR in "Me" tab)
 * 4. Get Access ID (client_id) and Access Secret (client_secret)
 * 5. Enable "Device Management" API permission
 * 6. Wait ~10 minutes for permissions to activate
 * 7. Run setup() once with your credentials
 *
 * All device data and credentials stored in ~/.photon/tuya-smart-light.json
 *
 * Dependencies are auto-installed on first run.
 *
 * @dependencies tuyapi@^7.7.0
 * @stateful true
 * @idleTimeout 300000
 *
 * @version 2.1.0
 * @author Photon
 * @license MIT
 */

import { createSocket } from 'dgram';
import crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';

// Dynamic import for tuyapi
let TuyAPI: any;

interface TuyaCredentials {
  client_id: string;
  client_secret: string;
  region: string;
}

interface TuyaDevice {
  id: string;
  name: string;
  local_key: string;
  product_id: string;
  category: string;
  ip?: string;
  version?: string;
  online?: boolean;
  lastSeen?: number;
}

interface StoredData {
  credentials?: TuyaCredentials;
  devices: TuyaDevice[];
  lastSync?: number;
}

// UDP key for discovery decryption
const UDP_KEY = crypto.createHash('md5').update('yGAdlopoPVldABfn').digest();

export default class TuyaSmartLight {
  private devicesFile: string;
  private devices: TuyaDevice[] = [];
  private credentials?: TuyaCredentials;
  private activeConnections: Map<string, any> = new Map();
  private initPromise?: Promise<void>;

  constructor(devices_file?: string) {
    // Default to absolute path in .photon directory
    if (devices_file) {
      this.devicesFile = devices_file;
    } else {
      const photonDir = path.join(os.homedir(), '.photon');
      this.devicesFile = path.join(photonDir, 'tuya-smart-light.json');
    }
  }

  async onInitialize() {
    // Load tuyapi dynamically
    try {
      TuyAPI = (await import('tuyapi')).default;
    } catch (error: any) {
      console.error('[tuya] Failed to load tuyapi:', error.message);
      throw new Error('tuyapi not installed. Run: npm install tuyapi');
    }

    console.error('[tuya] ✅ Initialized');
    console.error(`[tuya] Devices file: ${this.devicesFile}`);

    // Start background device discovery and sync
    this.initPromise = this._autoDiscoverAndSync();
  }

  /**
   * Setup Tuya Cloud API credentials (one-time configuration)
   * @param client_id Tuya Cloud Access ID (from iot.tuya.com)
   * @param client_secret Tuya Cloud Access Secret (from iot.tuya.com)
   * @param region Tuya region: "us", "eu", "cn", or "in" (default: "us")
   * @format table
   */
  async setup(params: { client_id: string; client_secret: string; region?: string }) {
    if (!params.client_id || !params.client_secret) {
      return {
        success: false,
        error: 'client_id and client_secret are required',
        setup_guide: 'Visit https://iot.tuya.com/ → Create Project → Get Access ID & Secret',
      };
    }

    this.credentials = {
      client_id: params.client_id,
      client_secret: params.client_secret,
      region: params.region || 'us',
    };

    console.error('[tuya] 💾 Saving credentials...');
    await this._saveData();

    console.error('[tuya] 🔄 Syncing devices from Tuya Cloud...');
    const result = await this._fetchAndMergeDevices();

    if (result.success) {
      return {
        success: true,
        message: 'Credentials saved and devices synced',
        devices_found: this.devices.length,
      };
    } else {
      return result;
    }
  }

  /**
   * List all Tuya devices (auto-synced from cloud and local network)
   * @param refresh Force refresh from cloud and local network (default: false)
   * @format table
   */
  async list(params?: { refresh?: boolean }) {
    await this._ensureReady();

    if (params?.refresh && this.credentials) {
      console.error('[tuya] 🔄 Refreshing devices...');
      await this._fetchAndMergeDevices();
    }

    if (this.devices.length === 0) {
      return {
        success: false,
        message: 'No devices found. Run setup() first to configure Tuya Cloud credentials.',
      };
    }

    return this.devices.map(d => ({
      device_id: d.id,
      name: d.name,
      category: d.category,
      online_local: d.ip ? 'yes' : 'no',
      ip: d.ip || 'not on network',
      last_seen: d.lastSeen ? new Date(d.lastSeen).toLocaleString() : 'never',
    }));
  }

  /**
   * Turn light on
   * @param device_id Device ID (optional if name provided)
   * @param name Device name (optional if device_id provided)
   * @format none
   */
  async on(params?: { device_id?: string; name?: string }) {
    const device = await this._getDevice(params);
    if (!device.success) return device;

    return this._executeCommand(device.device!, { dps: 1, set: true }, 'Light turned on');
  }

  /**
   * Turn light off
   * @param device_id Device ID (optional if name provided)
   * @param name Device name (optional if device_id provided)
   * @format none
   */
  async off(params?: { device_id?: string; name?: string }) {
    const device = await this._getDevice(params);
    if (!device.success) return device;

    return this._executeCommand(device.device!, { dps: 1, set: false }, 'Light turned off');
  }

  /**
   * Toggle light on/off
   * @param device_id Device ID (optional if name provided)
   * @param name Device name (optional if device_id provided)
   * @format none
   */
  async toggle(params?: { device_id?: string; name?: string }) {
    const device = await this._getDevice(params);
    if (!device.success) return device;

    try {
      const conn = await this._getConnection(device.device!);
      const current = await conn.get({ dps: 1 });
      await conn.set({ dps: 1, set: !current });

      return {
        success: true,
        message: `Light turned ${!current ? 'on' : 'off'}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Set brightness level
   * @param level Brightness level (0-1000)
   * @param device_id Device ID (optional if name provided)
   * @param name Device name (optional if device_id provided)
   * @format table
   */
  async brightness(level: number | { level: number; device_id?: string; name?: string }, params?: { device_id?: string; name?: string }) {
    // Handle both brightness(50) and brightness({ level: 50, name: "X" })
    const actualLevel = typeof level === 'number' ? level : level.level;
    const actualParams = typeof level === 'number' ? params : level;

    const device = await this._getDevice(actualParams);
    if (!device.success) return device;

    return this._executeCommand(device.device!, { dps: 3, set: actualLevel }, `Brightness set to ${actualLevel}`);
  }

  /**
   * Set color temperature (warm to cool white)
   * @param temp Temperature value (0-1000, where 0 is warm, 1000 is cool)
   * @param device_id Device ID (optional if name provided)
   * @param name Device name (optional if device_id provided)
   * @format table
   */
  async temperature(temp: number | { temp: number; device_id?: string; name?: string }, params?: { device_id?: string; name?: string }) {
    // Handle both temperature(500) and temperature({ temp: 500, name: "X" })
    const actualTemp = typeof temp === 'number' ? temp : temp.temp;
    const actualParams = typeof temp === 'number' ? params : temp;

    const device = await this._getDevice(actualParams);
    if (!device.success) return device;

    try {
      const conn = await this._getConnection(device.device!);
      await conn.set({ multiple: true, data: {
        '2': 'white',
        '4': actualTemp,
      }});

      return {
        success: true,
        message: `Color temperature set to ${actualTemp}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Set color (supports hex RGB or color names)
   * @param color Color as hex (FF0000, #FF0000) or name (red, blue, green, etc.)
   * @param device_id Device ID (optional if name provided)
   * @param name Device name (optional if device_id provided)
   * @format table
   */
  async color(color: string | { color: string; device_id?: string; name?: string }, params?: { device_id?: string; name?: string }) {
    // Handle both color("FF0000") and color({ color: "red", name: "X" })
    const actualColor = typeof color === 'string' ? color : color.color;
    const actualParams = typeof color === 'string' ? params : color;

    const device = await this._getDevice(actualParams);
    if (!device.success) return device;

    // Named colors
    const namedColors: { [key: string]: string } = {
      red: 'FF0000',
      green: '00FF00',
      blue: '0000FF',
      yellow: 'FFFF00',
      cyan: '00FFFF',
      magenta: 'FF00FF',
      white: 'FFFFFF',
      orange: 'FF8000',
      purple: '8000FF',
      pink: 'FF69B4',
      lime: '00FF00',
      navy: '000080',
      teal: '008080',
      olive: '808000',
      maroon: '800000',
    };

    // Convert color to RGB hex
    let rgbHex = actualColor.replace('#', '').toUpperCase();

    // Check if it's a named color
    const colorLower = actualColor.toLowerCase();
    if (namedColors[colorLower]) {
      rgbHex = namedColors[colorLower];
    }

    // Validate hex
    if (!/^[0-9A-F]{6}$/.test(rgbHex)) {
      return {
        success: false,
        error: `Invalid color: ${actualColor}. Use hex (FF0000) or name (${Object.keys(namedColors).join(', ')})`,
      };
    }

    // Convert RGB to HSV
    const hsv = this._rgbToHsv(rgbHex);

    try {
      // Tuya uses HSV format: HHHHssssvvvv (12 hex chars)
      const h = Math.round(hsv.h);
      const s = Math.round(hsv.s * 10); // 0-1000
      const v = Math.round(hsv.v * 10); // 0-1000

      const hHex = h.toString(16).padStart(4, '0');
      const sHex = s.toString(16).padStart(4, '0');
      const vHex = v.toString(16).padStart(4, '0');

      const colorValue = hHex + sHex + vHex;

      const conn = await this._getConnection(device.device!);
      await conn.set({ multiple: true, data: {
        '2': 'colour',
        '5': colorValue,
      }});

      return {
        success: true,
        message: `Color set to #${rgbHex}`,
        device: device.device!.name,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get device status
   * @param device_id Device ID (optional if name provided)
   * @param name Device name (optional if device_id provided)
   * @format table
   */
  async status(params?: { device_id?: string; name?: string }) {
    const device = await this._getDevice(params);
    if (!device.success) return device;

    try {
      const conn = await this._getConnection(device.device!);
      const status = await conn.get({ schema: true });

      return {
        success: true,
        device: device.device!.name,
        status,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Private methods

  private async _ensureReady(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  private async _autoDiscoverAndSync(): Promise<void> {
    try {
      // Load existing data
      await this._loadData();

      if (this.credentials) {
        console.error('[tuya] 🔄 Auto-syncing devices...');
        await this._fetchAndMergeDevices();
      } else {
        console.error('[tuya] ⚠️  No credentials configured. Run setup() to configure Tuya Cloud.');
      }
    } catch (error: any) {
      console.error(`[tuya] Auto-sync error: ${error.message}`);
    }
  }

  private async _fetchAndMergeDevices(): Promise<any> {
    if (!this.credentials) {
      return {
        success: false,
        error: 'No credentials configured. Run setup() first.',
      };
    }

    try {
      // Fetch devices from Tuya Cloud
      const token = await this._getTuyaToken(
        this.credentials.client_id,
        this.credentials.client_secret,
        this.credentials.region
      );

      if (!token) {
        return {
          success: false,
          error: 'Failed to get access token from Tuya Cloud',
        };
      }

      const cloudDevices = await this._getTuyaDevices(
        token,
        this.credentials.client_id,
        this.credentials.client_secret,
        this.credentials.region
      );

      console.error(`[tuya] ✓ Found ${cloudDevices.length} devices from cloud`);

      // Scan local network
      const localDevices = await this._scanLocalNetwork();
      console.error(`[tuya] ✓ Found ${localDevices.size} devices on local network`);

      // Merge cloud and local data
      this.devices = cloudDevices.map((d: any) => {
        const local = localDevices.get(d.id);
        return {
          id: d.id,
          name: d.name,
          local_key: d.local_key,
          product_id: d.product_id,
          category: d.category,
          ip: local?.ip,
          version: local?.version,
          online: !!local,
          lastSeen: local ? Date.now() : undefined,
        };
      });

      // Save merged data
      await this._saveData();

      return {
        success: true,
        devices_found: this.devices.length,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async _scanLocalNetwork(): Promise<Map<string, { ip: string; version: string }>> {
    return new Promise((resolve) => {
      const discovered = new Map<string, { ip: string; version: string }>();
      const sockets: any[] = [];

      const handleMessage = (msg: Buffer, rinfo: any) => {
        try {
          let data: any;

          const decrypted = this._decryptUDP(msg);
          if (decrypted) {
            data = JSON.parse(decrypted.toString());
          } else {
            data = JSON.parse(msg.toString());
          }

          const deviceId = data.gwId || data.devId;
          if (deviceId && !discovered.has(deviceId)) {
            discovered.set(deviceId, {
              ip: data.ip || rinfo.address,
              version: data.version || '3.3',
            });
          }
        } catch (error) {
          // Ignore parsing errors
        }
      };

      // Listen on port 6666 (unencrypted)
      const socket6666 = createSocket({ type: 'udp4', reuseAddr: true });
      socket6666.on('message', handleMessage);
      socket6666.on('error', () => {});
      socket6666.bind(6666);
      sockets.push(socket6666);

      // Listen on port 6667 (encrypted)
      const socket6667 = createSocket({ type: 'udp4', reuseAddr: true });
      socket6667.on('message', handleMessage);
      socket6667.on('error', () => {});
      socket6667.bind(6667);
      sockets.push(socket6667);

      setTimeout(() => {
        sockets.forEach(s => s.close());
        resolve(discovered);
      }, 5000);
    });
  }

  private async _getDevice(params?: { device_id?: string; name?: string }): Promise<any> {
    await this._ensureReady();

    if (!params?.device_id && !params?.name) {
      return {
        success: false,
        error: 'Either device_id or name is required',
      };
    }

    let device: TuyaDevice | undefined;

    if (params.device_id) {
      device = this.devices.find(d => d.id === params.device_id);
    } else if (params.name) {
      device = this.devices.find(d =>
        d.name.toLowerCase() === params.name!.toLowerCase()
      );
    }

    if (!device) {
      return {
        success: false,
        error: `Device not found: ${params.device_id || params.name}`,
      };
    }

    if (!device.ip) {
      return {
        success: false,
        error: `Device "${device.name}" not found on local network. Make sure it's powered on and connected to WiFi.`,
      };
    }

    return {
      success: true,
      device,
    };
  }

  private async _getConnection(device: TuyaDevice): Promise<any> {
    // Check if we already have a connection
    if (this.activeConnections.has(device.id)) {
      const conn = this.activeConnections.get(device.id);
      if (conn.isConnected()) {
        return conn;
      }
    }

    // Create new connection
    const conn = new TuyAPI({
      id: device.id,
      key: device.local_key,
      ip: device.ip,
      version: device.version || '3.3',
    });

    await conn.find();
    await conn.connect();

    this.activeConnections.set(device.id, conn);

    return conn;
  }

  private async _executeCommand(device: TuyaDevice, command: any, successMessage: string): Promise<any> {
    try {
      const conn = await this._getConnection(device);
      await conn.set(command);

      return {
        success: true,
        message: successMessage,
        device: device.name,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        device: device.name,
      };
    }
  }

  private async _loadData(): Promise<void> {
    try {
      const data = await fs.readFile(this.devicesFile, 'utf-8');
      const stored: StoredData = JSON.parse(data);

      this.credentials = stored.credentials;
      this.devices = stored.devices || [];

      console.error(`[tuya] Loaded ${this.devices.length} devices from storage`);
    } catch (error) {
      // File doesn't exist or is invalid, start fresh
      this.devices = [];
    }
  }

  private async _saveData(): Promise<void> {
    const stored: StoredData = {
      credentials: this.credentials,
      devices: this.devices,
      lastSync: Date.now(),
    };

    await fs.writeFile(this.devicesFile, JSON.stringify(stored, null, 2));
  }

  private _rgbToHsv(rgbHex: string): { h: number; s: number; v: number } {
    // Parse RGB (each component is 0-255)
    const r = parseInt(rgbHex.substr(0, 2), 16) / 255;
    const g = parseInt(rgbHex.substr(2, 2), 16) / 255;
    const b = parseInt(rgbHex.substr(4, 2), 16) / 255;

    // Convert to HSV
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    // Calculate hue (0-360)
    let h = 0;
    if (delta !== 0) {
      if (max === r) {
        h = 60 * (((g - b) / delta) % 6);
      } else if (max === g) {
        h = 60 * (((b - r) / delta) + 2);
      } else {
        h = 60 * (((r - g) / delta) + 4);
      }
    }
    if (h < 0) h += 360;

    // Calculate saturation (0-100)
    const s = max === 0 ? 0 : (delta / max) * 100;

    // Calculate value (0-100)
    const v = max * 100;

    return { h, s, v };
  }

  private _decryptUDP(data: Buffer): Buffer | null {
    try {
      if (data.length < 28) {
        return null;
      }

      const payload = data.slice(20, data.length - 8);

      const decipher = crypto.createDecipheriv('aes-128-ecb', UDP_KEY, null);
      decipher.setAutoPadding(false);

      let decrypted = Buffer.concat([
        decipher.update(payload),
        decipher.final()
      ]);

      // Remove padding
      const padLength = decrypted[decrypted.length - 1];
      if (padLength > 0 && padLength < 16) {
        decrypted = decrypted.slice(0, decrypted.length - padLength);
      }

      return decrypted;
    } catch (error) {
      return null;
    }
  }

  private _getTuyaRegionUrl(region: string): string {
    const urls: { [key: string]: string } = {
      us: 'https://openapi.tuyaus.com',
      eu: 'https://openapi.tuyaeu.com',
      cn: 'https://openapi.tuyacn.com',
      in: 'https://openapi.tuyain.com',
    };
    return urls[region] || urls['us'];
  }

  private _generateTuyaSign(
    clientId: string,
    secret: string,
    timestamp: number,
    accessToken?: string
  ): string {
    const str = accessToken
      ? `${clientId}${accessToken}${timestamp}`
      : `${clientId}${timestamp}`;

    return crypto
      .createHmac('sha256', secret)
      .update(str)
      .digest('hex')
      .toUpperCase();
  }

  private async _getTuyaToken(clientId: string, clientSecret: string, region: string): Promise<string | null> {
    try {
      const baseUrl = this._getTuyaRegionUrl(region);
      const timestamp = Date.now();
      const sign = this._generateTuyaSign(
        clientId,
        clientSecret,
        timestamp
      );

      const response = await fetch(`${baseUrl}/v1.0/token?grant_type=1`, {
        method: 'GET',
        headers: {
          'client_id': clientId,
          'sign': sign,
          't': timestamp.toString(),
          'sign_method': 'HMAC-SHA256',
        },
      });

      const data = await response.json();

      if (data.success && data.result && data.result.access_token) {
        console.error('[tuya] ✓ Got access token');
        return data.result.access_token;
      } else {
        console.error('[tuya] ✗ Token error:', data.msg || 'Unknown error');
        return null;
      }
    } catch (error: any) {
      console.error('[tuya] ✗ Token request failed:', error.message);
      return null;
    }
  }

  private async _getTuyaDevices(accessToken: string, clientId: string, clientSecret: string, region: string): Promise<any[]> {
    try {
      const baseUrl = this._getTuyaRegionUrl(region);
      const timestamp = Date.now();
      const sign = this._generateTuyaSign(
        clientId,
        clientSecret,
        timestamp,
        accessToken
      );

      const response = await fetch(`${baseUrl}/v1.0/iot-03/devices`, {
        method: 'GET',
        headers: {
          'client_id': clientId,
          'access_token': accessToken,
          'sign': sign,
          't': timestamp.toString(),
          'sign_method': 'HMAC-SHA256',
        },
      });

      const data = await response.json();

      if (data.success && data.result && data.result.list) {
        console.error(`[tuya] ✓ Found ${data.result.list.length} devices`);
        return data.result.list;
      } else {
        console.error('[tuya] ✗ Devices error:', data.msg || 'Unknown error');
        return [];
      }
    } catch (error: any) {
      console.error('[tuya] ✗ Devices request failed:', error.message);
      return [];
    }
  }
}
