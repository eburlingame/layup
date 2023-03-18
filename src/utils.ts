import { exec } from "child_process";

import { promisify } from "util";

export const execAsync = promisify(exec);

export const stopContainer = async (
  docker: any,
  containerNameIncludes: string
) => {
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
