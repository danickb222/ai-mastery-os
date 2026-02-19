// Re-export from registry for backward compatibility
export { topics, getTopicById, getNextTopic, getTopicsByDomain } from "./registry";

// Legacy alias
export { getNextTopic as getNextTopicId } from "./registry";
