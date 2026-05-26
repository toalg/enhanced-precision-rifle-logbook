/**
 * Custom Hook for Ballistic Unit Preference
 * Provides access to user's MOA/Mils preference throughout the app
 */

import { useState, useEffect } from 'react';
import LogbookService from '../services/LogbookService';

export const useBallisticUnit = () => {
  const [ballisticUnit, setBallisticUnit] = useState('MOA');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBallisticUnit();

    // Listen for unit changes
    const handleUnitChange = ({ unit }) => {
      setBallisticUnit(unit);
    };

    LogbookService.addEventListener('ballisticUnitChanged', handleUnitChange);

    return () => {
      LogbookService.removeEventListener('ballisticUnitChanged', handleUnitChange);
    };
  }, []);

  const loadBallisticUnit = async () => {
    try {
      const unit = await LogbookService.getBallisticUnit();
      setBallisticUnit(unit || 'MOA');
    } catch (error) {
      console.error('Error loading ballistic unit:', error);
      setBallisticUnit('MOA'); // Fallback to MOA
    } finally {
      setLoading(false);
    }
  };

  const updateBallisticUnit = async (newUnit) => {
    try {
      await LogbookService.setBallisticUnit(newUnit);
      setBallisticUnit(newUnit);
      return true;
    } catch (error) {
      console.error('Error updating ballistic unit:', error);
      return false;
    }
  };

  return {
    ballisticUnit,
    setBallisticUnit: updateBallisticUnit,
    loading,
    refresh: loadBallisticUnit
  };
};

export default useBallisticUnit;