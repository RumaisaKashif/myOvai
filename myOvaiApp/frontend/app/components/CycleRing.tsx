import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import moment from 'moment';
import Svg, { Circle } from 'react-native-svg';

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

const PHASES = {
  menstrual: { color: '#DC143C', name: 'Menstrual' },
  follicular: { color: '#9F2B68', name: 'Follicular' },
  ovulatory: { color: '#FF69B4', name: 'Ovulatory' },
  luteal: { color: '#C71585', name: 'Luteal' },
};

const AVERAGE_CYCLE_LENGTH = 28;
const PHASE_DURATIONS = {
  menstrual: 5,
  follicular: 9,
  ovulatory: 3,
  luteal: 11,
};

export default function CycleRing() {
  const { user } = useAuth();
  const [currentPhase, setCurrentPhase] = useState<CyclePhase | null>(null);
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  // Calculate phases based on menstrual start and end dates
  const calculatePhases = (menstrualPhaseStart: string, menstrualPhaseEnd: string): CyclePhase[] => {
    const startDate = moment(menstrualPhaseStart);
    const cyclePhasesArray: CyclePhase[] = [
      {
        start: menstrualPhaseStart,
        end: menstrualPhaseEnd,
        color: PHASES.menstrual.color,
        name: PHASES.menstrual.name,
      },
    ];

    const follicularPhaseStart = moment(menstrualPhaseEnd)
      .add(1, 'days')
      .format('YYYY-MM-DD');
    const follicularPhaseEnd = moment(follicularPhaseStart)
      .add(PHASE_DURATIONS.follicular - 1, 'days')
      .format('YYYY-MM-DD');
    cyclePhasesArray.push({
      start: follicularPhaseStart,
      end: follicularPhaseEnd,
      color: PHASES.follicular.color,
      name: PHASES.follicular.name,
    });

    const ovulatoryPhaseStart = moment(follicularPhaseEnd)
      .add(1, 'days')
      .format('YYYY-MM-DD');
    const ovulatoryPhaseEnd = moment(ovulatoryPhaseStart)
      .add(PHASE_DURATIONS.ovulatory - 1, 'days')
      .format('YYYY-MM-DD');
    cyclePhasesArray.push({
      start: ovulatoryPhaseStart,
      end: ovulatoryPhaseEnd,
      color: PHASES.ovulatory.color,
      name: PHASES.ovulatory.name,
    });

    const lutealStart = moment(ovulatoryPhaseEnd)
      .add(1, 'days')
      .format('YYYY-MM-DD');
    const lutealEnd = moment(lutealStart)
      .add(PHASE_DURATIONS.luteal - 1, 'days')
      .format('YYYY-MM-DD');
    cyclePhasesArray.push({
      start: lutealStart,
      end: lutealEnd,
      color: PHASES.luteal.color,
      name: PHASES.luteal.name,
    });

    return cyclePhasesArray;
  };

  // Get current phase and day
  const updateCycleInfo = (cycles: Cycle[]) => {
    if (!cycles.length) {
      setCurrentPhase(null);
      setCurrentDay(null);
      setProgress(0);
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
      setCurrentPhase(null);
      setCurrentDay(null);
      setProgress(0);
      return;
    }

    const menstrualPhase = latestCycle.phases.find(phase => phase.name === 'Menstrual');
    if (!menstrualPhase?.start || !menstrualPhase?.end) {
      setCurrentPhase(null);
      setCurrentDay(null);
      setProgress(0);
      return;
    }

    const phases = calculatePhases(menstrualPhase.start, menstrualPhase.end);
    const today = moment();
    const cycleStart = moment(menstrualPhase.start);
    const daysSinceStart = today.diff(cycleStart, 'days');
    const progressFraction = Math.min(daysSinceStart / AVERAGE_CYCLE_LENGTH, 1);

    // Find current phase
    const currentPhase = phases.find(
      phase =>
        phase.start &&
        phase.end &&
        today.isSameOrAfter(moment(phase.start)) &&
        today.isSameOrBefore(moment(phase.end))
    );

    if (currentPhase && currentPhase.start) {
      const dayInPhase = today.diff(moment(currentPhase.start), 'days') + 1;
      setCurrentPhase(currentPhase);
      setCurrentDay(dayInPhase);
      setProgress(progressFraction);
    } else {
      setCurrentPhase(null);
      setCurrentDay(null);
      setProgress(0);
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
            updateCycleInfo(cyclesData);
          } else {
            console.log('No user doc found.');
            setCurrentPhase(null);
            setCurrentDay(null);
            setProgress(0);
          }
        } catch (error) {
          console.error('Error retrieving cycle:', error);
          if (error instanceof Error) {
            alert(`Failed to retrieve cycle: ${error.message}`);
          } else {
            alert('Failed to retrieve cycle: Unknown error occurred');
          }
          setCurrentPhase(null);
          setCurrentDay(null);
          setProgress(0);
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

  const size = 300;
  const strokeWidth = 30;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.loadingText}>Loading cycle data...</Text>
      ) : currentPhase && currentDay ? (
        <View style={styles.ringContainer}>
          <Svg height={size} width={size}>
            {/* Unshaded Circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
            //   stroke="#E0BBE4"
              stroke="#CFAAD3"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Shaded Circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={currentPhase.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>
          {/* Phase day information */}
          <View style={styles.textContainer}>
            <Text style={styles.dayLabel}>Day</Text>
            <Text style={styles.dayText}>{currentDay}</Text>
            <Text style={styles.phaseText}>{currentPhase.name} Phase</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.noDataText}>No cycle data available</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 60,
  },
  ringContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#2D1B batting average3D',
    fontFamily: 'Helvetica',
  },
  dayLabel: {
    fontSize: 20,
    color: '#2D1B3D',
    fontFamily: 'Helvetica',
    opacity: 0.8,
  },
  phaseText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D1B3D',
    fontFamily: 'Helvetica',
    opacity: 0.9,
    marginTop: 2,
  },
  loadingText: {
    fontSize: 16,
    color: '#2D1B3D',
    fontFamily: 'Helvetica',
    opacity: 0.8,
  },
  noDataText: {
    fontSize: 16,
    color: '#2D1B3D',
    fontFamily: 'Helvetica',
    opacity: 0.8,
  },
});