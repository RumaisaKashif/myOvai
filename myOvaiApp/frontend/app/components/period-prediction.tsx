import moment from "moment";
import { Dispatch, SetStateAction } from "react";

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
};

export const updateNextPeriodDays = (
    cycles: Cycle[],
    setNextPeriodDays: Dispatch<SetStateAction<number | null>>
) => {
    if (!cycles.length) {
        setNextPeriodDays(null);
        return;
    }

    const latestCycle = cycles
        .filter(cycle => { 
            const menstrualPhase = cycle.phases.find(phase => phase.name === "Menstrual");
            return menstrualPhase?.start && menstrualPhase?.end;
        })
        .sort((cycleA, cycleB) => 
            moment(cycleB.phases[0]?.start).diff(moment(cycleA.phases[0]?.start)))[0];
    
    if (!latestCycle) {
        setNextPeriodDays(null);
        return;
    }

    const lutealPhase = latestCycle.phases.find(phase => phase.name === "Luteal" && phase.end);

    if (lutealPhase) {
        const nextPeriodDate = moment(lutealPhase.end).add(1, "days");
        const daysUntilNextPeriod = nextPeriodDate.diff(moment(), "days");
        setNextPeriodDays(daysUntilNextPeriod);
    } else {
        setNextPeriodDays(null);
    }
};