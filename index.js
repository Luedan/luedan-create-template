#!/usr/bin/env node

import inquirer from "inquirer";
import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Repositorios de GitHub para cada plantilla
const templates = {
  "Backend Modular (Nestjs)":
    "https://github.com/Luedan/modular_nest_template.git",
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

  const { projectName } = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "¿Cuál es el nombre de tu proyecto?",
      validate: (input) =>
        input ? true : "El nombre del proyecto no puede estar vacío.",
    },
  ]);

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const destPath = path.join(process.cwd(), projectName);
  const gitDir = path.join(destPath, ".git");

  // Crear la carpeta del proyecto si no existe
  if (fs.existsSync(destPath)) {
    console.log(
      `La carpeta ${projectName} ya existe. Por favor, elige otro nombre.`
    );
    process.exit(1);
  }

  console.log("Clonando el repositorio...");
  // execSync(`git clone ${templates[templateChoice]} ${projectName}`, {
  //   stdio: "inherit",
  // });

  exec(`git clone ${templates[templateChoice]} ${projectName}`, (err) => {
    if (err) {
      console.error(err);
      return;
    }

    if (fs.existsSync(gitDir)) {
      fs.rmSync(gitDir, { recursive: true, force: true });
    }
  });

  console.log(`Template instalado exitosamente en ${projectName}`);
};

main().catch((error) => {
  console.error("ERROR!", error);
  process.exit(1);
});
