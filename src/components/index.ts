import Docker from "dockerode";
import { DirectoryBackupComponent, DirectoryBackupConfig } from "./directory";

export type BackupContext = {
  docker: Docker;
};

export type BackupComponent<C> = {
  name: string;
  backup: (context: BackupContext, config: C) => Promise<void>;
  restore: (context: BackupContext, config: C) => Promise<void>;
};

export type LayupConfig = {
  schedule?: string;
  stop_first?: string[];
  components: BackupComponentConfig[];
};

export type BackupComponentConfig = DirectoryBackupConfig;

export const backupComponents = [DirectoryBackupComponent];
