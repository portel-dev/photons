/**
 * Google TV Remote - Control Google TV and Android TV devices
 *
 * Provides comprehensive control of Google TV / Android TV devices via network.
 * Uses the Android TV Remote protocol v2 (same as Google TV mobile app).
 * Supports discovery, pairing, media control, app management, and more.
 *
 * Common use cases:
 * - Control: "Turn off the TV", "Set volume to 50"
 * - Media: "Play/pause the current content"
 * - Apps: "Launch Netflix", "Open YouTube"
 * - Navigation: "Press home", "Go back"
 *
 * Example: connect({ ip: "192.168.1.100" })  // Will prompt for pairing code if needed
 *
 * Configuration:
 * - credentials_file: Path to store TV credentials (optional, default: "google-tv-credentials.json")
 *
 * Dependencies are auto-installed on first run.
 *
 * @dependencies androidtv-remote@^1.0.7
 * @stateful true
 * @idleTimeout 600000
 *
 * @version 1.0.0
 * @author Photon
 * @license MIT
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as dgram from 'dgram';

// Dynamic import for androidtv-remote (ESM compatibility)
let AndroidRemote: any;
let RemoteKeyCode: any;
let RemoteDirection: any;

interface TVCredentials {
  ip: string;
  cert: any;
  name?: string;
  lastUsed?: number;
}

interface DiscoveredTV {
  ip: string;
  name?: string;
}

// Android KeyEvent codes for remote control
const KEY_CODES = {
  // Navigation
  DPAD_UP: 19,
  DPAD_DOWN: 20,
  DPAD_LEFT: 21,
  DPAD_RIGHT: 22,
  DPAD_CENTER: 23,
  ENTER: 66,
  BACK: 4,
  HOME: 3,
  MENU: 82,

  // Media controls
  MEDIA_PLAY: 126,
  MEDIA_PAUSE: 127,
  MEDIA_PLAY_PAUSE: 85,
  MEDIA_STOP: 86,
  MEDIA_NEXT: 87,
  MEDIA_PREVIOUS: 88,
  MEDIA_REWIND: 89,
  MEDIA_FAST_FORWARD: 90,

  // Volume
  VOLUME_UP: 24,
  VOLUME_DOWN: 25,
  VOLUME_MUTE: 164,

  // Power
  POWER: 26,
  TV_POWER: 177,
  SLEEP: 223,
  WAKEUP: 224,

  // TV-specific
  TV_INPUT: 178,
  CHANNEL_UP: 166,
  CHANNEL_DOWN: 167,
  INFO: 165,
  GUIDE: 172,
  DVR: 173,
  BOOKMARK: 174,
  CAPTIONS: 175,
  SETTINGS: 176,

  // Numbers
  NUM_0: 7,
  NUM_1: 8,
  NUM_2: 9,
  NUM_3: 10,
  NUM_4: 11,
  NUM_5: 12,
  NUM_6: 13,
  NUM_7: 14,
  NUM_8: 15,
  NUM_9: 16,

  // Colors (for some remotes)
  RED: 183,
  GREEN: 184,
  YELLOW: 185,
  BLUE: 186,
} as const;

export default class GoogleTV {
  private credentialsFile: string;
  private remote?: any;
  private currentTVIP?: string;
  private isConnected = false;
  private isPairing = false;
  private discoveredTVs: DiscoveredTV[] = [];
  private currentVolume = 0;
  private currentMaxVolume = 100;
  private isMuted = false;
  private currentApp = '';
  private isPoweredOn = true;

  constructor(credentials_file?: string) {
    if (credentials_file) {
      this.credentialsFile = credentials_file;
    } else {
      const photonDir = path.join(os.homedir(), '.photon');
      this.credentialsFile = path.join(photonDir, 'google-tv-credentials.json');
    }
  }

  async onInitialize() {
    // Dynamically import androidtv-remote
    try {
      const module = await import('androidtv-remote');
      // Module exports: { AndroidRemote, RemoteDirection, RemoteKeyCode, default }
      AndroidRemote = module.AndroidRemote;
      RemoteKeyCode = module.RemoteKeyCode;
      RemoteDirection = module.RemoteDirection;
      console.error('[google-tv] ✅ Initialized');
      console.error(`[google-tv] Credentials file: ${this.credentialsFile}`);
    } catch (error: any) {
      console.error(`[google-tv] ⚠️ Failed to load androidtv-remote: ${error.message}`);
    }
  }

  /**
   * Discover Google TV / Android TV devices on the network using mDNS
   * @param timeout Discovery timeout in seconds (default: 5)
   * @format table
   */
  async discover(params?: { timeout?: number }) {
    const timeout = (params?.timeout || 5) * 1000;

    return new Promise<any>((resolve) => {
      const socket = dgram.createSocket('udp4');
      const discovered = new Map<string, DiscoveredTV>();

      // mDNS query for Android TV remote service
      const query = Buffer.from([
        0x00, 0x00, // Transaction ID
        0x00, 0x00, // Flags (standard query)
        0x00, 0x01, // Questions: 1
        0x00, 0x00, // Answer RRs
        0x00, 0x00, // Authority RRs
        0x00, 0x00, // Additional RRs
        // Query for _androidtvremote2._tcp.local
        0x11, ...Buffer.from('_androidtvremote2'),
        0x04, ...Buffer.from('_tcp'),
        0x05, ...Buffer.from('local'),
        0x00, // Null terminator
        0x00, 0x0c, // Type: PTR
        0x00, 0x01, // Class: IN
      ]);

      socket.on('message', (msg, rinfo) => {
        // Parse mDNS response (simplified)
        const ip = rinfo.address;
        if (!discovered.has(ip) && ip !== '0.0.0.0') {
          // Try to extract device name from response
          const msgStr = msg.toString('utf8', 12);
          let name: string | undefined;

          // Look for readable device name in the response
          const match = msgStr.match(/([A-Za-z0-9\-_ ]+(?:TV|Chromecast|Shield|Fire)[A-Za-z0-9\-_ ]*)/i);
          if (match) {
            name = match[1].trim();
          }

          discovered.set(ip, { ip, name });
        }
      });

      socket.on('error', (err) => {
        console.error(`[google-tv] Discovery error: ${err.message}`);
      });

      socket.bind(0, () => {
        socket.setMulticastTTL(255);
        socket.addMembership('224.0.0.251');
        socket.send(query, 0, query.length, 5353, '224.0.0.251');
      });

      setTimeout(() => {
        socket.close();
        const devices = Array.from(discovered.values());
        this.discoveredTVs = devices;

        if (devices.length === 0) {
          resolve({
            success: false,
            message: 'No devices found',
            hint: 'Ensure your TV has "Android TV Remote Service" enabled.',
          });
        } else {
          // Return devices array directly for proper table formatting
          resolve(devices);
        }
      }, timeout);
    });
  }

  /**
   * Connect to a Google TV / Android TV device
   * Uses generator pattern - yields for pairing code input when needed
   *
   * @param ip TV IP address (required for first connection)
   * @param name Optional friendly name for the TV
   * @param pairing_code Pre-provided pairing code (for REST APIs)
   * @format table
   */
  async *connect(params: { ip: string; name?: string; pairing_code?: string } | string) {
    const ip = typeof params === 'string' ? params : params.ip;
    const name = typeof params === 'object' ? params.name : undefined;
    const preProvidedCode = typeof params === 'object' ? params.pairing_code : undefined;

    if (!AndroidRemote) {
      return {
        success: false,
        error: 'androidtv-remote module not loaded. Check dependencies.',
      };
    }

    try {
      // Try to load existing credentials
      const credentials = await this._loadCredentials();
      const existingCred = credentials.find((c: TVCredentials) => c.ip === ip);

      const options: any = {
        pairing_port: 6467,
        remote_port: 6466,
        name: 'photon-google-tv',
      };

      if (existingCred?.cert) {
        options.cert = existingCred.cert;
        console.error('[google-tv] Using saved credentials');
      }

      this.remote = new AndroidRemote(ip, options);
      this.currentTVIP = ip;

      // Set up event handlers
      this._setupEventHandlers();

      // For new pairing, we need to get the code from user
      if (!existingCred?.cert) {
        // Wait for TV to show the pairing code
        const secretPromise = new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout waiting for TV to show pairing code. Is the TV on?'));
          }, 30000);

          this.remote.on('secret', () => {
            clearTimeout(timeout);
            console.error('[google-tv] 📺 TV is showing a pairing code');
            resolve();
          });

          this.remote.on('error', (error: Error) => {
            clearTimeout(timeout);
            reject(error);
          });
        });

        // Start connection
        this.remote.start();

        // Wait for TV to show the code
        await secretPromise;

        // YIELD: Get the pairing code from user
        // Runtime will handle this based on protocol:
        // - CLI: readline prompt
        // - MCP: elicitation
        // - REST: use pre-provided pairing_code param
        // - Fallback: native OS dialog
        const code: string = preProvidedCode || (yield {
          prompt: 'Enter the 6-digit pairing code shown on TV:',
          type: 'text',
          id: 'pairing_code',
          pattern: '^[0-9A-Fa-f]{6}$',
          required: true,
        });

        if (!code) {
          return {
            success: false,
            error: 'Pairing code is required',
          };
        }

        // Send the code and wait for ready
        console.error('[google-tv] 🔑 Sending pairing code...');

        const readyPromise = new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Pairing timeout. Code may be incorrect.'));
          }, 30000);

          this.remote.on('ready', () => {
            clearTimeout(timeout);
            resolve();
          });

          this.remote.on('error', (error: Error) => {
            clearTimeout(timeout);
            reject(error);
          });
        });

        this.remote.sendCode(code);
        await readyPromise;

        // Save credentials
        console.error('[google-tv] ✅ Paired successfully');
        this.isConnected = true;
        this.isPairing = false;

        const cert = this.remote.getCertificate();
        await this._saveCredentials({
          ip,
          cert,
          name,
          lastUsed: Date.now(),
        });

        return {
          success: true,
          message: 'Connected and paired successfully',
          ip,
          paired: true,
        };
      }

      // Has existing credentials - connect and wait for ready
      const readyPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 15000);

        this.remote.on('ready', () => {
          clearTimeout(timeout);
          resolve();
        });

        this.remote.on('error', (error: Error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      this.remote.start();
      await readyPromise;

      console.error('[google-tv] ✅ Connected');
      this.isConnected = true;

      await this._saveCredentials({
        ...existingCred,
        lastUsed: Date.now(),
      });

      return {
        success: true,
        message: 'Connected using saved credentials',
        ip,
        paired: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Disconnect from the TV
   * @format none
   */
  async disconnect() {
    if (this.remote) {
      try {
        await this.remote.stop?.();
      } catch {
        // Ignore errors on disconnect
      }
      this.remote = undefined;
    }

    this.isConnected = false;
    this.isPairing = false;
    this.currentTVIP = undefined;

    return {
      success: true,
      message: 'Disconnected',
    };
  }

  /**
   * Get current connection status
   * @format table
   */
  async status() {
    return {
      success: true,
      connected: this.isConnected,
      ip: this.currentTVIP,
      poweredOn: this.isPoweredOn,
      volume: this.currentVolume,
      maxVolume: this.currentMaxVolume,
      muted: this.isMuted,
      currentApp: this.currentApp || undefined,
    };
  }

  /**
   * List discovered and saved TVs
   * @param refresh If true, re-discover TVs on network (default: false)
   * @format table
   */
  async list(params?: { refresh?: boolean }) {
    if (params?.refresh) {
      await this.discover({ timeout: 5 });
    }

    const credentials = await this._loadCredentials();
    const credMap = new Map(credentials.map((c: TVCredentials) => [c.ip, c]));

    const allTVs = new Map<string, any>();

    // Add discovered TVs
    for (const tv of this.discoveredTVs) {
      const cred = credMap.get(tv.ip);
      allTVs.set(tv.ip, {
        ip: tv.ip,
        name: tv.name || cred?.name,
        paired: !!cred,
        lastUsed: cred?.lastUsed,
        isConnected: this.currentTVIP === tv.ip,
      });
    }

    // Add saved TVs not discovered
    for (const cred of credentials) {
      if (!allTVs.has(cred.ip)) {
        allTVs.set(cred.ip, {
          ip: cred.ip,
          name: cred.name,
          paired: true,
          lastUsed: cred.lastUsed,
          discovered: false,
          isConnected: this.currentTVIP === cred.ip,
        });
      }
    }

    const devices = Array.from(allTVs.values()).sort((a, b) => {
      if (a.lastUsed && b.lastUsed) return b.lastUsed - a.lastUsed;
      if (a.lastUsed) return -1;
      if (b.lastUsed) return 1;
      return 0;
    });

    if (devices.length === 0) {
      return {
        success: false,
        message: 'No TVs found',
        hint: 'Use discover() to find TVs on your network',
      };
    }

    // Return devices array directly for proper table formatting
    return devices;
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
   * Get/set volume level
   * @param level Volume level (0-100), "+N" to increase by N, "-N" to decrease by N, or omit to get current
   * @format table
   */
  async volume(params?: { level?: number | string } | number | string) {
    const level = typeof params === 'object' ? params?.level : params;

    if (level !== undefined) {
      const result = await this._ensureConnected();
      if (!result.success) return result;

      // Handle relative adjustments
      if (typeof level === 'string' && (level.startsWith('+') || level.startsWith('-'))) {
        const delta = parseInt(level);
        if (isNaN(delta)) {
          return { success: false, error: `Invalid volume delta: ${level}` };
        }

        // Calculate steps needed
        const volumeStep = this.currentMaxVolume / 100;
        const steps = Math.abs(Math.round(delta / volumeStep));
        const key = delta > 0 ? KEY_CODES.VOLUME_UP : KEY_CODES.VOLUME_DOWN;

        for (let i = 0; i < steps; i++) {
          await this._sendKey(key);
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        return {
          success: true,
          volume: Math.max(0, Math.min(100, this.currentVolume + delta)),
          muted: this.isMuted,
        };
      }

      // Handle absolute volume
      const numLevel = typeof level === 'string' ? parseInt(level) : level;
      if (isNaN(numLevel)) {
        return { success: false, error: `Invalid volume level: ${level}` };
      }

      // Calculate relative change needed
      const delta = numLevel - this.currentVolume;
      const volumeStep = this.currentMaxVolume / 100;
      const steps = Math.abs(Math.round(delta / volumeStep));
      const key = delta > 0 ? KEY_CODES.VOLUME_UP : KEY_CODES.VOLUME_DOWN;

      for (let i = 0; i < steps; i++) {
        await this._sendKey(key);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      return {
        success: true,
        volume: numLevel,
        muted: this.isMuted,
      };
    }

    // Get current volume
    return {
      success: true,
      volume: this.currentVolume,
      maxVolume: this.currentMaxVolume,
      muted: this.isMuted,
    };
  }

  /**
   * Toggle mute
   * @param mute True to mute, false to unmute (optional - omit to toggle)
   * @format table
   */
  async mute(params?: { mute?: boolean } | boolean) {
    const result = await this._ensureConnected();
    if (!result.success) return result;

    const muteValue = typeof params === 'boolean' ? params : params?.mute;

    // If explicit value and matches current, no action needed
    if (muteValue !== undefined && muteValue === this.isMuted) {
      return {
        success: true,
        muted: this.isMuted,
        volume: this.currentVolume,
      };
    }

    await this._sendKey(KEY_CODES.VOLUME_MUTE);

    // Optimistic update
    const newMuted = muteValue !== undefined ? muteValue : !this.isMuted;

    return {
      success: true,
      muted: newMuted,
      volume: this.currentVolume,
    };
  }

  /**
   * Turn TV on (wake from sleep)
   * @format none
   */
  async on() {
    const result = await this._ensureConnected();
    if (!result.success) return result;

    await this._sendKey(KEY_CODES.WAKEUP);

    return {
      success: true,
      message: 'Wake signal sent',
    };
  }

  /**
   * Turn TV off (put to sleep)
   * @format none
   */
  async off() {
    const result = await this._ensureConnected();
    if (!result.success) return result;

    await this._sendKey(KEY_CODES.SLEEP);

    return {
      success: true,
      message: 'Sleep signal sent',
    };
  }

  /**
   * Toggle power
   * @format none
   */
  async power() {
    const result = await this._ensureConnected();
    if (!result.success) return result;

    await this._sendKey(KEY_CODES.POWER);

    return {
      success: true,
      message: 'Power toggle sent',
    };
  }

  /**
   * Launch an app via deep link
   * @param url App deep link URL (e.g., "https://www.netflix.com", "https://www.youtube.com")
   * @format table
   */
  async app(params: { url: string } | string) {
    const result = await this._ensureConnected();
    if (!result.success) return result;

    const url = typeof params === 'string' ? params : params.url;

    try {
      await this.remote.sendAppLink(url);

      return {
        success: true,
        message: `Launching ${url}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Launch popular streaming apps
   * @param name App name: netflix, youtube, disney, prime, hulu, hbo, spotify
   * @format table
   */
  async launch(params: {
    name: 'netflix' | 'youtube' | 'disney' | 'prime' | 'hulu' | 'hbo' | 'spotify' | 'plex'
  } | string) {
    const name = typeof params === 'string' ? params : params.name;

    const appUrls: Record<string, string> = {
      netflix: 'https://www.netflix.com',
      youtube: 'https://www.youtube.com',
      disney: 'https://www.disneyplus.com',
      prime: 'https://www.amazon.com/gp/video',
      hulu: 'https://www.hulu.com',
      hbo: 'https://www.max.com',
      spotify: 'https://open.spotify.com',
      plex: 'https://app.plex.tv',
    };

    const url = appUrls[name.toLowerCase()];
    if (!url) {
      return {
        success: false,
        error: `Unknown app: ${name}`,
        available: Object.keys(appUrls),
      };
    }

    return this.app(url);
  }

  /**
   * Play media
   * @format none
   */
  async play() {
    const result = await this._ensureConnected();
    if (!result.success) return result;

    await this._sendKey(KEY_CODES.MEDIA_PLAY);
    return { success: true };
  }

  /**
   * Pause media
   * @format none
   */
  async pause() {
    const result = await this._ensureConnected();
    if (!result.success) return result;

    await this._sendKey(KEY_CODES.MEDIA_PAUSE);
    return { success: true };
  }

  /**
   * Toggle play/pause
   * @format none
   */
  async playPause() {
    const result = await this._ensureConnected();
    if (!result.success) return result;

    await this._sendKey(KEY_CODES.MEDIA_PLAY_PAUSE);
    return { success: true };
  }

  /**
   * Stop media
   * @format none
   */
  async stop() {
    const result = await this._ensureConnected();
    if (!result.success) return result;

    await this._sendKey(KEY_CODES.MEDIA_STOP);
    return { success: true };
  }

  /**
   * Skip to next
   * @format none
   */
  async next() {
    const result = await this._ensureConnected();
    if (!result.success) return result;

    await this._sendKey(KEY_CODES.MEDIA_NEXT);
    return { success: true };
  }

  /**
   * Skip to previous
   * @format none
   */
  async previous() {
    const result = await this._ensureConnected();
    if (!result.success) return result;

    await this._sendKey(KEY_CODES.MEDIA_PREVIOUS);
    return { success: true };
  }

  /**
   * Rewind
   * @format none
   */
  async rewind() {
    const result = await this._ensureConnected();
    if (!result.success) return result;

    await this._sendKey(KEY_CODES.MEDIA_REWIND);
    return { success: true };
  }

  /**
   * Fast forward
   * @format none
   */
  async forward() {
    const result = await this._ensureConnected();
    if (!result.success) return result;

    await this._sendKey(KEY_CODES.MEDIA_FAST_FORWARD);
    return { success: true };
  }

  /**
   * Go to home screen
   * @format none
   */
  async home() {
    const result = await this._ensureConnected();
    if (!result.success) return result;

    await this._sendKey(KEY_CODES.HOME);
    return { success: true };
  }

  /**
   * Go back
   * @format none
   */
  async back() {
    const result = await this._ensureConnected();
    if (!result.success) return result;

    await this._sendKey(KEY_CODES.BACK);
    return { success: true };
  }

  /**
   * Select / Enter / OK
   * @format none
   */
  async select() {
    const result = await this._ensureConnected();
    if (!result.success) return result;

    await this._sendKey(KEY_CODES.DPAD_CENTER);
    return { success: true };
  }

  /**
   * Navigate up
   * @format none
   */
  async up() {
    const result = await this._ensureConnected();
    if (!result.success) return result;

    await this._sendKey(KEY_CODES.DPAD_UP);
    return { success: true };
  }

  /**
   * Navigate down
   * @format none
   */
  async down() {
    const result = await this._ensureConnected();
    if (!result.success) return result;

    await this._sendKey(KEY_CODES.DPAD_DOWN);
    return { success: true };
  }

  /**
   * Navigate left
   * @format none
   */
  async left() {
    const result = await this._ensureConnected();
    if (!result.success) return result;

    await this._sendKey(KEY_CODES.DPAD_LEFT);
    return { success: true };
  }

  /**
   * Navigate right
   * @format none
   */
  async right() {
    const result = await this._ensureConnected();
    if (!result.success) return result;

    await this._sendKey(KEY_CODES.DPAD_RIGHT);
    return { success: true };
  }

  /**
   * Open menu
   * @format none
   */
  async menu() {
    const result = await this._ensureConnected();
    if (!result.success) return result;

    await this._sendKey(KEY_CODES.MENU);
    return { success: true };
  }

  /**
   * Open settings
   * @format none
   */
  async settings() {
    const result = await this._ensureConnected();
    if (!result.success) return result;

    await this._sendKey(KEY_CODES.SETTINGS);
    return { success: true };
  }

  /**
   * Show info/details
   * @format none
   */
  async info() {
    const result = await this._ensureConnected();
    if (!result.success) return result;

    await this._sendKey(KEY_CODES.INFO);
    return { success: true };
  }

  /**
   * Channel up
   * @format none
   */
  async channelUp() {
    const result = await this._ensureConnected();
    if (!result.success) return result;

    await this._sendKey(KEY_CODES.CHANNEL_UP);
    return { success: true };
  }

  /**
   * Channel down
   * @format none
   */
  async channelDown() {
    const result = await this._ensureConnected();
    if (!result.success) return result;

    await this._sendKey(KEY_CODES.CHANNEL_DOWN);
    return { success: true };
  }

  /**
   * Switch TV input source
   * @format none
   */
  async input() {
    const result = await this._ensureConnected();
    if (!result.success) return result;

    await this._sendKey(KEY_CODES.TV_INPUT);
    return { success: true };
  }

  /**
   * Send remote button press or list supported buttons
   * @param button Button name (omit or use 'all' to list all supported buttons)
   *
   * Navigation: HOME, BACK, MENU, UP, DOWN, LEFT, RIGHT, SELECT, ENTER
   * Media: PLAY, PAUSE, PLAY_PAUSE, STOP, NEXT, PREVIOUS, REWIND, FORWARD
   * Volume: VOLUME_UP, VOLUME_DOWN, MUTE
   * Power: POWER, SLEEP, WAKEUP
   * TV: INPUT, CHANNEL_UP, CHANNEL_DOWN, INFO, GUIDE, SETTINGS
   * Colors: RED, GREEN, YELLOW, BLUE
   * Numbers: NUM_0 through NUM_9
   */
  async button(params?: {
    button?: keyof typeof KEY_CODES | 'all'
  } | string) {
    const button = typeof params === 'string' ? params : params?.button;

    if (button === 'all' || !button) {
      return {
        success: true,
        buttons: Object.keys(KEY_CODES),
        categories: {
          navigation: ['HOME', 'BACK', 'MENU', 'DPAD_UP', 'DPAD_DOWN', 'DPAD_LEFT', 'DPAD_RIGHT', 'DPAD_CENTER', 'ENTER'],
          media: ['MEDIA_PLAY', 'MEDIA_PAUSE', 'MEDIA_PLAY_PAUSE', 'MEDIA_STOP', 'MEDIA_NEXT', 'MEDIA_PREVIOUS', 'MEDIA_REWIND', 'MEDIA_FAST_FORWARD'],
          volume: ['VOLUME_UP', 'VOLUME_DOWN', 'VOLUME_MUTE'],
          power: ['POWER', 'TV_POWER', 'SLEEP', 'WAKEUP'],
          tv: ['TV_INPUT', 'CHANNEL_UP', 'CHANNEL_DOWN', 'INFO', 'GUIDE', 'DVR', 'BOOKMARK', 'CAPTIONS', 'SETTINGS'],
          colors: ['RED', 'GREEN', 'YELLOW', 'BLUE'],
          numbers: ['NUM_0', 'NUM_1', 'NUM_2', 'NUM_3', 'NUM_4', 'NUM_5', 'NUM_6', 'NUM_7', 'NUM_8', 'NUM_9'],
        },
        message: 'List of supported remote control buttons',
      };
    }

    const result = await this._ensureConnected();
    if (!result.success) return result;

    const buttonUpper = button.toUpperCase() as keyof typeof KEY_CODES;
    const keyCode = KEY_CODES[buttonUpper];

    if (keyCode === undefined) {
      return {
        success: false,
        error: `Unknown button: ${button}`,
        hint: 'Use button() without params to see available buttons',
      };
    }

    await this._sendKey(keyCode);

    return {
      success: true,
      message: `Button ${button} pressed`,
    };
  }

  /**
   * Send a number (0-9)
   * @param number The number to send (0-9)
   * @format none
   */
  async number(params: { number: number } | number) {
    const num = typeof params === 'number' ? params : params.number;

    if (num < 0 || num > 9) {
      return {
        success: false,
        error: 'Number must be between 0 and 9',
      };
    }

    const result = await this._ensureConnected();
    if (!result.success) return result;

    const keyCode = KEY_CODES[`NUM_${num}` as keyof typeof KEY_CODES];
    await this._sendKey(keyCode);

    return { success: true };
  }

  // Private methods

  private _setupEventHandlers() {
    if (!this.remote) return;

    this.remote.on('secret', () => {
      console.error('[google-tv] 🔑 TV is showing pairing code');
      this.isPairing = true;
    });

    this.remote.on('powered', (powered: boolean) => {
      console.error(`[google-tv] Power state: ${powered ? 'ON' : 'OFF'}`);
      this.isPoweredOn = powered;
    });

    this.remote.on('volume', (volume: { level: number; maximum: number; muted: boolean }) => {
      console.error(`[google-tv] Volume: ${volume.level}/${volume.maximum}, Muted: ${volume.muted}`);
      this.currentVolume = Math.round((volume.level / volume.maximum) * 100);
      this.currentMaxVolume = volume.maximum;
      this.isMuted = volume.muted;
    });

    this.remote.on('current_app', (app: string) => {
      console.error(`[google-tv] Current app: ${app}`);
      this.currentApp = app;
    });

    this.remote.on('ready', () => {
      console.error('[google-tv] ✅ Connection ready');
      this.isConnected = true;
      this.isPairing = false;
    });

    this.remote.on('error', (error: Error) => {
      console.error(`[google-tv] ❌ Error: ${error.message}`);
    });

    this.remote.on('close', () => {
      console.error('[google-tv] Connection closed');
      this.isConnected = false;
    });
  }

  private async _ensureConnected(): Promise<{ success: boolean; error?: string }> {
    if (!this.remote || !this.isConnected) {
      // Try to reconnect using saved credentials
      const credentials = await this._loadCredentials();
      if (credentials.length > 0) {
        const sorted = credentials.sort((a: TVCredentials, b: TVCredentials) =>
          (b.lastUsed || 0) - (a.lastUsed || 0)
        );
        // connect() is a generator - run it to completion
        // For saved credentials, it won't yield (no pairing needed)
        const generator = this.connect({ ip: sorted[0].ip });
        let result = await generator.next();
        while (!result.done) {
          // If it yields (shouldn't happen with saved creds), skip
          result = await generator.next();
        }
        if (result.value?.success && result.value?.paired) {
          return { success: true };
        }
      }

      return {
        success: false,
        error: 'Not connected. Use connect({ ip: "TV_IP" }) to connect.',
      };
    }
    return { success: true };
  }

  private async _sendKey(keyCode: number, direction: 'SHORT' | 'START_LONG' | 'END_LONG' = 'SHORT') {
    if (!this.remote) return;

    try {
      if (RemoteKeyCode && RemoteDirection) {
        // Use the module's enums if available
        await this.remote.sendKey(keyCode, RemoteDirection[direction]);
      } else {
        // Fall back to direct values
        const directionValues = { SHORT: 0, START_LONG: 1, END_LONG: 2 };
        await this.remote.sendKey(keyCode, directionValues[direction]);
      }
    } catch (error: any) {
      console.error(`[google-tv] Key send error: ${error.message}`);
    }
  }

  private async _loadCredentials(): Promise<TVCredentials[]> {
    try {
      const data = await fs.readFile(this.credentialsFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private async _saveCredentials(newCred: TVCredentials) {
    // Ensure directory exists
    const dir = path.dirname(this.credentialsFile);
    await fs.mkdir(dir, { recursive: true });

    const credentials = await this._loadCredentials();
    const index = credentials.findIndex((c: TVCredentials) => c.ip === newCred.ip);

    if (index >= 0) {
      credentials[index] = { ...newCred, lastUsed: Date.now() };
    } else {
      credentials.push({ ...newCred, lastUsed: Date.now() });
    }

    await fs.writeFile(this.credentialsFile, JSON.stringify(credentials, null, 2));
  }
}
