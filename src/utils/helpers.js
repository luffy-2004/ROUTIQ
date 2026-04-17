// Utility functions for time calculations

export const formatMinutes = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export const calculateStreak = (completionDates) => {
  // Calculate consecutive days of completion
  return 0;
};
