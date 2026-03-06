import { Photon } from '@portel/photon-core';

/**
 * Test format-based input validation
 */
export default class TestFormats extends Photon {
  /**
   * Validate email address
   * @param email User email address {@format email}
   */
  validateEmail(email: string): string {
    return `Email: ${email}`;
  }

  /**
   * Validate website URL
   * @param url Website URL {@format url}
   */
  validateUrl(url: string): string {
    return `URL: ${url}`;
  }

  /**
   * Validate UUID identifier
   * @param id Unique identifier {@format uuid}
   */
  validateUuid(id: string): string {
    return `UUID: ${id}`;
  }

  /**
   * Validate product code
   * @param code Product code format XXX123 {@pattern ^[A-Z]{3}\d{3}$}
   */
  validateCode(code: string): string {
    return `Code: ${code}`;
  }

  /**
   * Validate phone number
   * @param phone Phone number with country code {@format phone}
   */
  validatePhone(phone: string): string {
    return `Phone: ${phone}`;
  }
}
