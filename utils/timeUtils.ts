/**
 * Formats cooking time from minutes to a human-readable string
 * Converts to hours, days, months, years with floating points when appropriate
 * 
 * @param minutes - The cooking time in minutes (can be string or number)
 * @returns Formatted time string (e.g., "1.5 hours", "2.3 days", "30 min")
 */
export const formatCookingTime = (minutes: string | number | undefined): string => {
  if (!minutes) return "";
  
  const mins = typeof minutes === "string" ? parseFloat(minutes) : minutes;
  if (isNaN(mins) || mins <= 0) return "";
  
  // Less than 60 minutes - show as minutes with decimal if needed
  if (mins < 60) {
    if (mins % 1 === 0) {
      return `${Math.round(mins)} min`;
    }
    return `${mins.toFixed(1)} min`;
  }
  
  // Convert to hours
  const hours = mins / 60;
  
  // Less than 24 hours - show as hours
  if (hours < 24) {
    if (hours % 1 === 0) {
      return `${Math.round(hours)} ${hours === 1 ? "hour" : "hours"}`;
    }
    return `${hours.toFixed(1)} ${hours === 1 ? "hour" : "hours"}`;
  }
  
  // Convert to days
  const days = hours / 24;
  
  // Less than 30 days - show as days
  if (days < 30) {
    if (days % 1 === 0) {
      return `${Math.round(days)} ${days === 1 ? "day" : "days"}`;
    }
    return `${days.toFixed(1)} ${days === 1 ? "day" : "days"}`;
  }
  
  // Convert to months (approximate: 30 days = 1 month)
  const months = days / 30;
  
  // Less than 12 months - show as months
  if (months < 12) {
    if (months % 1 === 0) {
      return `${Math.round(months)} ${months === 1 ? "month" : "months"}`;
    }
    return `${months.toFixed(1)} ${months === 1 ? "month" : "months"}`;
  }
  
  // Convert to years (approximate: 12 months = 1 year)
  const years = months / 12;
  
  if (years % 1 === 0) {
    return `${Math.round(years)} ${years === 1 ? "year" : "years"}`;
  }
  return `${years.toFixed(1)} ${years === 1 ? "year" : "years"}`;
};

