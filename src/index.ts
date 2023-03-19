import Docker from "dockerode";
import express from "express";
import { parse } from "yaml";
import {
  BackupComponentConfig,
  backupComponents,
  BackupContext,
  DockerContainer,
  LayupConfig,
} from "./components";
import { stopContainer } from "./utils";

const app = express();
const port = 4809;

process.env.LAYUP_CONFIG = `
schedule: 5 4 * * *
pre: 
  stop_containers: 
    - minio
components:
  - type: directory
    from: /var/data/minio
    to: /var/backup/minio
`;

const docker = new Docker({ socketPath: "/var/run/docker.sock" });
const yamlConfig = parse(process.env.LAYUP_CONFIG) as LayupConfig;

console.log("Config: ", yamlConfig);

app.get("/backup", async (req, res) => {
  let context: BackupContext = {
    docker,
    stoppedContainers: [],
  };

  context = await performPreTasks(context, yamlConfig);

  for (const component of yamlConfig.components) {
    context = await backupComponent(context, component);
  }

  context = await performPostTasks(context, yamlConfig);

  res.send("Backup complete");
});

app.get("/restore", async (req, res) => {
  let context: BackupContext = {
    docker,
    stoppedContainers: [],
  };

  context = await performPreTasks(context, yamlConfig);

  for (const component of yamlConfig.components) {
    context = await backupComponent(context, component);
  }

  context = await performPostTasks(context, yamlConfig);

  res.send("Restore complete");
});

app.listen(port, async () => {
  return console.log(`Listening on http://localhost:${port}`);
});

const performPreTasks = async (
  context: BackupContext,
  config: LayupConfig
): Promise<BackupContext> => {
  const stoppedContainers: DockerContainer[] = [];

  if (config.pre?.stop_containers) {
    const { stop_containers } = config.pre;

    for (const containerName of stop_containers) {
      const container = await stopContainer(context.docker, containerName);

      if (container) {
        stoppedContainers.push(container);
      }
    }
  }

  return {
    ...context,
    stoppedContainers,
  };
};

const performPostTasks = async (
  context: BackupContext,
  config: LayupConfig
): Promise<BackupContext> => {
  for (const stoppedContainer of context.stoppedContainers) {
    await stoppedContainer.start();
  }

  return context;
};

const backupComponent = async (
  context: BackupContext,
  config: BackupComponentConfig
): Promise<BackupContext> => {
  const component = backupComponents.find((c) => c.name === config.type);

  if (component) {
    context = await component.backup(context, config);
  } else {
    console.warn("Unknown backup component: " + config.type);
  }

  return context;
};
