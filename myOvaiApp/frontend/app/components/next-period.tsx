import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useAuth } from '../../AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import moment from 'moment';

type CyclePhase = {
  start: string | null;
  end: string | null;
  color: string;
  name: string;
};

type Cycle = {
  id: string;
  month: string;
  phases: CyclePhase[];
  symptoms?: Record<string, number>;
};

type NextPeriodCalculatorProps = {
  onNextPeriodDaysChange?: (days: number | null) => void;
};

export default function NextPeriodCalculator({ onNextPeriodDaysChange }: NextPeriodCalculatorProps) {
  const { user } = useAuth();
  const [nextPeriodDays, setNextPeriodDays] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculate next period days based on latest cycle
  const updateNextPeriodDays = (cycles: Cycle[]) => {
    if (!cycles.length) {
      setNextPeriodDays(null);
      onNextPeriodDaysChange?.(null);
      return;
    }

    const latestCycle = cycles
      .filter(cycle => {
        const menstrualPhase = cycle.phases.find(phase => phase.name === 'Menstrual');
        return menstrualPhase?.start && menstrualPhase?.end;
      })
      .sort((cycleA, cycleB) =>
        moment(cycleB.phases[0]?.start).diff(moment(cycleA.phases[0]?.start)))[0];

    if (!latestCycle) {
      setNextPeriodDays(null);
      onNextPeriodDaysChange?.(null);
      return;
    }

    const lutealPhase = latestCycle.phases.find(phase => phase.name === 'Luteal' && phase.end);

    if (lutealPhase) {
      const nextPeriodDate = moment(lutealPhase.end).add(1, 'days');
      const daysUntilNextPeriod = nextPeriodDate.diff(moment(), 'days');
      setNextPeriodDays(daysUntilNextPeriod);
      onNextPeriodDaysChange?.(daysUntilNextPeriod);
    } else {
      setNextPeriodDays(null);
      onNextPeriodDaysChange?.(null);
    }
  };

  // Instant calculation based on real-time changes in Firestore data
  useEffect(() => {
    if (!user || !user.uid) {
      console.log('No authenticated user found.');
      setLoading(false);
      return;
    }

    const userDoc = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      userDoc,
      (docSnapshot) => {
        try {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            const cyclesData = data.cycles || [];
            updateNextPeriodDays(cyclesData);
          } else {
            console.log('No user doc found.');
            setNextPeriodDays(null);
            onNextPeriodDaysChange?.(null);
          }
        } catch (error) {
          console.error('Error retrieving cycle:', error);
          if (error instanceof Error) {
            alert(`Failed to retrieve cycle: ${error.message}`);
          } else {
            alert('Failed to retrieve cycle: Unknown error occurred');
          }
          setNextPeriodDays(null);
          onNextPeriodDaysChange?.(null);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Snapshot error:', error);
        if (error instanceof Error) {
          alert(`Failed to listen for cycle updates: ${error.message}`);
        } else {
          alert('Failed to listen for cycle updates: Unknown error occurred');
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.statsText}>Loading cycle data...</Text>
      ) : (
        <Text style={styles.statsText}>
          {nextPeriodDays !== null
            ? `Your next period starts in ${nextPeriodDays} days`
            : 'Select your cycle dates'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  statsText: {
    fontSize: 16,
    color: '#2D1B3D',
    fontFamily: 'Helvetica',
    opacity: 0.8,
  },
});