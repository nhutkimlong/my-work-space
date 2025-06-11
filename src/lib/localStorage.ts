export function getLocalData(key: string) {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error getting data from localStorage:', e);
    return [];
  }
}

export function setLocalData(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving data to localStorage:', e);
    throw e;
  }
} 