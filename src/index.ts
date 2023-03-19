import Docker from "dockerode";
import express from "express";
import { parse } from "yaml";
import {
  BackupComponentConfig,
  backupComponents,
  BackupContext,
  LayupConfig,
} from "./components";

const app = express();
const port = 4809;

process.env.LAYUP_CONFIG = `
schedule: 5 4 * * *
pre: 
  - stop_container: minio
components:
  - type: directory
    from: /var/data/minio
    to: /var/backup/minio
`;

const docker = new Docker({ socketPath: "/var/run/docker.sock" });
const yamlConfig = parse(process.env.LAYUP_CONFIG) as LayupConfig;

app.get("/backup", async (req, res) => {
  const context: BackupContext = {
    docker,
  };

  for (const component of yamlConfig.components) {
    await backupComponent(context, component);
  }

  res.send("Hello World!");
});

app.listen(port, async () => {
  return console.log(`Listening on http://localhost:${port}`);
});

const backupComponent = async (
  context: BackupContext,
  config: BackupComponentConfig
) => {
  const component = backupComponents.find((c) => c.name === config.type);
  if (component) {
    await component.backup(context, config);
  } else {
    console.warn("Unknown backup component: " + config.type);
  }
};
