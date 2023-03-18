import { dirname } from "path";
import { BackupComponent, BackupContext } from ".";
import { execAsync, stopContainer } from "../utils";

export type DirectoryBackupConfig = {
  type: "folder";
  stop_container?: string;
  from: string;
  to: string;
};

export const DirectoryBackupComponent: BackupComponent<DirectoryBackupConfig> =
  {
    name: "directory",
    backup: async (
      { docker }: BackupContext,
      config: DirectoryBackupConfig
    ) => {
      const { stop_container, from, to } = config;

      let container = undefined;
      if (stop_container) {
        container = await stopContainer(docker, stop_container);
      }

      console.log(`ryncing ${from} -> ${to}`);
      await rsyncDirectory(from, to);

      if (container) {
        await container.start();
      }
    },

    restore: async (
      context: BackupContext,
      config: DirectoryBackupConfig
    ) => {},
  };

export const rsyncDirectory = async (from: string, to: string) => {
  // rsync will will copy any folders into the directory below the destination given, so we
  // want to use the parent directory
  const dest = dirname(to);

  const result = await execAsync(`rsync -r --delete ${from} ${dest}`);
  return result;
};
