/**
 * Ballistic Utilities
 * Unit conversions and calculations for MOA and Mils
 */

export class BallisticUtils {
  
  /**
   * Convert MOA to Mils
   * @param {number} moa - Value in MOA
   * @returns {number} Value in Mils
   */
  static moaToMils(moa) {
    return moa / 3.44; // 1 MIL = 3.44 MOA
  }

  /**
   * Convert Mils to MOA
   * @param {number} mils - Value in Mils
   * @returns {number} Value in MOA
   */
  static milsToMoa(mils) {
    return mils * 3.44; // 1 MIL = 3.44 MOA
  }

  /**
   * Convert between MOA and Mils
   * @param {number} value - The value to convert
   * @param {string} fromUnit - Source unit ('MOA' or 'Mils')
   * @param {string} toUnit - Target unit ('MOA' or 'Mils')
   * @returns {number} Converted value
   */
  static convertUnit(value, fromUnit, toUnit) {
    if (fromUnit === toUnit) return value;
    
    if (fromUnit === 'MOA' && toUnit === 'Mils') {
      return this.moaToMils(value);
    } else if (fromUnit === 'Mils' && toUnit === 'MOA') {
      return this.milsToMoa(value);
    }
    
    throw new Error(`Invalid unit conversion: ${fromUnit} to ${toUnit}`);
  }

  /**
   * Format a ballistic value with appropriate precision
   * @param {number} value - The value to format
   * @param {string} unit - Unit ('MOA' or 'Mils')
   * @returns {string} Formatted value with unit
   */
  static formatValue(value, unit) {
    if (value === null || value === undefined || isNaN(value)) {
      return '';
    }

    const precision = unit === 'Mils' ? 2 : 1; // Mils need more precision
    return `${Number(value).toFixed(precision)} ${unit}`;
  }

  /**
   * Get the appropriate step size for input fields
   * @param {string} unit - Unit ('MOA' or 'Mils')
   * @returns {number} Step size for inputs
   */
  static getInputStep(unit) {
    return unit === 'Mils' ? 0.01 : 0.1;
  }

  /**
   * Get the appropriate decimal places for display
   * @param {string} unit - Unit ('MOA' or 'Mils')
   * @returns {number} Number of decimal places
   */
  static getDecimalPlaces(unit) {
    return unit === 'Mils' ? 2 : 1;
  }

  /**
   * Convert shot data to display units
   * @param {Object} shot - Shot data object
   * @param {string} targetUnit - Target unit for display
   * @returns {Object} Shot data with converted units
   */
  static convertShotToUnit(shot, targetUnit) {
    const convertedShot = { ...shot };

    // Convert elevation values
    if (shot.projectedElevation && shot.projectedElevationUnit) {
      convertedShot.projectedElevation = this.convertUnit(
        shot.projectedElevation, 
        shot.projectedElevationUnit, 
        targetUnit
      );
      convertedShot.projectedElevationUnit = targetUnit;
    }

    if (shot.actualElevation && shot.actualElevationUnit) {
      convertedShot.actualElevation = this.convertUnit(
        shot.actualElevation, 
        shot.actualElevationUnit, 
        targetUnit
      );
      convertedShot.actualElevationUnit = targetUnit;
    }

    // Convert windage values (using actualWind property name)
    if (shot.projectedWind && shot.projectedWindUnit) {
      convertedShot.projectedWind = this.convertUnit(
        shot.projectedWind, 
        shot.projectedWindUnit, 
        targetUnit
      );
      convertedShot.projectedWindUnit = targetUnit;
    }

    if (shot.actualWind && shot.actualWindUnit) {
      convertedShot.actualWind = this.convertUnit(
        shot.actualWind, 
        shot.actualWindUnit, 
        targetUnit
      );
      convertedShot.actualWindUnit = targetUnit;
    }

    return convertedShot;
  }

  /**
   * Calculate group size in different units
   * @param {Array} shots - Array of shot data
   * @param {string} unit - Unit for calculation ('MOA' or 'Mils')
   * @returns {Object} Group analysis data
   */
  static calculateGroupSize(shots, unit = 'MOA') {
    if (!shots || shots.length < 2) {
      return null;
    }

    // Filter shots with valid elevation and windage data
    const validShots = shots.filter(shot => 
      shot.actualElevation !== null && shot.actualElevation !== undefined &&
      shot.actualElevation !== '' && !isNaN(parseFloat(shot.actualElevation)) &&
      shot.actualWind !== null && shot.actualWind !== undefined &&
      shot.actualWind !== '' && !isNaN(parseFloat(shot.actualWind))
    );

    if (validShots.length < 2) {
      return null;
    }

    // For now, assume all shots are in the target unit (will enhance later)
    const convertedShots = validShots;

    // Extract elevation and windage arrays
    const elevations = convertedShots.map(shot => Number(shot.actualElevation));
    const windages = convertedShots.map(shot => Number(shot.actualWind));

    // Calculate spreads
    const elevationSpread = Math.max(...elevations) - Math.min(...elevations);
    const windageSpread = Math.max(...windages) - Math.min(...windages);

    // Calculate center point
    const centerElevation = elevations.reduce((sum, e) => sum + e, 0) / elevations.length;
    const centerWindage = windages.reduce((sum, w) => sum + w, 0) / windages.length;

    // Calculate group size (maximum distance from center)
    let maxDistance = 0;
    for (let i = 0; i < convertedShots.length; i++) {
      const deltaElevation = elevations[i] - centerElevation;
      const deltaWindage = windages[i] - centerWindage;
      const distance = Math.sqrt(deltaElevation * deltaElevation + deltaWindage * deltaWindage);
      maxDistance = Math.max(maxDistance, distance);
    }

    // Calculate extreme spread (longest distance between any two shots)
    let extremeSpread = 0;
    for (let i = 0; i < convertedShots.length; i++) {
      for (let j = i + 1; j < convertedShots.length; j++) {
        const deltaElevation = elevations[i] - elevations[j];
        const deltaWindage = windages[i] - windages[j];
        const distance = Math.sqrt(deltaElevation * deltaElevation + deltaWindage * deltaWindage);
        extremeSpread = Math.max(extremeSpread, distance);
      }
    }

    // Calculate mean radius
    const meanRadius = elevations.reduce((sum, elevation, i) => {
      const deltaElevation = elevation - centerElevation;
      const deltaWindage = windages[i] - centerWindage;
      return sum + Math.sqrt(deltaElevation * deltaElevation + deltaWindage * deltaWindage);
    }, 0) / convertedShots.length;

    return {
      unit,
      shotCount: convertedShots.length,
      centerElevation,
      centerWindage,
      elevationSpread,
      windageSpread,
      groupSize: maxDistance * 2, // Diameter
      extremeSpread,
      meanRadius,
      formattedGroupSize: this.formatValue(maxDistance * 2, unit),
      formattedExtremeSpread: this.formatValue(extremeSpread, unit),
      formattedMeanRadius: this.formatValue(meanRadius, unit)
    };
  }

  /**
   * Get group quality assessment
   * @param {number} groupSize - Group size in the specified unit
   * @param {string} unit - Unit ('MOA' or 'Mils')
   * @returns {Object} Quality assessment with color
   */
  static getGroupQuality(groupSize, unit) {
    // Convert to MOA for standardized quality assessment
    const moaSize = unit === 'Mils' ? this.milsToMoa(groupSize) : groupSize;

    if (moaSize < 0.5) return { quality: 'Excellent', color: '#27ae60' };
    if (moaSize < 1.0) return { quality: 'Very Good', color: '#2ecc71' };
    if (moaSize < 1.5) return { quality: 'Good', color: '#f39c12' };
    if (moaSize < 2.0) return { quality: 'Fair', color: '#e67e22' };
    return { quality: 'Needs Work', color: '#e74c3c' };
  }
}

export default BallisticUtils;