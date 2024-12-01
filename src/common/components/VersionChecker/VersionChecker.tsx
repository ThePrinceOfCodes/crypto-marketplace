import React, { useEffect, useState } from "react";
import fetchVersion from "../../utils/version";
import { toast } from "react-toastify";
const VersionChecker: React.FC = () => {
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [newVersion, setNewVersion] = useState<string | null>(null);
  const [newVersionAcknowledged, setNewVersionAcknowledged] =
    useState<boolean>(false);

  useEffect(() => {
    const checkAndUpdateVersion = async () => {
      const latestVersion = await fetchVersion();
      if (!latestVersion) return;
      if (!currentVersion) {
        setCurrentVersion(latestVersion.toString());
      } else if (
        currentVersion &&
        currentVersion !== latestVersion.toString()
      ) {
        if (
          newVersion &&
          newVersionAcknowledged &&
          newVersion === latestVersion.toString()
        ) {
          return;
        }
        setNewVersion(latestVersion.toString());
        notifyNewVersion(latestVersion.toString());
        setNewVersionAcknowledged(true);
      }
    };

    checkAndUpdateVersion();

    const intervalId = setInterval(checkAndUpdateVersion, 10000);

    return () => clearInterval(intervalId);
  }, [currentVersion, newVersionAcknowledged, newVersion]);

  return null; // This component doesn't render anything
};

const notifyNewVersion = (newVersion: string) => {
  toast.info(
    <div>
      <span>{`New version ${newVersion} is available. `}</span>
      <div className="py-4">
        <button
          className="ml-1 w-28 group rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => {
            location.reload();
            toast.dismiss();
          }}
        >
          Refresh
        </button>
        <button
          className="ml-1 w-28 group rounded-md border border-blue-600 bg-white py-2 text-sm font-medium text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => toast.dismiss()}
        >
          Ignore
        </button>
      </div>
    </div>,
    {
      autoClose: false,
    },
  );
};

export default VersionChecker;
