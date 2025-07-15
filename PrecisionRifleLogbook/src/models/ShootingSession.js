/**
 * Shooting Session Model
 * Migrated from rifle_logbook.html validateSession() and saveSession() methods
 */

export class ShootingSession {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.date = data.date || new Date().toISOString();
    this.rifleProfile = data.rifleProfile || '';
    this.rangeDistance = data.rangeDistance || 0;
    this.rangeUnit = data.rangeUnit || 'yards';
    this.ammoType = data.ammoType || '';
    this.muzzleVelocity = data.muzzleVelocity || null;
    
    // Environmental conditions
    this.temperature = data.temperature || null;
    this.tempUnit = data.tempUnit || 'F';
    this.humidity = data.humidity || null;
    this.pressure = data.pressure || null;
    this.pressureUnit = data.pressureUnit || 'inHg';
    this.windSpeed = data.windSpeed || null;
    this.windSpeedUnit = data.windSpeedUnit || 'mph';
    this.windDirection = data.windDirection || '';
    
    // Ballistic data
    this.predElevation = data.predElevation || null;
    this.elevationUnit = data.elevationUnit || 'MOA';
    this.actualElevation = data.actualElevation || null;
    this.actualElevationUnit = data.actualElevationUnit || 'MOA';
    this.predWindage = data.predWindage || null;
    this.windageUnit = data.windageUnit || 'MOA';
    this.actualWindage = data.actualWindage || null;
    this.actualWindageUnit = data.actualWindageUnit || 'MOA';
    
    // Additional fields
    this.targetPhotoPath = data.targetPhotoPath || null;
    this.notes = data.notes || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.synced = data.synced || false;
  }

  // Validation (migrated from rifle_logbook.html lines 1761-1767)
  validate() {
    const errors = [];

    if (!this.date) {
      errors.push('Date is required');
    }

    if (!this.rifleProfile || this.rifleProfile.trim().length === 0) {
      errors.push('Rifle profile is required');
    }

    if (!this.rangeDistance || this.rangeDistance <= 0) {
      errors.push('Range distance must be greater than 0');
    }

    if (!this.ammoType || this.ammoType.trim().length === 0) {
      errors.push('Ammunition type is required');
    }

    // Validate numeric fields
    if (this.muzzleVelocity !== null && (isNaN(this.muzzleVelocity) || this.muzzleVelocity <= 0)) {
      errors.push('Muzzle velocity must be a positive number');
    }

    if (this.temperature !== null && isNaN(this.temperature)) {
      errors.push('Temperature must be a valid number');
    }

    if (this.humidity !== null && (isNaN(this.humidity) || this.humidity < 0 || this.humidity > 100)) {
      errors.push('Humidity must be between 0 and 100');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Data conversion methods
  toJSON() {
    return {
      id: this.id,
      date: this.date,
      rifleProfile: this.rifleProfile,
      rangeDistance: this.rangeDistance,
      rangeUnit: this.rangeUnit,
      ammoType: this.ammoType,
      muzzleVelocity: this.muzzleVelocity,
      temperature: this.temperature,
      tempUnit: this.tempUnit,
      humidity: this.humidity,
      pressure: this.pressure,
      pressureUnit: this.pressureUnit,
      windSpeed: this.windSpeed,
      windSpeedUnit: this.windSpeedUnit,
      windDirection: this.windDirection,
      predElevation: this.predElevation,
      elevationUnit: this.elevationUnit,
      actualElevation: this.actualElevation,
      actualElevationUnit: this.actualElevationUnit,
      predWindage: this.predWindage,
      windageUnit: this.windageUnit,
      actualWindage: this.actualWindage,
      actualWindageUnit: this.actualWindageUnit,
      targetPhotoPath: this.targetPhotoPath,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      synced: this.synced,
    };
  }

  // Format date for display
  getFormattedDate() {
    const date = new Date(this.date);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Calculate elevation difference
  getElevationDifference() {
    if (this.predElevation !== null && this.actualElevation !== null) {
      return Math.abs(this.predElevation - this.actualElevation);
    }
    return null;
  }

  // Calculate windage difference
  getWindageDifference() {
    if (this.predWindage !== null && this.actualWindage !== null) {
      return Math.abs(this.predWindage - this.actualWindage);
    }
    return null;
  }

  // Environmental summary
  getEnvironmentalSummary() {
    const conditions = [];
    
    if (this.temperature !== null) {
      conditions.push(`${this.temperature}°${this.tempUnit}`);
    }
    
    if (this.humidity !== null) {
      conditions.push(`${this.humidity}% humidity`);
    }
    
    if (this.windSpeed !== null) {
      conditions.push(`${this.windSpeed} ${this.windSpeedUnit} wind`);
    }
    
    if (this.pressure !== null) {
      conditions.push(`${this.pressure} ${this.pressureUnit}`);
    }

    return conditions.join(', ');
  }

  // Check if session has complete environmental data
  hasCompleteEnvironmentalData() {
    return this.temperature !== null &&
           this.humidity !== null &&
           this.pressure !== null &&
           this.windSpeed !== null;
  }

  // Check if session has ballistic predictions
  hasBallisticPredictions() {
    return this.predElevation !== null || this.predWindage !== null;
  }

  // Update timestamp
  touch() {
    this.updatedAt = new Date().toISOString();
    this.synced = false;
  }

  // Create a copy of the session
  clone() {
    return new ShootingSession(this.toJSON());
  }

  // Static factory methods
  static fromJSON(data) {
    return new ShootingSession(data);
  }

  static createEmpty() {
    return new ShootingSession({
      date: new Date().toISOString().slice(0, 16), // Format for datetime-local input
    });
  }

  // Static validation for form data
  static validateFormData(formData) {
    const session = new ShootingSession(formData);
    return session.validate();
  }
}