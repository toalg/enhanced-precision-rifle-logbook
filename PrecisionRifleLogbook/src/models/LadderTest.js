/**
 * Ladder Test Model
 * Migrated from rifle_logbook.html ladder test functionality (lines 1499-1697)
 */

export class LadderCharge {
  constructor(data = {}) {
    this.id = data.id || null;
    this.ladderTestId = data.ladderTestId || null;
    this.chargeWeight = data.chargeWeight || 0;
    this.velocities = data.velocities || [null, null, null];
    this.notes = data.notes || '';
    this.pressureSigns = data.pressureSigns || '';
  }

  // Calculate statistics (migrated from rifle_logbook.html lines 1472-1497)
  getStatistics() {
    const validVelocities = this.velocities.filter(v => v !== null && v !== undefined && !isNaN(v));
    
    if (validVelocities.length === 0) {
      return {
        average: null,
        extremeSpread: null,
        standardDeviation: null,
        shotCount: 0
      };
    }

    const average = validVelocities.reduce((sum, vel) => sum + vel, 0) / validVelocities.length;
    const max = Math.max(...validVelocities);
    const min = Math.min(...validVelocities);
    const extremeSpread = max - min;
    
    let standardDeviation = 0;
    if (validVelocities.length > 1) {
      const variance = validVelocities.reduce((sum, vel) => sum + Math.pow(vel - average, 2), 0) / validVelocities.length;
      standardDeviation = Math.sqrt(variance);
    }

    return {
      average: Math.round(average),
      extremeSpread: Math.round(extremeSpread),
      standardDeviation: Number(standardDeviation.toFixed(1)),
      shotCount: validVelocities.length
    };
  }

  // Validate charge data
  validate() {
    const errors = [];

    if (!this.chargeWeight || this.chargeWeight <= 0) {
      errors.push('Charge weight must be greater than 0');
    }

    const validVelocities = this.velocities.filter(v => v !== null && !isNaN(v));
    if (validVelocities.length === 0) {
      errors.push('At least one velocity measurement is required');
    }

    // Check for reasonable velocity values
    validVelocities.forEach((vel, index) => {
      if (vel < 500 || vel > 5000) {
        errors.push(`Shot ${index + 1} velocity (${vel}) seems unrealistic`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toJSON() {
    return {
      id: this.id,
      ladderTestId: this.ladderTestId,
      chargeWeight: this.chargeWeight,
      velocities: this.velocities,
      notes: this.notes,
      pressureSigns: this.pressureSigns,
      ...this.getStatistics()
    };
  }
}

export class LadderTest {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.date = data.date || new Date().toISOString().split('T')[0];
    this.rifle = data.rifle || '';
    this.rangeDistance = data.rangeDistance || 0;
    this.bullet = data.bullet || '';
    this.powder = data.powder || '';
    this.brass = data.brass || '';
    this.notes = data.notes || '';
    this.charges = (data.charges || []).map(charge => 
      charge instanceof LadderCharge ? charge : new LadderCharge(charge)
    );
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.synced = data.synced || false;
  }

  // Validation (migrated from rifle_logbook.html lines 1553-1565)
  validate() {
    const errors = [];

    if (!this.date) {
      errors.push('Test date is required');
    }

    if (!this.rifle || this.rifle.trim().length === 0) {
      errors.push('Rifle configuration is required');
    }

    if (!this.rangeDistance || this.rangeDistance <= 0) {
      errors.push('Range distance must be greater than 0');
    }

    if (!this.bullet || this.bullet.trim().length === 0) {
      errors.push('Bullet information is required');
    }

    if (!this.powder || this.powder.trim().length === 0) {
      errors.push('Powder type is required');
    }

    if (this.charges.length === 0) {
      errors.push('At least one charge weight with velocity data is required');
    }

    // Validate individual charges
    this.charges.forEach((charge, index) => {
      const chargeValidation = charge.validate();
      if (!chargeValidation.isValid) {
        errors.push(`Charge ${index + 1}: ${chargeValidation.errors.join(', ')}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Generate ladder charges (migrated from rifle_logbook.html lines 1416-1470)
  static generateCharges(startCharge, endCharge, increment) {
    const charges = [];
    let currentCharge = startCharge;

    while (currentCharge <= endCharge) {
      charges.push(new LadderCharge({
        chargeWeight: Number(currentCharge.toFixed(1))
      }));
      currentCharge += increment;
    }

    return charges;
  }

  // Add charge to test
  addCharge(chargeData) {
    const charge = new LadderCharge({
      ...chargeData,
      ladderTestId: this.id
    });
    this.charges.push(charge);
    this.touch();
    return charge;
  }

  // Remove charge from test
  removeCharge(chargeWeight) {
    this.charges = this.charges.filter(charge => charge.chargeWeight !== chargeWeight);
    this.touch();
  }

  // Get charge by weight
  getChargeByWeight(weight) {
    return this.charges.find(charge => charge.chargeWeight === weight);
  }

  // Get test summary statistics
  getOverallStatistics() {
    const allVelocities = [];
    
    this.charges.forEach(charge => {
      charge.velocities.forEach(vel => {
        if (vel !== null && vel !== undefined && !isNaN(vel)) {
          allVelocities.push(vel);
        }
      });
    });

    if (allVelocities.length === 0) {
      return {
        totalShots: 0,
        averageVelocity: null,
        overallES: null,
        velocityRange: null
      };
    }

    const average = allVelocities.reduce((sum, vel) => sum + vel, 0) / allVelocities.length;
    const max = Math.max(...allVelocities);
    const min = Math.min(...allVelocities);

    return {
      totalShots: allVelocities.length,
      averageVelocity: Math.round(average),
      overallES: max - min,
      velocityRange: { min, max },
      chargeCount: this.charges.length
    };
  }

  // Find flat spots (velocity nodes) - migrated from analytics logic
  findFlatSpots(tolerance = 15) {
    if (this.charges.length < 3) return [];

    const sortedCharges = this.charges
      .filter(charge => {
        const stats = charge.getStatistics();
        return stats.average !== null;
      })
      .sort((a, b) => a.chargeWeight - b.chargeWeight);

    const flatSpots = [];

    for (let i = 1; i < sortedCharges.length - 1; i++) {
      const prev = sortedCharges[i - 1].getStatistics();
      const current = sortedCharges[i].getStatistics();
      const next = sortedCharges[i + 1].getStatistics();

      const velChange1 = Math.abs(current.average - prev.average);
      const velChange2 = Math.abs(next.average - current.average);

      if (velChange1 <= tolerance && velChange2 <= tolerance) {
        flatSpots.push({
          charge: sortedCharges[i].chargeWeight,
          velocity: current.average,
          standardDeviation: current.standardDeviation,
          confidence: 'medium' // Could be enhanced with more sophisticated analysis
        });
      }
    }

    return flatSpots;
  }

  // Get best performing charge (lowest SD)
  getBestCharge() {
    if (this.charges.length === 0) return null;

    return this.charges.reduce((best, current) => {
      const bestStats = best.getStatistics();
      const currentStats = current.getStatistics();
      
      if (bestStats.standardDeviation === null) return current;
      if (currentStats.standardDeviation === null) return best;
      
      return currentStats.standardDeviation < bestStats.standardDeviation ? current : best;
    });
  }

  // Format date for display
  getFormattedDate() {
    const date = new Date(this.date);
    return date.toLocaleDateString();
  }

  // Data conversion
  toJSON() {
    return {
      id: this.id,
      date: this.date,
      rifle: this.rifle,
      rangeDistance: this.rangeDistance,
      bullet: this.bullet,
      powder: this.powder,
      brass: this.brass,
      notes: this.notes,
      charges: this.charges.map(charge => charge.toJSON()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      synced: this.synced,
      ...this.getOverallStatistics()
    };
  }

  // Update timestamp
  touch() {
    this.updatedAt = new Date().toISOString();
    this.synced = false;
  }

  // Create a copy
  clone() {
    return new LadderTest(this.toJSON());
  }

  // Static factory methods
  static fromJSON(data) {
    return new LadderTest(data);
  }

  static createEmpty() {
    return new LadderTest({
      date: new Date().toISOString().split('T')[0]
    });
  }

  // Static validation for form data
  static validateFormData(formData) {
    const test = new LadderTest(formData);
    return test.validate();
  }
}