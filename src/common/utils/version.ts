interface VersionData {
    version: number;
  }
  
  const fetchVersion = async (): Promise<number | null> => {
    try {
      const response = await fetch('/version.json');
      const data: VersionData = await response.json();
      return data.version;
    } catch (error) {
      console.error('Error fetching version:', error);
      return null;
    }
  };
  
  export default fetchVersion;