export function formatDisplayDate(dateInput: any): string {
  if (!dateInput) return 'Just now';
  
  // If it's a Firestore Timestamp object with toDate method
  if (typeof dateInput === 'object' && typeof dateInput.toDate === 'function') {
    try {
      return dateInput.toDate().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  }

  // If it's a number (e.g. timestamp in ms)
  if (typeof dateInput === 'number') {
    return new Date(dateInput).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // If it's a string
  if (typeof dateInput === 'string') {
    const parsed = new Date(dateInput);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  }

  return 'Recently';
}
