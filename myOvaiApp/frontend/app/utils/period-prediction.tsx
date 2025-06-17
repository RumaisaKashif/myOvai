import { getFirestore, doc, getDoc } from 'firebase/firestore';
import moment from 'moment';

// Define types to match cycle-logger.tsx
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

// Constants from cycle-logger.tsx
const PHASE_DURATIONS = {
  menstrual: 5,
  follicular: 9,
  ovulatory: 3,
  luteal: 11,
};

const PHASES = {
  menstrual: { color: '#DC143C', name: 'Menstrual' },
  follicular: { color: '#9F2B68', name: 'Follicular' },
  ovulatory: { color: '#FF69B4', name: 'Ovulatory' },
  luteal: { color: '#C71585', name: 'Luteal' },
};

// Reusable calculatePhases function from cycle-logger.tsx
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

  const follicularPhaseStart = moment(menstrualPhaseEnd).add(1, 'days').format('YYYY-MM-DD');
  const follicularPhaseEnd = moment(follicularPhaseStart).add(PHASE_DURATIONS.follicular - 1, 'days').format('YYYY-MM-DD');
  cyclePhasesArray.push({
    start: follicularPhaseStart,
    end: follicularPhaseEnd,
    color: PHASES.follicular.color,
    name: PHASES.follicular.name,
  });

  const ovulatoryPhaseStart = moment(follicularPhaseEnd).add(1, 'days').format('YYYY-MM-DD');
  const ovulatoryPhaseEnd = moment(ovulatoryPhaseStart).add(PHASE_DURATIONS.ovulatory - 1, 'days').format('YYYY-MM-DD');
  cyclePhasesArray.push({
    start: ovulatoryPhaseStart,
    end: ovulatoryPhaseEnd,
    color: PHASES.ovulatory.color,
    name: PHASES.ovulatory.name,
  });

  const lutealStart = moment(ovulatoryPhaseEnd).add(1, 'days').format('YYYY-MM-DD');
  const lutealEnd = moment(lutealStart).add(PHASE_DURATIONS.luteal - 1, 'days').format('YYYY-MM-DD');
  cyclePhasesArray.push({
    start: lutealStart,
    end: lutealEnd,
    color: PHASES.luteal.color,
    name: PHASES.luteal.name,
  });

  return cyclePhasesArray;
};

export async function predictCycleDates(userId: string) {
  try {
    const db = getFirestore();
    const userDoc = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userDoc);

    if (!userSnapshot.exists()) {
      console.log('No user data found');
      return { ovulationDate: null, menstrualDate: null };
    }

    const data = userSnapshot.data();
    const cycles: Cycle[] = data.cycles || [];

    if (!cycles.length) {
      console.log('No cycles found');
      return { ovulationDate: null, menstrualDate: null };
    }

    // Find the latest cycle based on menstrual phase start date
    const latestCycle = cycles
      .filter(cycle => {
        const menstrualPhase = cycle.phases.find(phase => phase.name === 'Menstrual');
        return menstrualPhase?.start && menstrualPhase?.end;
      })
      .sort((a, b) => moment(b.phases[0].start).diff(moment(a.phases[0].start)))[0];

    if (!latestCycle) {
      console.log('No valid cycle found');
      return { ovulationDate: null, menstrualDate: null };
    }

    // Recalculate phases to ensure accuracy
    const menstrualPhase = latestCycle.phases.find(phase => phase.name === 'Menstrual');
    if (!menstrualPhase?.start || !menstrualPhase?.end) {
      console.log('Invalid menstrual phase');
      return { ovulationDate: null, menstrualDate: null };
    }

    const phases = calculatePhases(menstrualPhase.start, menstrualPhase.end);
    const ovulatoryPhase = phases.find(phase => phase.name === 'Ovulatory');
    const lutealPhase = phases.find(phase => phase.name === 'Luteal');

    if (!ovulatoryPhase?.start || !lutealPhase?.end) {
      console.log('Invalid phase dates');
      return { ovulationDate: null, menstrualDate: null };
    }

    // Next menstrual date is one day after luteal phase ends
    const nextMenstrualDate = moment(lutealPhase.end).add(1, 'days').toDate();
    const ovulationDate = moment(ovulatoryPhase.start).toDate();

    return {
      ovulationDate,
      menstrualDate: nextMenstrualDate,
    };
  } catch (error) {
    console.error('Error predicting cycle dates:', error);
    return { ovulationDate: null, menstrualDate: null };
  }
}