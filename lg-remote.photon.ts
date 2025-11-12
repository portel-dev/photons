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
 * @stateful true
 * @idleTimeout 600000
 *
 * @version 1.0.0
 * @author Photon (based on pokemote by mithileshchellappan)
 * @license MIT
 */

import { WebSocket } from 'ws';
import { createSocket } from 'dgram';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';

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
  error?: string;
}

interface DiscoveredTV {
  ip: string;
  name?: string;
  location?: string;
}

const REGISTRATION_MANIFEST = {
  forcePairing: false,
  pairingType: "PIN",
  manifest: {
    manifestVersion: 1,
    appVersion: '1.1',
    signed: {
      created: '20140509',
      appId: 'com.lge.test',
      vendorId: 'com.lge',
      localizedAppNames: {
        '': 'LG Remote App',
        'en-US': 'LG Remote App',
        'en-GB': 'LG Remote App',
        'en-IN': 'LG Remote App'
      },
      localizedVendorNames: {
        '': 'LG Electronics',
        'en-US': 'LG Electronics',
        'en-GB': 'LG Electronics'
      },
      permissions: [
        'TEST_SECURE',
        'CONTROL_INPUT_TEXT',
        'CONTROL_MOUSE_AND_KEYBOARD',
        'CONTROL_INPUT_POINTER',
        'READ_INSTALLED_APPS',
        'READ_LGE_SDX',
        'READ_NOTIFICATIONS',
        'SEARCH',
        'WRITE_SETTINGS',
        'WRITE_NOTIFICATION_ALERT',
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
      'CONTROL_INPUT_TEXT',
      'CONTROL_MOUSE_AND_KEYBOARD',
      'CONTROL_POWER',
      'READ_APP_STATUS',
      'READ_CURRENT_CHANNEL',
      'READ_INPUT_DEVICE_LIST',
      'READ_NETWORK_STATE',
      'READ_RUNNING_APPS',
      'READ_INSTALLED_APPS',
      'READ_TV_CHANNEL_LIST',
      'WRITE_NOTIFICATION_TOAST',
      'READ_POWER_STATE',
      'READ_COUNTRY_INFO',
      'READ_SETTINGS',
      'CONTROL_TV_SCREEN',
      'CONTROL_TV_STANBY',
      'CONTROL_FAVORITE_GROUP',
      'CONTROL_USER_INFO',
      'CHECK_BLUETOOTH_DEVICE',
      'CONTROL_BLUETOOTH',
      'CONTROL_TIMER_INFO',
      'STB_INTERNAL_CONNECTION',
      'CONTROL_RECORDING',
      'READ_RECORDING_STATE',
      'WRITE_RECORDING_LIST',
      'READ_RECORDING_LIST',
      'READ_RECORDING_SCHEDULE',
      'WRITE_RECORDING_SCHEDULE',
      'READ_STORAGE_DEVICE_LIST',
      'READ_TV_PROGRAM_INFO',
      'CONTROL_BOX_CHANNEL',
      'READ_TV_ACR_AUTH_TOKEN',
      'READ_TV_CONTENT_STATE',
      'READ_TV_CURRENT_TIME',
      'ADD_LAUNCHER_CHANNEL',
      'SET_CHANNEL_SKIP',
      'RELEASE_CHANNEL_SKIP',
      'CONTROL_CHANNEL_BLOCK',
      'DELETE_SELECT_CHANNEL',
      'CONTROL_CHANNEL_GROUP',
      'SCAN_TV_CHANNELS',
      'CONTROL_TV_POWER',
      'CONTROL_WOL',
    ],
    signatures: [
      {
        signatureVersion: 1,
        signature:
          'eyJhbGdvcml0aG0iOiJSU0EtU0hBMjU2Iiwia2V5SWQiOiJ0ZXN0LXNpZ25pbmctY2VydCIsInNpZ25hdHVyZVZlcnNpb24iOjF9.hrVRgjCwXVvE2OOSpDZ58hR+59aFNwYDyjQgKk3auukd7pcegmE2CzPCa0bJ0ZsRAcKkCTJrWo5iDzNhMBWRyaMOv5zWSrthlf7G128qvIlpMT0YNY+n/FaOHE73uLrS/g7swl3/qH/BGFG2Hu4RlL48eb3lLKqTt2xKHdCs6Cd4RMfJPYnzgvI4BNrFUKsjkcu+WD4OO2A27Pq1n50cMchmcaXadJhGrOqH5YmHdOCj5NSHzJYrsW0HPlpuAx/ECMeIZYDh6RMqaFM2DXzdKX9NmmyqzJ3o/0lkk/N97gfVRLW5hA29yeAwaCViZNCP8iC9aO0q9fQojoa7NQnAtw==',
      },
    ],
  },
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
  private initPromise?: Promise<void>;
  private registrationConfirmed = false;
  private lastRegistrationTime = 0;

  constructor(credentials_file?: string) {
    // Default to absolute path in .photon directory
    if (credentials_file) {
      this.credentialsFile = credentials_file;
    } else {
      const photonDir = path.join(os.homedir(), '.photon');
      this.credentialsFile = path.join(photonDir, 'lg-tv-credentials.json');
    }
  }

  async onInitialize() {
    console.error('[lg-remote] ✅ Initialized');
    console.error(`[lg-remote] Credentials file: ${this.credentialsFile}`);

    // Start background discovery (non-blocking in MCP, but we track it for CLI)
    this.initPromise = this._autoDiscoverAndConnect();
  }

  /**
   * Discover LG TVs on the network using SSDP
   * @param timeout Discovery timeout in seconds (default: 5)
   * @format table
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
   * @format table
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

      console.error(`[lg-remote] Connecting to ${url} (secure: ${secure})`);

      // Close existing connection if any
      if (this.ws) {
        this.ws.close();
      }

      this.currentTVIP = targetIP;
      this.registrationConfirmed = false;

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

            // Wait for registration confirmation
            const checkInterval = setInterval(() => {
              if (this.registrationConfirmed) {
                clearInterval(checkInterval);
                resolve({
                  success: true,
                  message: 'Connected using saved credentials',
                  ip: targetIP,
                  paired: true,
                });
              }
            }, 100);

            // Timeout after 5 seconds
            setTimeout(() => {
              clearInterval(checkInterval);
              if (!this.registrationConfirmed) {
                resolve({
                  success: false,
                  error: 'Registration timeout. TV may have rejected saved credentials.',
                });
              }
            }, 5000);
          } else {
            // Start PIN pairing process
            this._sendRegister();

            console.error('[lg-remote] 📺 TV will show a 6-digit PIN...');
            console.error('[lg-remote] ℹ️  Call pair({ pin: "XXXXXX" }) with the PIN to complete pairing');

            // Wait for PIN prompt
            (this as any)._pairingResolve = resolve;
            (this as any)._pairingIP = targetIP;
            (this as any)._pairingSecure = secure;

            // Timeout after 60 seconds
            setTimeout(() => {
              if ((this as any)._pairingResolve) {
                resolve({
                  success: false,
                  error: 'Pairing timeout.',
                });
                (this as any)._pairingResolve = null;
              }
            }, 60000);
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
          this.registrationConfirmed = false;
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
   * @param pin The 6-digit PIN shown on TV (required for new pairing)
   * @param name Optional name for the TV
   */
  async pair(params?: { pin?: string; name?: string }) {
    if (!this.currentTVIP) {
      return {
        success: false,
        error: 'Not connected to any TV. Call connect() first.',
      };
    }

    // If we already have a client key, just save it
    if (this.currentClientKey) {
      this._saveCredentials({
        ip: this.currentTVIP!,
        clientKey: this.currentClientKey,
        name: params?.name,
        lastUsed: Date.now(),
      });

      return {
        success: true,
        message: 'Pairing completed and credentials saved',
        ip: this.currentTVIP,
      };
    }

    // If PIN provided, submit it
    if (params?.pin) {
      const pinRequestId = `pin_${Date.now()}_${Math.random()}`;

      console.error('[lg-remote] 🔑 Submitting PIN...');

      // Use the _request method to properly handle errors
      return new Promise<any>((resolve) => {
        const timeout = setTimeout(() => {
          this.pendingRequests.delete(pinRequestId);
          if (!this.currentClientKey) {
            resolve({
              success: false,
              error: 'Pairing timeout. TV did not respond.',
            });
          }
        }, 30000);

        this.pendingRequests.set(pinRequestId, {
          resolve: (data: any) => {
            clearTimeout(timeout);

            // After PIN is accepted, wait for registration
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

            // Timeout after 10 seconds if client-key not received
            setTimeout(() => {
              clearInterval(checkInterval);
              if (!this.currentClientKey) {
                resolve({
                  success: false,
                  error: 'PIN accepted but pairing not completed.',
                });
              }
            }, 10000);
          },
          reject: (error: Error) => {
            clearTimeout(timeout);
            resolve({
              success: false,
              error: error.message || 'PIN rejected by TV',
            });
          },
          timeout,
        });

        // Send PIN request
        this.ws?.send(JSON.stringify({
          type: 'request',
          id: pinRequestId,
          uri: 'ssap://pairing/setPin',
          payload: { pin: params.pin },
        }));
      });
    }

    // No PIN provided and no client key yet
    return {
      success: false,
      error: 'PIN required. Call pair({ pin: "123456" }) with the 6-digit PIN shown on TV.',
    };
  }

  /**
   * Disconnect from the current TV
   * @format none
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
    this.registrationConfirmed = false;

    return {
      success: true,
      message: 'Disconnected',
    };
  }

  /**
   * List discovered and saved TVs
   * @param refresh If true, re-discover TVs on network (default: false)
   * @format table
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
   * @format table
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
   * @param level Volume level (0-100), "+N" to increase by N, "-N" to decrease by N, or omit to get current
   * @format table
   */
  async volume(params?: { level?: number | string } | number | string) {
    // Support multiple formats: volume(50), volume("+5"), volume({ level: 50 })
    const level = typeof params === 'object' ? params?.level : params;

    // Handle relative adjustments: +N or -N
    if (typeof level === 'string' && (level.startsWith('+') || level.startsWith('-'))) {
      const delta = parseInt(level);

      if (isNaN(delta)) {
        return {
          success: false,
          error: `Invalid volume delta: ${level}`,
        };
      }

      // Get current volume
      const currentResult = await this._request('ssap://audio/getVolume');
      if (!currentResult.success || !currentResult.data || currentResult.data.volume === undefined) {
        return {
          success: false,
          error: 'Failed to get current volume',
        };
      }

      // Calculate new volume
      const currentVolume = currentResult.data.volume;
      const newVolume = Math.max(0, Math.min(100, currentVolume + delta));

      // Set the new volume
      await this._request('ssap://audio/setVolume', { volume: newVolume });

      // Return current volume info
      return this._request('ssap://audio/getVolume');
    }

    // Handle absolute volume
    if (level !== undefined) {
      const numLevel = typeof level === 'string' ? parseInt(level) : level;

      if (isNaN(numLevel)) {
        return {
          success: false,
          error: `Invalid volume level: ${level}`,
        };
      }

      // Set the volume
      await this._request('ssap://audio/setVolume', { volume: numLevel });

      // Return current volume info
      return this._request('ssap://audio/getVolume');
    }

    // Get current volume
    return this._request('ssap://audio/getVolume');
  }

  /**
   * Toggle mute
   * @param mute True to mute, false to unmute (optional - omit to toggle)
   * @format table
   */
  async mute(params?: { mute?: boolean } | boolean) {
    // Support both mute(true) and mute({ mute: true })
    const muteValue = typeof params === 'boolean' ? params : params?.mute;

    if (muteValue !== undefined) {
      // Set mute state
      await this._request('ssap://audio/setMute', { mute: muteValue });

      // Return current volume info
      return this._request('ssap://audio/getVolume');
    }

    // If no param, toggle by getting current state first
    const currentResult = await this._request('ssap://audio/getVolume');
    if (!currentResult.success || !currentResult.data) {
      return {
        success: false,
        error: 'Failed to get current mute state',
      };
    }

    const currentMuted = currentResult.data.muted || false;
    const newMuted = !currentMuted;

    // Set new mute state
    await this._request('ssap://audio/setMute', { mute: newMuted });

    // Return current volume info
    return this._request('ssap://audio/getVolume');
  }

  /**
   * Turn TV off
   * @format none
   */
  async off() {
    return this._request('ssap://system/turnOff');
  }

  /**
   * Show a notification toast on TV
   * @param message Notification message
   * @format none
   */
  async notify(params: { message: string } | string) {
    // Support both notify("Hello") and notify({ message: "Hello" })
    const message = typeof params === 'string' ? params : params.message;

    return this._request('ssap://system.notifications/createToast', { message });
  }

  /**
   * Get current app or launch an app
   * @param id App ID to launch (e.g., "netflix", "youtube.leanback.v4"), or omit to get current
   * @format table
   */
  async app(params?: { id?: string } | string) {
    // Support both app("netflix") and app({ id: "netflix" })
    const id = typeof params === 'string' ? params : params?.id;

    if (id) {
      // Launch app
      await this._request('ssap://system.launcher/launch', { id });

      // Return current app info
      return this._request('ssap://com.webos.applicationManager/getForegroundAppInfo');
    }

    // Get current app
    return this._request('ssap://com.webos.applicationManager/getForegroundAppInfo');
  }

  /**
   * List all installed apps
   * @format tree
   */
  async apps() {
    return this._request('ssap://com.webos.applicationManager/listApps');
  }

  /**
   * Get current channel or switch to a channel
   * @param number Channel number to switch to, "+1" for next, "-1" for previous, or omit to get current
   * @format table
   */
  async channel(params?: { number?: string } | string) {
    // Support multiple formats: channel("5"), channel("+1")
    const number = typeof params === 'string' ? params : params?.number;

    let result: any;

    if (number === '+1' || number === '1') {
      // Channel up
      await this._request('ssap://tv/channelUp');

      // Return current channel
      result = await this._request('ssap://tv/getCurrentChannel');
    } else if (number === '-1') {
      // Channel down
      await this._request('ssap://tv/channelDown');

      // Return current channel
      result = await this._request('ssap://tv/getCurrentChannel');
    } else if (number) {
      // Switch to specific channel
      await this._request('ssap://tv/openChannel', { channelNumber: number });

      // Return current channel
      result = await this._request('ssap://tv/getCurrentChannel');
    } else {
      // Get current channel
      result = await this._request('ssap://tv/getCurrentChannel');
    }

    // If there was an error, add context about current input
    if (result && result.success === false) {
      const appResult = await this._request('ssap://com.webos.applicationManager/getForegroundAppInfo');

      if (appResult.success && appResult.data?.appId) {
        const appId = appResult.data.appId;
        let inputName = 'external input';

        // Map app IDs to friendly names
        if (appId.includes('hdmi')) {
          const hdmiNum = appId.match(/hdmi(\d+)/i)?.[1];
          inputName = hdmiNum ? `HDMI${hdmiNum}` : 'HDMI';
        } else if (appId.includes('av')) {
          const avNum = appId.match(/av(\d+)/i)?.[1];
          inputName = avNum ? `AV${avNum}` : 'AV';
        } else if (appId.includes('component')) {
          const compNum = appId.match(/component(\d+)/i)?.[1];
          inputName = compNum ? `Component${compNum}` : 'Component';
        }

        return {
          success: false,
          error: `TV channels not available. Currently on ${inputName}. Switch to a TV tuner input to access channels.`,
        };
      }
    }

    return result;
  }

  /**
   * List all available channels
   * @format tree
   */
  async channels() {
    const result = await this._request('ssap://tv/getChannelList');

    // If there was an error, add context about current input
    if (result && result.success === false) {
      const appResult = await this._request('ssap://com.webos.applicationManager/getForegroundAppInfo');

      if (appResult.success && appResult.data?.appId) {
        const appId = appResult.data.appId;
        let inputName = 'external input';

        // Map app IDs to friendly names
        if (appId.includes('hdmi')) {
          const hdmiNum = appId.match(/hdmi(\d+)/i)?.[1];
          inputName = hdmiNum ? `HDMI${hdmiNum}` : 'HDMI';
        } else if (appId.includes('av')) {
          const avNum = appId.match(/av(\d+)/i)?.[1];
          inputName = avNum ? `AV${avNum}` : 'AV';
        } else if (appId.includes('component')) {
          const compNum = appId.match(/component(\d+)/i)?.[1];
          inputName = compNum ? `Component${compNum}` : 'Component';
        }

        return {
          success: false,
          error: `TV channels not available. Currently on ${inputName}. Switch to a TV tuner input to access channels.`,
        };
      }
    }

    return result;
  }

  /**
   * Switch to an input
   * @param id Input ID to switch to (e.g., "HDMI_1", "HDMI_2")
   * @format table
   */
  async input(params: { id: string } | string) {
    // Support both input("HDMI_1") and input({ id: "HDMI_1" })
    const id = typeof params === 'string' ? params : params.id;

    // Switch input
    await this._request('ssap://tv/switchInput', { inputId: id });

    // Return input list (TV doesn't have a "get current input" endpoint)
    return this._request('ssap://tv/getExternalInputList');
  }

  /**
   * List all available inputs
   * @format tree
   */
  async inputs() {
    return this._request('ssap://tv/getExternalInputList');
  }

  /**
   * Play media
   * @format none
   */
  async play() {
    return this._request('ssap://media.controls/play');
  }

  /**
   * Pause media
   * @format none
   */
  async pause() {
    return this._request('ssap://media.controls/pause');
  }

  /**
   * Stop media
   * @format none
   */
  async stop() {
    return this._request('ssap://media.controls/stop');
  }

  /**
   * Rewind media
   * @format none
   */
  async rewind() {
    return this._request('ssap://media.controls/rewind');
  }

  /**
   * Fast forward media
   * @format none
   */
  async forward() {
    return this._request('ssap://media.controls/fastForward');
  }

  /**
   * Send remote button press or list supported buttons
   * @param button Button name (omit or use 'all' to list all supported buttons)
   *
   * Navigation: HOME, BACK, EXIT, UP, DOWN, LEFT, RIGHT, ENTER, CLICK
   * Colors: RED, GREEN, YELLOW, BLUE
   * Channel: CHANNEL_UP, CHANNEL_DOWN
   * Volume: VOLUME_UP, VOLUME_DOWN
   * Media: PLAY, PAUSE, STOP, REWIND, FAST_FORWARD
   * Other: ASTERISK
   */
  async button(params?: {
    button?: 'HOME' | 'BACK' | 'EXIT'
          | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'ENTER' | 'CLICK'
          | 'RED' | 'GREEN' | 'YELLOW' | 'BLUE'
          | 'CHANNEL_UP' | 'CHANNEL_DOWN'
          | 'VOLUME_UP' | 'VOLUME_DOWN'
          | 'PLAY' | 'PAUSE' | 'STOP' | 'REWIND' | 'FAST_FORWARD'
          | 'ASTERISK'
          | 'all'
  }) {
    const button = params?.button;

    // List all supported buttons
    if (button === 'all' || !button) {
      return {
        success: true,
        buttons: [
          'HOME', 'BACK', 'EXIT', 'UP', 'DOWN', 'LEFT', 'RIGHT', 'ENTER', 'CLICK',
          'RED', 'GREEN', 'YELLOW', 'BLUE',
          'CHANNEL_UP', 'CHANNEL_DOWN', 'VOLUME_UP', 'VOLUME_DOWN',
          'PLAY', 'PAUSE', 'STOP', 'REWIND', 'FAST_FORWARD', 'ASTERISK'
        ],
        message: 'List of supported remote control buttons'
      };
    }

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
  async systemInfo() {
    return this._request('luna://com.webos.service.tv.systemproperty/getSystemInfo', {
      keys: ['modelName', 'firmwareVersion', 'sdkVersion', 'UHD'],
    });
  }

  /**
   * Get current software/firmware information
   */
  async softwareInfo() {
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

    console.error(`[lg-remote] Sending registration${clientKey ? ' with saved client-key' : ' (new pairing)'}`);

    if (this.ws) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private _handleMessage(data: string) {
    try {
      const message: TVMessage = JSON.parse(data);

      // Debug logging
      console.error(`[lg-remote] TV message: ${message.type}${message.id ? ` (${message.id})` : ''}`);
      console.error(`[lg-remote] Full message: ${JSON.stringify(message)}`);

      // Handle PIN pairing flow
      if (message.type === 'response' && message.payload?.pairingType === 'PIN' && (this as any)._pairingResolve) {
        console.error('[lg-remote] 🔑 PIN is displayed on TV');
        console.error('[lg-remote] ℹ️  Call pair({ pin: "XXXXXX" }) with the 6-digit PIN to complete pairing');

        // Resolve connect() - user needs to call pair() with PIN
        (this as any)._pairingResolve({
          success: true,
          message: 'TV is ready for pairing. Call pair({ pin: "XXXXXX" }) with the 6-digit PIN shown on TV.',
          ip: (this as any)._pairingIP,
          paired: false,
          waitingForPin: true,
        });

        (this as any)._pairingResolve = null;
        return;
      }

      // Handle registration response (after PIN is accepted)
      if (message.type === 'registered') {
        this.registrationConfirmed = true;
        this.lastRegistrationTime = Date.now();
        if (message.payload?.['client-key']) {
          this.currentClientKey = message.payload['client-key'];
        }
        console.error(`[lg-remote] Registration confirmed, client-key: ${this.currentClientKey ? 'present' : 'missing'}`);

        // If we're in PIN pairing flow, save and resolve
        if ((this as any)._pairingResolve && this.currentClientKey) {
          this._saveCredentials({
            ip: (this as any)._pairingIP,
            clientKey: this.currentClientKey,
            secure: (this as any)._pairingSecure,
            lastUsed: Date.now(),
          });

          (this as any)._pairingResolve({
            success: true,
            message: 'Connected and paired successfully',
            ip: (this as any)._pairingIP,
            paired: true,
          });

          (this as any)._pairingResolve = null;
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
        const errorMsg = message.error || message.payload?.error || 'Unknown error';
        console.error(`[lg-remote] TV error: ${errorMsg}`);
        const pending = this.pendingRequests.get(message.id);
        if (pending) {
          clearTimeout(pending.timeout);
          this.pendingRequests.delete(message.id);
          // Pass the raw error - let individual methods provide context
          pending.reject(new Error(errorMsg));
        }
      }
    } catch (error) {
      // Ignore parse errors
    }
  }

  private async _ensureReady(): Promise<void> {
    // Wait for initialization to complete if in progress
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  private async _request(uri: string, payload?: any): Promise<any> {
    // Wait for auto-discovery to complete
    await this._ensureReady();

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return {
        success: false,
        error: 'Not connected to TV',
      };
    }

    // Wait a bit after registration to ensure TV processes permissions
    if (this.registrationConfirmed && Date.now() - this.lastRegistrationTime < 500) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return new Promise((resolve, reject) => {
      const id = `req_${Date.now()}_${Math.random()}`;
      const message: TVMessage = {
        type: 'request',
        id,
        uri,
        payload: payload || {},
      };

      console.error(`[lg-remote] Sending request: ${uri}, payload: ${JSON.stringify(payload)}`);

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

  private async _autoDiscoverAndConnect(): Promise<void> {
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
