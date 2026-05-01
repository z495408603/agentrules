import { readConfig } from "../core/config";
import { writeGeneratedFiles } from "../core/render";

export async function runGenerateCommand(cwd: string): Promise<void> {
  const config = await readConfig(cwd);

  await writeGeneratedFiles(cwd, config);
}
