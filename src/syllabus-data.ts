import { parseSyllabus } from "./content";
import syllabus from "../syllabus.md?raw";

/**
 * Parsed syllabus shared by the explorer, the progress page and backup
 * validation. Importing it once keeps topic IDs consistent everywhere.
 */
export const subjects = parseSyllabus(syllabus);

export const subjectById = new Map(
  subjects.map((subject) => [subject.id, subject]),
);

export const topicById = new Map(
  subjects.flatMap((subject) =>
    subject.topics.map((topic) => [topic.id, { ...topic, subject }] as const),
  ),
);
