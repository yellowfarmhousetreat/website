/**
 * ProductManager - Schema-Driven Data Validation
 * Manages product schema, validation, and auto-population of fields
 */

class ProductManager {
  static schema = null;

  /**
   * Load schema from JSON file
   */
  static async loadSchema() {
    try {
      const resp = await fetch('/data/product-schema.json');
      this.schema = await resp.json();
    } catch (err) {
      console.error('Failed to load product schema:', err);
      throw err;
    }
  }

  /**
   * Get all required field definitions
   */
  static getRequiredFields() {
    if (!this.schema) throw new Error('Schema not loaded');
    return Object.entries(this.schema.fields)
      .filter(([_, config]) => config.required)
      .map(([key, config]) => ({ key, ...config }));
  }

  /**
   * Get all optional field definitions
   */
  static getOptionalFields() {
    if (!this.schema) throw new Error('Schema not loaded');
    return Object.entries(this.schema.fields)
      .filter(([_, config]) => !config.required)
      .map(([key, config]) => ({ key, ...config }));
  }

  /**
   * Validate a product against schema
   * @returns { valid: boolean, errors: string[] }
   */
  static validateProduct(product) {
    if (!this.schema) throw new Error('Schema not loaded');
    const errors = [];

    // Check required fields
    Object.entries(this.schema.fields).forEach(([fieldName, fieldConfig]) => {
      if (fieldConfig.required && (!product[fieldName] && product[fieldName] !== false && product[fieldName] !== 0)) {
        errors.push(`${fieldName} is required`);
      }
    });

    // Check enum constraints
    Object.entries(this.schema.fields).forEach(([fieldName, fieldConfig]) => {
      if (fieldConfig.enum && product[fieldName] && !fieldConfig.enum.includes(product[fieldName])) {
        errors.push(`${fieldName} must be one of: ${fieldConfig.enum.join(', ')}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Auto-fill missing optional fields with defaults
   */
  static fillDefaults(product) {
    if (!this.schema) throw new Error('Schema not loaded');
    
    Object.entries(this.schema.fields).forEach(([fieldName, fieldConfig]) => {
      if (!product.hasOwnProperty(fieldName) && fieldConfig.default !== undefined) {
        product[fieldName] = fieldConfig.default;
      }
    });
    return product;
  }

  /**
   * Complete product validation and defaults filling
   */
  static normalizeProduct(product) {
    // Fill defaults first
    this.fillDefaults(product);
    // Then validate
    const validation = this.validateProduct(product);
    return { product, ...validation };
  }

  /**
   * Get field configuration by name
   */
  static getField(fieldName) {
    if (!this.schema) throw new Error('Schema not loaded');
    return this.schema.fields[fieldName];
  }

  /**
   * Get all fields
   */
  static getAllFields() {
    if (!this.schema) throw new Error('Schema not loaded');
    return this.schema.fields;
  }
}
