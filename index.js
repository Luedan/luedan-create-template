import inquirer from "inquirer";
import simpleGit from "simple-git";
import path from "path";
import fs from "fs";

// Repositorios de GitHub para cada plantilla
const templates = {
  "Backend modular": "https://github.com/Luedan/modular_nest_template.git"
};

const cloneRepo = async (repoUrl, dest) => {
  const git = simpleGit();

  // Clonar el repositorio en la carpeta de destino
  await git.clone(repoUrl, dest);

  console.log(`Template cloned successfully from ${repoUrl}`);
};

const main = async () => {
  const { templateChoice } = await inquirer.prompt([
    {
      type: "list",
      name: "templateChoice",
      message: "¿Qué plantilla deseas instalar?",
      choices: Object.keys(templates),
    },
  ]);

  const destPath = process.cwd();
  const tempDir = path.join(destPath, "template-temp");

  // Clonar el repositorio seleccionado
  await cloneRepo(templates[templateChoice], tempDir);

  // Mover archivos desde la carpeta clonada a la raíz del proyecto
  fs.readdirSync(tempDir).forEach((file) => {
    const srcFile = path.join(tempDir, file);
    const destFile = path.join(destPath, file);

    fs.renameSync(srcFile, destFile);
  });

  // Eliminar la carpeta temporal
  fs.rmdirSync(tempDir, { recursive: true });

  console.log("Template installed successfully.");
};

main().catch((error) => console.error(error));
