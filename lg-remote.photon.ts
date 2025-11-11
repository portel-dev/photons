/**
 * LG Remote - Control LG WebOS TVs
 *
 * Provides comprehensive control of LG WebOS Smart TVs via network.
 * Supports discovery, pairing, media control, app management, and more.
 * Uses SSAP (Smart Service Access Protocol) over WebSocket.
 *
 * Common use cases:
 * - Discovery: "Find LG TVs on my network"
 * - Control: "Turn off the TV", "Set volume to 50"
 * - Media: "Play/pause the current content"
 * - Apps: "Launch Netflix", "Show running apps"
 *
 * Example: discover() then connect({ ip: "192.168.1.100" })
 *
 * Configuration:
 * - credentials_file: Path to store TV credentials (optional, default: "lg-tv-credentials.json")
 *
 * Dependencies are auto-installed on first run.
 *
 * @dependencies ws@^8.18.0
 *
 * @version 1.0.0
 * @author Photon (based on pokemote by mithileshchellappan)
 * @license MIT
 */

import { WebSocket } from 'ws';
import { createSocket } from 'dgram';
import { promises as fs } from 'fs';
import * as path from 'path';

interface TVCredentials {
  ip: string;
  clientKey: string;
  name?: string;
  secure?: boolean;
  lastUsed?: number;
}

interface TVMessage {
  type: string;
  id?: string;
  uri?: string;
  payload?: any;
}

interface DiscoveredTV {
  ip: string;
  name?: string;
  location?: string;
}

const REGISTRATION_MANIFEST = {
  manifestVersion: 1,
  appVersion: '1.1',
  signed: {
    created: '20140509',
    appId: 'com.lge.test',
    vendorId: 'com.lge',
    localizedAppNames: {
      '': 'LG Remote App',
      'ko-KR': 'ÈÇ ¸®¸ðÄÁ',
      'zxx-XX': 'Photon LG Remote',
    },
    localizedVendorNames: {
      '': 'LG Electronics',
    },
    permissions: [
      'TEST_SECURE',
      'CONTROL_INPUT_TEXT',
      'CONTROL_MOUSE_AND_KEYBOARD',
      'READ_INSTALLED_APPS',
      'READ_LGE_SDX',
      'READ_NOTIFICATIONS',
      'SEARCH',
      'WRITE_SETTINGS',
      'WRITE_NOTIFICATIONS',
      'CONTROL_POWER',
      'READ_CURRENT_CHANNEL',
      'READ_RUNNING_APPS',
      'READ_UPDATE_INFO',
      'UPDATE_FROM_REMOTE_APP',
      'READ_LGE_TV_INPUT_EVENTS',
      'READ_TV_CURRENT_TIME',
    ],
    serial: '2f930e2d2cfe083771f68e4fe7bb07',
  },
  permissions: [
    'LAUNCH',
    'LAUNCH_WEBAPP',
    'APP_TO_APP',
    'CLOSE',
    'TEST_OPEN',
    'TEST_PROTECTED',
    'CONTROL_AUDIO',
    'CONTROL_DISPLAY',
    'CONTROL_INPUT_JOYSTICK',
    'CONTROL_INPUT_MEDIA_RECORDING',
    'CONTROL_INPUT_MEDIA_PLAYBACK',
    'CONTROL_INPUT_TV',
    'CONTROL_POWER',
    'READ_APP_STATUS',
    'READ_CURRENT_CHANNEL',
    'READ_INPUT_DEVICE_LIST',
    'READ_NETWORK_STATE',
    'READ_RUNNING_APPS',
    'READ_TV_CHANNEL_LIST',
    'WRITE_NOTIFICATION_TOAST',
    'READ_POWER_STATE',
    'READ_COUNTRY_INFO',
  ],
  signatures: [
    {
      signatureVersion: 1,
      signature:
        'eyJhbGdvcml0aG0iOiJSU0EtU0hBMjU2Iiwia2V5SWQiOiJ0ZXN0LXNpZ25pbmctY2VydCIsInNpZ25hdHVyZVZlcnNpb24iOjF9.hrVRgjCwXVvE2OOSpDZ58hR+59aFNwYDyjQgKk3auukd7pcegmE2CzPCa0bJ0ZsRAcKkCTJrWo5iDzNhMBWRyaMOv5zWSrthlf7G128qvIlpMT0YNY+n/FaOHE73uLrS/g7swl3/qH/BGFG2Hu4RlL48eb3lLKqTt2xKHdCs6Cd4RMfJPYnzgvI4BNrFUKsjkcu+WD4OO2A27Pq1n50cMchmcaXadJhGrOqH5YmHdOCj5NSHzJYrsW0HPlpuAx/ECMeIZYDh6RMqaFM2DXzdKX9NmmyqzJ3o/0lkk/N97gfVRLW5hA29yeAwaCViZNCP8iC9aO0q9fQojoa7NQnAtw==',
    },
  ],
};

export default class LGRemote {
  private credentialsFile: string;
  private ws?: WebSocket;
  private pointerWs?: WebSocket;
  private currentTVIP?: string;
  private currentClientKey?: string;
  private pendingRequests: Map<string, { resolve: Function; reject: Function; timeout: NodeJS.Timeout }> = new Map();
  private subscriptions: Map<string, Function> = new Map();
  private discoveredTVs: DiscoveredTV[] = [];
  private defaultTV?: DiscoveredTV;
  private discoveryInProgress = false;

  constructor(credentials_file?: string) {
    this.credentialsFile = credentials_file || 'lg-tv-credentials.json';
  }

  async onInitialize() {
    console.error('[lg-remote] ✅ Initialized');
    console.error(`[lg-remote] Credentials file: ${this.credentialsFile}`);

    // Start background discovery (non-blocking)
    this._autoDiscoverAndConnect();
  }

  /**
   * Discover LG TVs on the network using SSDP
   * @param timeout Discovery timeout in seconds (default: 5)
   */
  async discover(params?: { timeout?: number }) {
    const timeout = (params?.timeout || 5) * 1000;

    return new Promise<any>((resolve) => {
      const socket = createSocket('udp4');
      const discovered = new Map<string, any>();

      const message = Buffer.from([
        'M-SEARCH * HTTP/1.1',
        'HOST: 239.255.255.250:1900',
        'MAN: "ssdp:discover"',
        'MX: 3',
        'ST: urn:lge-com:service:webos-second-screen:1',
        '',
        '',
      ].join('\r\n'));

      socket.on('message', async (msg, rinfo) => {
        const response = msg.toString();
        const locationMatch = response.match(/LOCATION: (.+)/i);

        if (locationMatch) {
          const location = locationMatch[1].trim();
          const ip = rinfo.address;

          if (!discovered.has(ip)) {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 2000);

              const descResponse = await fetch(location, {
                signal: controller.signal,
              });
              clearTimeout(timeoutId);

              const desc = await descResponse.text();

              if (desc.toLowerCase().includes('lg')) {
                const nameMatch = desc.match(/<friendlyName>(.+?)<\/friendlyName>/i);
                const name = nameMatch ? nameMatch[1] : undefined;

                discovered.set(ip, {
                  ip,
                  location,
                  name,
                });
              }
            } catch (error) {
              // Ignore fetch errors
            }
          }
        }
      });

      socket.bind(0, () => {
        socket.setMulticastTTL(2);
        socket.send(message, 0, message.length, 1900, '239.255.255.250');
      });

      setTimeout(() => {
        socket.close();
        const devices = Array.from(discovered.values());

        // Update internal state
        this.discoveredTVs = devices;
        if (devices.length > 0 && !this.defaultTV) {
          this.defaultTV = devices[0];
        }

        resolve({
          success: true,
          count: discovered.size,
          devices,
        });
      }, timeout);
    });
  }

  /**
   * Connect to an LG TV
   * @param ip TV IP address (optional, uses auto-discovered default TV if not specified)
   * @param secure Use secure WebSocket (wss://) (default: false)
   */
  async connect(params?: { ip?: string; secure?: boolean }) {
    try {
      // Determine which TV to connect to
      let targetIP: string | undefined = params?.ip;

      if (!targetIP) {
        // Try to use most recently used saved TV first
        const credentials = await this._loadCredentials();
        if (credentials.length > 0) {
          // Sort by lastUsed and pick the most recent
          const sorted = credentials.sort((a: TVCredentials, b: TVCredentials) =>
            (b.lastUsed || 0) - (a.lastUsed || 0)
          );
          targetIP = sorted[0].ip;
          console.error(`[lg-remote] Using most recent TV: ${targetIP}`);
        } else if (this.defaultTV) {
          // Use auto-discovered default TV
          targetIP = this.defaultTV.ip;
          console.error(`[lg-remote] Using auto-discovered TV: ${targetIP}`);
        } else {
          return {
            success: false,
            error: 'No TV specified and no default TV available. Run discover() first or specify an IP.',
          };
        }
      }

      // Try to load existing credentials
      const credentials = await this._loadCredentials();
      const existingCred = credentials.find((c: TVCredentials) => c.ip === targetIP);

      const secure = params?.secure !== undefined ? params.secure : existingCred?.secure || false;
      const port = secure ? 3001 : 3000;
      const protocol = secure ? 'wss' : 'ws';
      const url = `${protocol}://${targetIP}:${port}`;

      // Close existing connection if any
      if (this.ws) {
        this.ws.close();
      }

      this.currentTVIP = targetIP;

      return new Promise<any>((resolve, reject) => {
        const ws = new WebSocket(url, {
          rejectUnauthorized: false,
        });

        ws.on('open', () => {
          this.ws = ws;

          // Try to register/pair
          if (existingCred?.clientKey) {
            // Use existing credentials
            this.currentClientKey = existingCred.clientKey;
            this._sendRegister(existingCred.clientKey);

            // Update lastUsed timestamp
            this._saveCredentials({
              ...existingCred,
              lastUsed: Date.now(),
            });

            // Wait for registration response
            setTimeout(() => {
              resolve({
                success: true,
                message: 'Connected using saved credentials',
                ip: targetIP,
                paired: true,
              });
            }, 1000);
          } else {
            // Start pairing process
            this._sendRegister();

            setTimeout(() => {
              resolve({
                success: true,
                message: 'Connected. Please check TV for pairing prompt and call pair() with the credentials',
                ip: targetIP,
                paired: false,
                needsPairing: true,
              });
            }, 1000);
          }
        });

        ws.on('message', (data) => {
          this._handleMessage(data.toString());
        });

        ws.on('error', (error) => {
          reject({
            success: false,
            error: error.message,
          });
        });

        ws.on('close', () => {
          this.ws = undefined;
          this.currentClientKey = undefined;
        });
      });
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Complete pairing after TV prompt
   * @param name Optional name for the TV
   */
  async pair(params?: { name?: string }) {
    if (!this.currentTVIP) {
      return {
        success: false,
        error: 'Not connected to any TV. Call connect() first.',
      };
    }

    // Wait for client-key in messages
    return new Promise<any>((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.currentClientKey) {
          clearInterval(checkInterval);

          // Save credentials
          this._saveCredentials({
            ip: this.currentTVIP!,
            clientKey: this.currentClientKey,
            name: params?.name,
            lastUsed: Date.now(),
          });

          resolve({
            success: true,
            message: 'Pairing completed and credentials saved',
            ip: this.currentTVIP,
          });
        }
      }, 500);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!this.currentClientKey) {
          resolve({
            success: false,
            error: 'Pairing timeout. Make sure you accept the pairing prompt on the TV.',
          });
        }
      }, 30000);
    });
  }

  /**
   * Disconnect from the current TV
   */
  async disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }

    if (this.pointerWs) {
      this.pointerWs.close();
      this.pointerWs = undefined;
    }

    this.currentTVIP = undefined;
    this.currentClientKey = undefined;

    return {
      success: true,
      message: 'Disconnected',
    };
  }

  /**
   * List discovered and saved TVs
   * @param refresh If true, re-discover TVs on network (default: false)
   */
  async list(params?: { refresh?: boolean }) {
    try {
      // Re-discover if requested
      if (params?.refresh) {
        console.error('[lg-remote] 🔍 Refreshing TV list...');
        await this.discover({ timeout: 5 });
      }

      const credentials = await this._loadCredentials();
      const credMap = new Map(credentials.map((c: TVCredentials) => [c.ip, c]));

      // Merge discovered TVs with saved credentials
      const allTVs = new Map<string, any>();

      // Add discovered TVs
      for (const tv of this.discoveredTVs) {
        const cred = credMap.get(tv.ip);
        allTVs.set(tv.ip, {
          ip: tv.ip,
          name: tv.name || cred?.name,
          paired: !!cred,
          secure: cred?.secure,
          lastUsed: cred?.lastUsed,
          isDefault: this.defaultTV?.ip === tv.ip,
          isConnected: this.currentTVIP === tv.ip,
        });
      }

      // Add saved TVs that weren't discovered
      for (const cred of credentials) {
        if (!allTVs.has(cred.ip)) {
          allTVs.set(cred.ip, {
            ip: cred.ip,
            name: cred.name,
            paired: true,
            secure: cred.secure,
            lastUsed: cred.lastUsed,
            discovered: false,
            isDefault: this.defaultTV?.ip === cred.ip,
            isConnected: this.currentTVIP === cred.ip,
          });
        }
      }

      // Sort by lastUsed (most recent first), then by discovered
      const devices = Array.from(allTVs.values()).sort((a, b) => {
        if (a.lastUsed && b.lastUsed) {
          return b.lastUsed - a.lastUsed;
        }
        if (a.lastUsed) return -1;
        if (b.lastUsed) return 1;
        return 0;
      });

      return {
        success: true,
        count: devices.length,
        devices,
        defaultTV: this.defaultTV?.ip,
        connectedTV: this.currentTVIP,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete saved credentials for a TV
   * @param ip TV IP address
   */
  async forget(params: { ip: string }) {
    try {
      const credentials = await this._loadCredentials();
      const filtered = credentials.filter((c: TVCredentials) => c.ip !== params.ip);

      await fs.writeFile(this.credentialsFile, JSON.stringify(filtered, null, 2));

      return {
        success: true,
        message: `Credentials for ${params.ip} deleted`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get current connection status
   */
  async status() {
    return {
      success: true,
      connected: !!this.ws && this.ws.readyState === WebSocket.OPEN,
      ip: this.currentTVIP,
      paired: !!this.currentClientKey,
    };
  }

  /**
   * Get/set volume level
   * @param level Volume level (0-100, optional - omit to get current volume)
   */
  async volume(params?: { level?: number } | number) {
    // Support both volume(50) and volume({ level: 50 })
    const level = typeof params === 'number' ? params : params?.level;

    if (level !== undefined) {
      return this._request('ssap://audio/setVolume', { volume: level });
    }
    return this._request('ssap://audio/getVolume');
  }

  /**
   * Increase volume by 1
   */
  async volUp() {
    return this._request('ssap://audio/volumeUp');
  }

  /**
   * Decrease volume by 1
   */
  async volDown() {
    return this._request('ssap://audio/volumeDown');
  }

  /**
   * Toggle mute
   * @param mute True to mute, false to unmute (optional - omit to toggle)
   */
  async mute(params?: { mute?: boolean } | boolean) {
    // Support both mute(true) and mute({ mute: true })
    const muteValue = typeof params === 'boolean' ? params : params?.mute;

    if (muteValue !== undefined) {
      return this._request('ssap://audio/setMute', { mute: muteValue });
    }
    // If no param, we can't toggle without knowing current state, so default to mute
    return this._request('ssap://audio/setMute', { mute: true });
  }

  /**
   * Turn TV off
   */
  async off() {
    return this._request('ssap://system/turnOff');
  }

  /**
   * Show a notification toast on TV
   * @param message Notification message
   */
  async notify(params: { message: string } | string) {
    // Support both notify("Hello") and notify({ message: "Hello" })
    const message = typeof params === 'string' ? params : params.message;

    return this._request('ssap://system.notifications/createToast', { message });
  }

  /**
   * List all installed apps, or launch/get current app
   * @param id App ID to launch (e.g., "netflix", "youtube.leanback.v4"), omit to list all, or use "current" to get running app
   */
  async apps(params?: { id?: string; current?: boolean } | string) {
    // Support both apps("netflix") and apps({ id: "netflix" })
    const id = typeof params === 'string' ? params : params?.id;
    const current = typeof params === 'object' ? params?.current : false;

    if (id === 'current' || current) {
      return this._request('ssap://com.webos.applicationManager/getForegroundAppInfo');
    }
    if (id) {
      return this._request('ssap://system.launcher/launch', { id });
    }
    return this._request('ssap://com.webos.applicationManager/listApps');
  }

  /**
   * Get current channel, set channel, or list all channels
   * @param number Channel number to switch to (optional), or "list" to list all
   */
  async channel(params?: { number?: string; list?: boolean } | string) {
    // Support both channel("5") and channel({ number: "5" })
    const number = typeof params === 'string' && params !== 'list' ? params :
                   typeof params === 'object' ? params?.number : undefined;
    const list = params === 'list' || (typeof params === 'object' && params?.list);

    if (number) {
      return this._request('ssap://tv/openChannel', { channelNumber: number });
    }
    if (list) {
      return this._request('ssap://tv/getChannelList');
    }
    return this._request('ssap://tv/getCurrentChannel');
  }

  /**
   * Channel up
   */
  async chUp() {
    return this._request('ssap://tv/channelUp');
  }

  /**
   * Channel down
   */
  async chDown() {
    return this._request('ssap://tv/channelDown');
  }

  /**
   * List inputs or switch to an input
   * @param id Input ID to switch to (optional, omit to list all)
   */
  async input(params?: { id?: string } | string) {
    // Support both input("HDMI_1") and input({ id: "HDMI_1" })
    const id = typeof params === 'string' ? params : params?.id;

    if (id) {
      return this._request('ssap://tv/switchInput', { inputId: id });
    }
    return this._request('ssap://tv/getExternalInputList');
  }

  /**
   * Play media
   */
  async play() {
    return this._request('ssap://media.controls/play');
  }

  /**
   * Pause media
   */
  async pause() {
    return this._request('ssap://media.controls/pause');
  }

  /**
   * Stop media
   */
  async stop() {
    return this._request('ssap://media.controls/stop');
  }

  /**
   * Rewind media
   */
  async rw() {
    return this._request('ssap://media.controls/rewind');
  }

  /**
   * Fast forward media
   */
  async ff() {
    return this._request('ssap://media.controls/fastForward');
  }

  /**
   * Send remote button press
   * @param button Button name (HOME, BACK, UP, DOWN, LEFT, RIGHT, ENTER, etc.)
   */
  async btn(params: { button: string } | string) {
    // Support both btn("HOME") and btn({ button: "HOME" })
    const button = typeof params === 'string' ? params : params.button;

    if (!this.pointerWs || this.pointerWs.readyState !== WebSocket.OPEN) {
      // Connect pointer socket
      const secure = this.currentClientKey ? true : false;
      const port = secure ? 3001 : 3000;
      const protocol = secure ? 'wss' : 'ws';
      const url = `${protocol}://${this.currentTVIP}:${port}/pointer`;

      return new Promise<any>((resolve, reject) => {
        const ws = new WebSocket(url, {
          rejectUnauthorized: false,
        });

        ws.on('open', () => {
          this.pointerWs = ws;
          this._sendButton(button);
          resolve({
            success: true,
            message: `Button ${button} pressed`,
          });
        });

        ws.on('error', (error) => {
          reject({
            success: false,
            error: error.message,
          });
        });
      });
    } else {
      this._sendButton(button);
      return {
        success: true,
        message: `Button ${button} pressed`,
      };
    }
  }

  /**
   * Get TV system information (model, firmware, etc.)
   */
  async info() {
    return this._request('luna://com.webos.service.tv.systemproperty/getSystemInfo', {
      keys: ['modelName', 'firmwareVersion', 'sdkVersion', 'UHD'],
    });
  }

  /**
   * Get current software/firmware information
   */
  async swInfo() {
    return this._request('ssap://com.webos.service.update/getCurrentSWInformation');
  }

  // Private methods

  private _sendRegister(clientKey?: string) {
    const payload = clientKey
      ? { 'client-key': clientKey, ...REGISTRATION_MANIFEST }
      : REGISTRATION_MANIFEST;

    const message: TVMessage = {
      type: 'register',
      payload,
    };

    if (this.ws) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private _handleMessage(data: string) {
    try {
      const message: TVMessage = JSON.parse(data);

      // Handle registration response
      if (message.type === 'registered') {
        if (message.payload?.['client-key']) {
          this.currentClientKey = message.payload['client-key'];
        }
      }

      // Handle request responses
      if (message.type === 'response' && message.id) {
        const pending = this.pendingRequests.get(message.id);
        if (pending) {
          clearTimeout(pending.timeout);
          this.pendingRequests.delete(message.id);
          pending.resolve(message.payload);
        }
      }

      // Handle errors
      if (message.type === 'error' && message.id) {
        const pending = this.pendingRequests.get(message.id);
        if (pending) {
          clearTimeout(pending.timeout);
          this.pendingRequests.delete(message.id);
          pending.reject(new Error(message.payload?.error || 'Unknown error'));
        }
      }
    } catch (error) {
      // Ignore parse errors
    }
  }

  private async _request(uri: string, payload?: any): Promise<any> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return {
        success: false,
        error: 'Not connected to TV',
      };
    }

    return new Promise((resolve, reject) => {
      const id = `req_${Date.now()}_${Math.random()}`;
      const message: TVMessage = {
        type: 'request',
        id,
        uri,
        payload: payload || {},
      };

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error('Request timeout'));
      }, 10000);

      this.pendingRequests.set(id, {
        resolve: (data: any) => resolve({ success: true, data }),
        reject: (error: Error) => resolve({ success: false, error: error.message }),
        timeout,
      });

      this.ws!.send(JSON.stringify(message));
    });
  }

  private _sendButton(button: string) {
    if (this.pointerWs) {
      const message = {
        type: 'button',
        name: button.toUpperCase(),
      };
      this.pointerWs.send(JSON.stringify(message));
    }
  }

  private async _loadCredentials(): Promise<TVCredentials[]> {
    try {
      const data = await fs.readFile(this.credentialsFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  private async _saveCredentials(newCred: TVCredentials) {
    const credentials = await this._loadCredentials();
    const index = credentials.findIndex((c: TVCredentials) => c.ip === newCred.ip);

    if (index >= 0) {
      credentials[index] = { ...newCred, lastUsed: Date.now() };
    } else {
      credentials.push({ ...newCred, lastUsed: Date.now() });
    }

    await fs.writeFile(this.credentialsFile, JSON.stringify(credentials, null, 2));
  }

  private async _autoDiscoverAndConnect() {
    if (this.discoveryInProgress) {
      return;
    }

    this.discoveryInProgress = true;

    try {
      console.error('[lg-remote] 🔍 Starting auto-discovery...');

      // Run discovery with short timeout (3 seconds)
      const result = await this.discover({ timeout: 3 });

      if (result.success && result.devices && result.devices.length > 0) {
        this.discoveredTVs = result.devices;
        this.defaultTV = result.devices[0];

        console.error(`[lg-remote] ✅ Found ${result.count} TV(s)`);
        console.error(`[lg-remote] 📺 Default TV: ${this.defaultTV.name || this.defaultTV.ip}`);

        // Try to auto-connect to the default TV if it has saved credentials
        const credentials = await this._loadCredentials();
        const savedCred = credentials.find((c: TVCredentials) => c.ip === this.defaultTV!.ip);

        if (savedCred) {
          console.error('[lg-remote] 🔗 Auto-connecting to default TV...');
          const connectResult = await this.connect({ ip: this.defaultTV.ip });

          if (connectResult.success) {
            console.error('[lg-remote] ✅ Auto-connected successfully');
          }
        } else {
          console.error('[lg-remote] ℹ️  Default TV not paired. Call connect() to pair.');
        }
      } else {
        console.error('[lg-remote] ⚠️  No TVs found on network');
      }
    } catch (error: any) {
      console.error(`[lg-remote] ⚠️  Auto-discovery error: ${error.message}`);
    } finally {
      this.discoveryInProgress = false;
    }
  }
}
