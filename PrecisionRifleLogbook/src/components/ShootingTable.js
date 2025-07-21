/**
 * Shooting Table Component
 * Multi-shot recording interface with responsive design
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from './common/AppStyles';

const { width, height } = Dimensions.get('window');

const ShootingTable = ({ 
  sessionData, 
  onSaveSession, 
  onAddShot, 
  onUpdateShot,
  onDeleteShot 
}) => {
  const [shots, setShots] = useState([]);
  const [isLandscape, setIsLandscape] = useState(width > height);
  const [editedShots, setEditedShots] = useState(new Set());

  useEffect(() => {
    // Initialize with one empty shot
    if (shots.length === 0) {
      addNewShot();
    }
  }, []);



  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setIsLandscape(window.width > window.height);
    });

    return () => subscription?.remove();
  }, []);

  const addNewShot = () => {
    // Find the next available round number
    const existingNumbers = shots.map(shot => shot.roundNumber);
    const nextRoundNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    
    const newShot = {
      id: Date.now() + Math.random(),
      roundNumber: nextRoundNumber,
      targetDistance: '',
      measuredVelocity: '',
      projectedElevation: '',
      projectedWind: '',
      actualElevation: '',
      actualWind: '',
      notes: ''
    };
    
    // Insert the shot at the correct position based on round number
    const updatedShots = [...shots, newShot];
    setShots(updatedShots);
    
    // Mark this shot as edited immediately so it won't be affected by range distance changes
    setEditedShots(prev => new Set([...prev, newShot.id]));
    
    onAddShot?.(newShot);
  };

  const updateShot = (shotId, field, value) => {
    const updatedShots = shots.map(shot => 
      shot.id === shotId ? { ...shot, [field]: value } : shot
    );
    setShots(updatedShots);
    
    // Mark this shot as edited if target distance is changed
    if (field === 'targetDistance') {
      setEditedShots(prev => new Set([...prev, shotId]));
    }
    
    onUpdateShot?.(shotId, field, value);
  };

  const deleteShot = (shotId) => {
    if (shots.length <= 1) {
      Alert.alert('Cannot Delete', 'At least one shot must remain in the session.');
      return;
    }

    Alert.alert(
      'Delete Shot',
      'Are you sure you want to delete this shot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedShots = shots.filter(shot => shot.id !== shotId);
            setShots(updatedShots);
            // Remove from edited shots set
            setEditedShots(prev => {
              const newSet = new Set(prev);
              newSet.delete(shotId);
              return newSet;
            });
            onDeleteShot?.(shotId);
          }
        }
      ]
    );
  };

  const saveSession = () => {
    const validShots = shots.filter(shot => 
      shot.actualElevation || shot.actualWind || shot.measuredVelocity
    );
    
    if (validShots.length === 0) {
      Alert.alert('No Data', 'Please record at least one shot before saving.');
      return;
    }

    onSaveSession?.({
      ...sessionData,
      shots: validShots,
      totalShots: validShots.length
    });
  };

  const renderTableHeader = () => (
    <View style={[styles.tableRow, styles.tableHeader, isLandscape && styles.landscapeHeader]}>
      <Text style={styles.headerCell}>#</Text>
      <Text style={styles.headerCell}>Target Distance</Text>
      <Text style={styles.headerCell}>Measured Velocity</Text>
      <Text style={styles.headerCell}>Projected Elevation</Text>
      <Text style={styles.headerCell}>Projected Wind</Text>
      <Text style={styles.headerCell}>Actual Elevation</Text>
      <Text style={styles.headerCell}>Actual Wind</Text>
      <Text style={styles.headerCell}>Actions</Text>
    </View>
  );

  const renderShotRow = (shot, index) => (
    <View key={shot.id} style={[styles.tableRow, isLandscape && styles.landscapeRow]}>
      <Text style={styles.cellNumber}>{shot.roundNumber}</Text>
      
      <TextInput
        style={[styles.cellInput, styles.cellDistance]}
        value={shot.targetDistance.toString()}
        onChangeText={(value) => updateShot(shot.id, 'targetDistance', value)}
        placeholder={sessionData.rangeDistance?.toString() || '100'}
        keyboardType="numeric"
      />
      
      <TextInput
        style={styles.cellInput}
        value={shot.measuredVelocity}
        onChangeText={(value) => updateShot(shot.id, 'measuredVelocity', value)}
        placeholder="fps"
        keyboardType="numeric"
      />
      
      <TextInput
        style={styles.cellInput}
        value={shot.projectedElevation}
        onChangeText={(value) => updateShot(shot.id, 'projectedElevation', value)}
        placeholder="MOA"
        keyboardType="numeric"
      />
      
      <TextInput
        style={styles.cellInput}
        value={shot.projectedWind}
        onChangeText={(value) => updateShot(shot.id, 'projectedWind', value)}
        placeholder="MOA"
        keyboardType="numeric"
      />
      
      <TextInput
        style={styles.cellInput}
        value={shot.actualElevation}
        onChangeText={(value) => updateShot(shot.id, 'actualElevation', value)}
        placeholder="MOA"
        keyboardType="numeric"
      />
      
      <TextInput
        style={styles.cellInput}
        value={shot.actualWind}
        onChangeText={(value) => updateShot(shot.id, 'actualWind', value)}
        placeholder="MOA"
        keyboardType="numeric"
      />
      
      <View style={styles.actionCell}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteShot(shot.id)}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Session Info Header */}
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionTitle}>Shooting Session</Text>
        <Text style={styles.sessionInfo}>
          {sessionData.rifleProfile} • {shots.length} shots
        </Text>
      </View>



      {/* Table Container */}
      <View style={styles.tableContainer}>
        <ScrollView 
          horizontal={isLandscape}
          showsHorizontalScrollIndicator={false}
          style={styles.tableScroll}
        >
          <View style={styles.table}>
            {renderTableHeader()}
            <ScrollView 
              vertical={!isLandscape}
              showsVerticalScrollIndicator={false}
              style={styles.tableBody}
            >
              {shots
                .sort((a, b) => a.roundNumber - b.roundNumber)
                .map((shot, index) => renderShotRow(shot, index))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.addButton} onPress={addNewShot}>
          <Text style={styles.addButtonText}>+ Add Shot</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.saveButton} onPress={saveSession}>
          <Text style={styles.saveButtonText}>Save Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  
  sessionHeader: {
    padding: Spacing.md,
    backgroundColor: Colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryDark,
  },
  
  sessionTitle: {
    ...Typography.h3,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  
  sessionInfo: {
    ...Typography.bodySmall,
    color: Colors.white,
    opacity: 0.9,
  },
  

  
  tableContainer: {
    flex: 1,
    margin: Spacing.md,
  },
  
  tableScroll: {
    flex: 1,
  },
  
  table: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.grayDark,
    overflow: 'hidden',
  },
  
  tableHeader: {
    backgroundColor: Colors.primaryDeep,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  landscapeHeader: {
    minWidth: 800,
  },
  
  headerCell: {
    ...Typography.label,
    color: Colors.white,
    padding: Spacing.sm,
    textAlign: 'center',
    flex: 1,
    minWidth: 80,
  },
  
  tableBody: {
    maxHeight: height * 0.6,
  },
  
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayDark,
    backgroundColor: Colors.white,
  },
  
  landscapeRow: {
    minWidth: 800,
  },
  
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayDark,
    backgroundColor: Colors.white,
  },
  
  cellNumber: {
    ...Typography.body,
    padding: Spacing.sm,
    textAlign: 'center',
    flex: 0.5,
    minWidth: 40,
    fontWeight: 'bold',
  },
  
  cellInput: {
    flex: 1,
    padding: Spacing.sm,
    borderWidth: 0,
    fontSize: 14,
    textAlign: 'center',
    minWidth: 80,
    color: Colors.gray,
  },
  
  cellDistance: {
    fontWeight: 'bold',
    color: Colors.primaryDeep,
  },
  
  actionCell: {
    flex: 0.5,
    minWidth: 40,
    alignItems: 'center',
  },
  
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  deleteButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  actionButtons: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  
  addButton: {
    flex: 1,
    backgroundColor: Colors.info,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  
  addButtonText: {
    ...Typography.label,
    color: Colors.white,
  },
  
  saveButton: {
    flex: 1,
    backgroundColor: Colors.success,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  
  saveButtonText: {
    ...Typography.label,
    color: Colors.white,
  },
});

export default ShootingTable; 