/**
 * Preferences Photon - MCP App with UI assets and settings
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @icon ⚙️
 * @tags preferences, settings, ui-templates
 */

import { PhotonMCP } from '@portel/photon-core';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  notifications: boolean;
  language: string;
  autoSave: boolean;
}

interface PreferencesState {
  preferences: UserPreferences;
  lastModified: string;
}

export default class PreferencesPhoton extends PhotonMCP {
  private state: PreferencesState = {
    preferences: {
      theme: 'system',
      fontSize: 'medium',
      notifications: true,
      language: 'en',
      autoSave: true,
    },
    lastModified: new Date().toISOString(),
  };

  /**
   * Get current user preferences
   * @format json
   */
  async getPreferences(): Promise<UserPreferences> {
    return this.state.preferences;
  }

  /**
   * Get a specific preference value
   */
  async getPreference(params: {
    key: keyof UserPreferences;
  }): Promise<any> {
    return this.state.preferences[params.key];
  }

  /**
   * Open the settings UI for editing preferences
   * @ui settings
   */
  async *editSettings(): AsyncGenerator<any, UserPreferences, any> {
    yield { emit: 'status', message: 'Opening settings...' };

    // Emit the settings UI with current preferences data
    yield {
      emit: 'ui',
      id: 'settings',
      title: 'User Settings',
      data: {
        current: this.state.preferences,
        available: {
          themes: ['light', 'dark', 'system'],
          fontSizes: ['small', 'medium', 'large'],
          languages: [
            { code: 'en', name: 'English' },
            { code: 'es', name: 'Spanish' },
            { code: 'fr', name: 'French' },
            { code: 'de', name: 'German' },
            { code: 'ja', name: 'Japanese' },
          ],
        },
      },
      mode: 'dialog',
      width: 500,
      height: 400,
    };

    // Wait for user to submit the form
    const result: { action: string; content?: Partial<UserPreferences> } = yield {
      ask: 'form',
      id: 'settings_form',
      message: 'Update your preferences',
      schema: {
        type: 'object',
        properties: {
          theme: {
            type: 'string',
            title: 'Theme',
            oneOf: [
              { const: 'light', title: 'Light' },
              { const: 'dark', title: 'Dark' },
              { const: 'system', title: 'System Default' },
            ],
            default: this.state.preferences.theme,
          },
          fontSize: {
            type: 'string',
            title: 'Font Size',
            oneOf: [
              { const: 'small', title: 'Small' },
              { const: 'medium', title: 'Medium' },
              { const: 'large', title: 'Large' },
            ],
            default: this.state.preferences.fontSize,
          },
          notifications: {
            type: 'boolean',
            title: 'Enable Notifications',
            default: this.state.preferences.notifications,
          },
          autoSave: {
            type: 'boolean',
            title: 'Auto-save Changes',
            default: this.state.preferences.autoSave,
          },
        },
        required: ['theme', 'fontSize'],
      },
    };

    if (result.action !== 'accept' || !result.content) {
      yield { emit: 'toast', message: 'Settings unchanged', type: 'info' };
      return this.state.preferences;
    }

    // Update preferences
    this.state.preferences = {
      ...this.state.preferences,
      ...result.content,
    };
    this.state.lastModified = new Date().toISOString();

    yield { emit: 'toast', message: 'Settings saved!', type: 'success' };

    return this.state.preferences;
  }

  /**
   * Preview a theme before applying
   * @ui theme-preview
   */
  async *previewTheme(params: {
    theme: 'light' | 'dark' | 'system';
  }): AsyncGenerator<any, void, any> {
    yield { emit: 'status', message: `Previewing ${params.theme} theme...` };

    // Emit inline UI for theme preview
    yield {
      emit: 'ui',
      id: 'theme-preview',
      title: `Theme Preview: ${params.theme}`,
      data: {
        theme: params.theme,
        sample: {
          title: 'Sample Content',
          text: 'This is how your content will look with this theme.',
          code: 'const greeting = "Hello, World!";',
        },
      },
      mode: 'inline',
      height: 200,
    };

    const apply: boolean = yield {
      ask: 'confirm',
      id: 'apply_theme',
      message: `Apply ${params.theme} theme?`,
    };

    if (apply) {
      this.state.preferences.theme = params.theme;
      this.state.lastModified = new Date().toISOString();
      yield { emit: 'toast', message: 'Theme applied!', type: 'success' };
    }
  }

  /**
   * Reset preferences to defaults
   */
  async *resetToDefaults(): AsyncGenerator<any, UserPreferences, any> {
    const confirmed: boolean = yield {
      ask: 'confirm',
      id: 'confirm_reset',
      message: 'Reset all preferences to defaults? This cannot be undone.',
      dangerous: true,
    };

    if (!confirmed) {
      yield { emit: 'toast', message: 'Reset cancelled', type: 'info' };
      return this.state.preferences;
    }

    yield { emit: 'progress', value: 0.5, message: 'Loading defaults...' };

    // Reset to defaults
    this.state.preferences = {
      theme: 'system',
      fontSize: 'medium',
      notifications: true,
      language: 'en',
      autoSave: true,
    };
    this.state.lastModified = new Date().toISOString();

    yield { emit: 'progress', value: 1.0, message: 'Done!' };
    yield { emit: 'toast', message: 'Preferences reset to defaults', type: 'success' };

    return this.state.preferences;
  }

  /**
   * Import preferences from JSON
   */
  async importPreferences(params: {
    preferences: Partial<UserPreferences>;
  }): Promise<UserPreferences> {
    this.state.preferences = { ...this.state.preferences, ...params.preferences };
    this.state.lastModified = new Date().toISOString();
    return this.state.preferences;
  }

  /**
   * Export current preferences as JSON
   * @format json
   */
  async exportPreferences(): Promise<PreferencesState> {
    return this.state;
  }
}
