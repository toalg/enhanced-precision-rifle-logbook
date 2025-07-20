/**
 * Gun Profile Model
 * Manages firearm profiles for tracking rounds, cleaning schedules, and session organization
 */

import { generateUUID } from '../utils/uuid';

export const FirearmType = {
  RIFLE: 'rifle',
  HANDGUN: 'handgun',
  SHOTGUN: 'shotgun',
  
  getAllTypes() {
    return [this.RIFLE, this.HANDGUN, this.SHOTGUN];
  },
  
  getDisplayName(type) {
    const names = {
      [this.RIFLE]: 'Rifle',
      [this.HANDGUN]: 'Handgun',
      [this.SHOTGUN]: 'Shotgun'
    };
    return names[type] || type;
  }
};

export class GunProfile {
  constructor(data = {}) {
    this.id = data.id || generateUUID();
    this.name = data.name || '';
    this.manufacturer = data.manufacturer || '';
    this.model = data.model || '';
    this.caliber = data.caliber || '';
    this.type = data.type || FirearmType.RIFLE;
    this.notes = data.notes || '';
    
    // Tracking Data
    this.totalRounds = data.totalRounds || 0;
    this.lastCleanedAt = data.lastCleanedAt || 0; // Round count when last cleaned
    this.cleaningInterval = data.cleaningInterval || 200; // Default: every 200 rounds
    this.lastSessionDate = data.lastSessionDate || null;
    
    // Profile settings
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.favorite = data.favorite || false;
    
    // Timestamps
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.synced = data.synced || false;
  }

  // Validation
  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Gun name is required');
    }

    if (this.name.length > 50) {
      errors.push('Gun name must be 50 characters or less');
    }

    if (!FirearmType.getAllTypes().includes(this.type)) {
      errors.push('Invalid firearm type');
    }

    if (this.cleaningInterval < 1 || this.cleaningInterval > 10000) {
      errors.push('Cleaning interval must be between 1 and 10,000 rounds');
    }

    if (this.totalRounds < 0) {
      errors.push('Total rounds cannot be negative');
    }

    if (this.lastCleanedAt < 0 || this.lastCleanedAt > this.totalRounds) {
      errors.push('Last cleaned round count is invalid');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Round counting methods
  addRounds(roundCount) {
    if (roundCount > 0) {
      this.totalRounds += roundCount;
      this.lastSessionDate = new Date().toISOString();
      this.touch();
    }
  }

  getRoundsSinceLastCleaning() {
    return Math.max(0, this.totalRounds - this.lastCleanedAt);
  }

  isCleaningDue() {
    return this.getRoundsSinceLastCleaning() >= this.cleaningInterval;
  }

  getRoundsUntilCleaning() {
    const roundsSinceCleaning = this.getRoundsSinceLastCleaning();
    return Math.max(0, this.cleaningInterval - roundsSinceCleaning);
  }

  getCleaningProgress() {
    const roundsSinceCleaning = this.getRoundsSinceLastCleaning();
    return Math.min(1.0, roundsSinceCleaning / this.cleaningInterval);
  }

  markAsCleaned() {
    this.lastCleanedAt = this.totalRounds;
    this.touch();
  }

  // Display methods
  getDisplayName() {
    if (this.manufacturer && this.model) {
      return `${this.manufacturer} ${this.model}`;
    }
    return this.name;
  }

  getFullDisplayName() {
    const parts = [];
    
    if (this.manufacturer) parts.push(this.manufacturer);
    if (this.model) parts.push(this.model);
    if (this.caliber) parts.push(`(${this.caliber})`);
    
    if (parts.length === 0) {
      return this.name;
    }
    
    const manufacturerModel = parts.join(' ');
    return this.name !== manufacturerModel ? `${this.name} - ${manufacturerModel}` : manufacturerModel;
  }

  getTypeDisplayName() {
    return FirearmType.getDisplayName(this.type);
  }

  getCleaningStatus() {
    if (this.isCleaningDue()) {
      return {
        status: 'needs_cleaning',
        message: `Needs cleaning! ${this.getRoundsSinceLastCleaning()} rounds since last cleaning`,
        color: '#FF6B6B',
        icon: '⚠️'
      };
    } else if (this.getCleaningProgress() > 0.8) {
      return {
        status: 'warning',
        message: `${this.getRoundsUntilCleaning()} rounds until cleaning`,
        color: '#FFB84D',
        icon: '🟡'
      };
    } else {
      return {
        status: 'clean',
        message: `${this.getRoundsUntilCleaning()} rounds until cleaning`,
        color: '#51CF66',
        icon: '✅'
      };
    }
  }

  getLastSessionDisplayDate() {
    if (!this.lastSessionDate) return 'Never';
    
    const date = new Date(this.lastSessionDate);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString();
  }

  // Session statistics
  updateFromSession(sessionData) {
    // This will be called when a session is completed
    if (sessionData.rounds && sessionData.rounds > 0) {
      this.addRounds(sessionData.rounds);
    }
    if (sessionData.date) {
      this.lastSessionDate = sessionData.date;
    }
  }

  // Data conversion
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      manufacturer: this.manufacturer,
      model: this.model,
      caliber: this.caliber,
      type: this.type,
      notes: this.notes,
      totalRounds: this.totalRounds,
      lastCleanedAt: this.lastCleanedAt,
      cleaningInterval: this.cleaningInterval,
      lastSessionDate: this.lastSessionDate,
      isActive: this.isActive,
      favorite: this.favorite,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      synced: this.synced
    };
  }

  // Update timestamp
  touch() {
    this.updatedAt = new Date().toISOString();
    this.synced = false;
  }

  // Create a copy
  clone() {
    return new GunProfile(this.toJSON());
  }

  // Static factory methods
  static fromJSON(data) {
    return new GunProfile(data);
  }

  static createEmpty() {
    return new GunProfile({
      type: FirearmType.RIFLE,
      cleaningInterval: 200
    });
  }

  static createFromExistingSession(sessionData) {
    // Create a profile from legacy session data
    return new GunProfile({
      name: sessionData.rifleProfile || 'Imported Rifle',
      type: FirearmType.RIFLE,
      totalRounds: 1, // Assume at least 1 round from the session
      lastSessionDate: sessionData.date || sessionData.createdAt,
      notes: `Imported from session: ${sessionData.notes || ''}`
    });
  }

  // Common calibers for quick selection
  static getCommonCalibers() {
    return [
      // Rifle calibers
      '.223 Remington', '.308 Winchester', '.30-06 Springfield',
      '.270 Winchester', '.243 Winchester', '.22 LR', '.17 HMR',
      '6.5 Creedmoor', '6.5 PRC', '.300 Win Mag', '.338 Lapua',
      '.50 BMG', '7mm Rem Mag', '.22-250', '.204 Ruger',
      
      // Handgun calibers  
      '9mm Luger', '.45 ACP', '.40 S&W', '.357 Magnum',
      '.38 Special', '.380 ACP', '.44 Magnum', '.22 LR',
      '.32 ACP', '10mm Auto', '.357 SIG', '.41 Magnum',
      
      // Shotgun gauges
      '12 gauge', '20 gauge', '16 gauge', '28 gauge', '.410 bore'
    ].sort();
  }

  // Common manufacturers
  static getCommonManufacturers() {
    return [
      'Remington', 'Winchester', 'Ruger', 'Smith & Wesson',
      'Glock', 'Sig Sauer', 'Colt', 'Browning', 'Savage',
      'Tikka', 'Weatherby', 'Beretta', 'Benelli', 'Mossberg',
      'Springfield Armory', 'Daniel Defense', 'Aero Precision',
      'BCM', 'LaRue Tactical', 'Noveske', 'LWRC', 'Wilson Combat',
      'Kimber', 'Les Baer', 'Ed Brown', 'Nighthawk Custom'
    ].sort();
  }

  // Static validation for form data
  static validateFormData(formData) {
    const profile = new GunProfile(formData);
    return profile.validate();
  }

  // Search/filter helpers
  matchesSearch(searchTerm) {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    const searchableText = [
      this.name,
      this.manufacturer,
      this.model,
      this.caliber,
      this.type,
      this.getTypeDisplayName()
    ].join(' ').toLowerCase();
    
    return searchableText.includes(term);
  }

  // Comparison for sorting
  static compare(a, b, sortBy = 'name') {
    switch (sortBy) {
      case 'name':
        return a.getDisplayName().localeCompare(b.getDisplayName());
      case 'type':
        return a.type.localeCompare(b.type) || a.getDisplayName().localeCompare(b.getDisplayName());
      case 'totalRounds':
        return b.totalRounds - a.totalRounds;
      case 'lastSession':
        const aDate = a.lastSessionDate ? new Date(a.lastSessionDate) : new Date(0);
        const bDate = b.lastSessionDate ? new Date(b.lastSessionDate) : new Date(0);
        return bDate - aDate;
      case 'cleaningDue':
        return b.getCleaningProgress() - a.getCleaningProgress();
      default:
        return 0;
    }
  }
}