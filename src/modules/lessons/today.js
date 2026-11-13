// TODAY'S BEST NEXT STEP — one suggestion, with a one-line reason, worked out
// from what's already on the device: where the learner is in the course, what's
// due for review, this week's mission, Your Money Year, their goal, and whether
// they've already learned today. No new data, nothing sent anywhere.
//   lesson   the next lesson (the default)
//   review   a lot has slipped, or the lesson is done for today
//   mission  this week's real-life mission, after today's lesson
//   year     Your Money Year, after today's lesson (once the basics are in)
export const REVIEW_FIRST = 6; // this many ideas due: refresh before more new things
export const REVIEW_AFTER = 3; // after today's lesson, a review is worth suggesting from this many

export function bestNext({ lessonsDone = 0, hasLesson = false, due = 0, mission = null, year = null, goal = null, doneToday = false }) {
  const lesson = () => (hasLesson ? { kind: "lesson", reason: !lessonsDone ? "first" : doneToday ? "more" : goal ? "goal" : "course" } : null);
  if (!lessonsDone && hasLesson) return lesson();
  if (due >= REVIEW_FIRST && !doneToday) return { kind: "review", reason: "review" };
  if (!doneToday) return lesson() || afterLesson({ due, mission, year, lessonsDone });
  return afterLesson({ due, mission, year, lessonsDone }) || lesson();
}
// What to suggest once today's lesson is done (or the course is).
function afterLesson({ due, mission, year, lessonsDone }) {
  if (due >= REVIEW_AFTER) return { kind: "review", reason: "review" };
  if (mission) return { kind: "mission", reason: "mission" };
  if (year && lessonsDone >= 6) {
    if (year.running) return { kind: "year", reason: "year_go" };
    if (!year.finished) return { kind: "year", reason: "year_new" };
  }
  return null;
}

// ADAPTING TO THE LEARNER on the finish screen: "skip" after three perfect lessons in a row (not if they've
// already used the check, or were offered it in the last two weeks), "review" after a tricky lesson (three
// or more misses) when there is something to review; otherwise nothing.
export const SKIP_AFTER = 3;
export const SKIP_EVERY_DAYS = 14;
export function adaptOffer({ mistakes = 0, cleanRun = 0, placed = 0, offeredAt = null, today, due = 0, hasNext = false }) {
  const recently = offeredAt && (Date.parse(today) - Date.parse(offeredAt)) / 864e5 < SKIP_EVERY_DAYS;
  if (mistakes === 0 && cleanRun >= SKIP_AFTER && !placed && !recently && hasNext) return "skip";
  if (mistakes >= 3 && due > 0) return "review";
  return null;
}
