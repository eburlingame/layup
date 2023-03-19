import Docker from "dockerode";
import { DirectoryBackupComponent, DirectoryBackupConfig } from "./directory";

export type DockerContainer = {
  Id: string;
  stop: () => Promise<void>;
  start: () => Promise<void>;
};

export type BackupContext = {
  docker: Docker;
  stoppedContainers: any;
};

export type BackupComponent<C> = {
  name: string;
  backup: (context: BackupContext, config: C) => Promise<BackupContext>;
  restore: (context: BackupContext, config: C) => Promise<BackupContext>;
};

export type PreOptions = {
  stop_containers: string[];
};

export type PostOptions = {};

export type LayupConfig = {
  schedule?: string;
  pre?: PreOptions;
  post?: PostOptions;
  components: BackupComponentConfig[];
};

export type BackupComponentConfig = DirectoryBackupConfig;

export const backupComponents = [DirectoryBackupComponent];
