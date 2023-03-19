import { exec } from "child_process";

import { promisify } from "util";
import { DockerContainer } from "./components";

export const execAsync = promisify(exec);

export const stopContainer = async (
  docker: any,
  containerNameIncludes: string
): Promise<DockerContainer | undefined> => {
  const container = await getContainerByName(docker, containerNameIncludes);

  if (container) {
    console.log("Stopping container " + container.Id);
    await container.stop();
  } else {
    console.warn("Unable to find container " + containerNameIncludes);
  }

  return container;
};

export const getContainerByName = async (
  docker: any,
  containerNameIncludes: string
): Promise<DockerContainer | undefined> => {
  const containers = await docker.listContainers();

  const container = containers.find((c) =>
    c.Names.some((n) => n.includes(containerNameIncludes))
  );

  if (container) {
    return docker.getContainer(container.Id);
  } else {
    console.warn("Unable to find container " + containerNameIncludes);
  }

  return undefined;
};
