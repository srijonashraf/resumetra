import type { ProfessionKnowledgeBase } from "./types.js";
import { softwareEngineerKB } from "./software_engineer.js";
import { genericKB } from "./generic.js";

const registry = new Map<string, ProfessionKnowledgeBase>([
  ["software_engineer", softwareEngineerKB],
  ["generic", genericKB],
]);

export function getKnowledgeBase(professionId: string): ProfessionKnowledgeBase {
  return registry.get(professionId) ?? genericKB;
}
