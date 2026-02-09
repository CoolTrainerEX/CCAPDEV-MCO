import { create } from "zustand";
import { startOfDay } from "date-fns/startOfDay";
import { roundToNearestMinutes } from "date-fns/roundToNearestMinutes";

/**
 * Stores the current date and time for synchronicity.
 *
 * @author Justin Ryan Uy
 */
export default create<{ now: Date; tick: () => void }>((set) => ({
  now: startOfDay(new Date()),
  tick: () =>
    set({
      now: roundToNearestMinutes(new Date(), {
        nearestTo: 30,
        roundingMethod: "ceil",
      }),
    }),
}));
