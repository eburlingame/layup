import { exec } from "child_process";
import Docker from "dockerode";
import { dirname } from "path";
import { promisify } from "util";
import { parse } from "yaml";

const execAsync = promisify(exec);

type DirectoryBackupComponent = {
  type: "folder";
  stop_container?: string;
  from: string;
  to: string;
};

type BackupComponent = DirectoryBackupComponent;

type LayupConfig = BackupComponent[];

process.env.LAYUP_CONFIG = `
- type: folder
  stop_container: minio
  from: /var/data/minio
  to: /var/backup/minio
`;

const main = async () => {
  const docker = new Docker({ socketPath: "/var/run/docker.sock" });

  const config: LayupConfig = parse(process.env.LAYUP_CONFIG);

  for (const component of config) {
    await backupComponent(docker, component);
  }
};

const backupComponent = async (docker: any, component: BackupComponent) => {
  switch (component.type) {
    case "folder":
      backupFolder(docker, component);
      break;

    default:
      break;
  }
};

const backupFolder = async (
  docker: any,
  component: DirectoryBackupComponent
) => {
  let container = undefined;
  if (component.stop_container) {
    container = await stopContainer(docker, component.stop_container);
  }

  console.log(`ryncing ${component.from} -> ${component.to}`);
  await rsyncDirectory(component.from, component.to);

  if (container) {
    await container.start();
  }
};

const rsyncDirectory = async (from: string, to: string) => {
  // rsync will will copy any folders into the directory below the destination given, so we
  // want to use the parent directory
  const dest = dirname(to);

  const result = await execAsync(`rsync -r --delete ${from} ${dest}`);
  console.log(result);
  return result;
};

const stopContainer = async (docker: any, containerNameIncludes: string) => {
  const container = await getContainerByName(docker, containerNameIncludes);

  if (container) {
    console.log("Stopping container " + container.Id);
    await container.stop();
  } else {
    console.warn("Unable to find container " + containerNameIncludes);
  }

  return container;
};

const getContainerByName = async (
  docker: any,
  containerNameIncludes: string
): Promise<any | undefined> => {
  const containers = await docker.listContainers();

  const container = containers.find((c) =>
    c.Names.some((n) => n.includes(containerNameIncludes))
  );

  if (container) {
    console.log("Starting container " + container.Id);
    return docker.getContainer(container.Id);
  } else {
    console.warn("Unable to find container " + containerNameIncludes);
  }

  return undefined;
};

setTimeout(main, 3000);
