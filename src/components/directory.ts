import { dirname } from "path";
import { BackupComponent, BackupContext } from ".";
import { execAsync } from "../utils";

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
      context: BackupContext,
      config: DirectoryBackupConfig
    ): Promise<BackupContext> => {
      const { from, to } = config;

      console.log(`ryncing ${from} -> ${to}`);
      await rsyncDirectory(from, to);

      return context;
    },

    restore: async (
      context: BackupContext,
      config: DirectoryBackupConfig
    ): Promise<BackupContext> => {
      return context;
    },
  };

export const rsyncDirectory = async (from: string, to: string) => {
  // rsync will will copy any folders into the directory below the destination given, so we
  // want to use the parent directory
  const dest = dirname(to);

  const result = await execAsync(`rsync -r --delete ${from} ${dest}`);
  return result;
};
