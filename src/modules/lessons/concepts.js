// CONCEPTS — what each question tests; mastery is tracked per concept
// (mastery.js). Each unit file lists the concepts it teaches, with the
// extra material the learning engine uses:
//   explain   — another way to say it, shown after a miss in a lesson
//   easy      — a gentler question, also shown after a miss
//   challenge — a harder question: challenge runs, placement, review once
//               a concept is strong
import { UNITS, PLACEMENT as PLACEMENT_PAIRS } from "./units/index.js";

// (The index has each concept's name; loadUnits in content.js adds the rest.)
export const CONCEPTS = UNITS.flatMap((u) => u.concepts);
export const conceptById = (id) => CONCEPTS.find((c) => c.id === id) || null;
// Placement: one concept per unit, in course order.
export const PLACEMENT = PLACEMENT_PAIRS.map(([, c]) => c);
