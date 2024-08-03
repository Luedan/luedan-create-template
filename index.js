#!/usr/bin/env node

import inquirer from "inquirer";
import { exec, spawn } from "child_process";
import path from "path";
import fs from "fs";

// Repositorios de GitHub para cada plantilla
const templates = {
  "Backend Modular (Nestjs + TypeORM + AutoMapper + Swagger + DDD)":
    "https://github.com/Luedan/modular_nest_template.git",
  "Backend DDD & SOA (Nestjs + TypeORM + AutoMapper + Swagger)":
    "https://github.com/Luedan/DDD-SOA-TEMPLATE-NEST.git",
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

  const { packageInstaller } = await inquirer.prompt([
    {
      type: "list",
      name: "packageInstaller",
      message: "¿Qué gestor de paquetes deseas utilizar?",
      choices: ["npm", "yarn", "pnpm"],
    },
  ]);

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

  exec(`git clone ${templates[templateChoice]} ${projectName}`, (err) => {
    if (err) {
      console.error(err);
      return;
    }

    if (fs.existsSync(gitDir)) {
      // Eliminar la carpeta .git
      fs.rmSync(gitDir, { recursive: true, force: true });

      // Eliminar los archivos de bloqueo de los gestores de paquetes
      exec(
        "rm -f package-lock.json yarn.lock pnpm-lock.yaml",
        { cwd: destPath },
        (err) => {
          if (err) {
            console.error(err);
            return;
          }
        }
      );

      // inicializar git

      exec("git init", { cwd: destPath }, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });

      // Instalar dependencias
      console.log("Instalando dependencias...");
      const installCommand = packageInstaller;
      const installArgs = ["install"];

      const installProcess = spawn(installCommand, installArgs, {
        cwd: destPath,
        stdio: "inherit",
        shell: true,
      });

      installProcess.on("close", (code) => {
        if (code === 0) {
          console.log("Dependencias instaladas exitosamente.");
        } else {
          console.error(
            `El proceso de instalación terminó con el código ${code}`
          );
        }
      });

      installProcess.on("error", (err) => {
        console.error("Error al instalar las dependencias:", err);
      });
    }
  });

  console.log(`Template instalado exitosamente en ${projectName}`);
};

main().catch(() => {
  console.error("Salida inesperada");
  process.exit(1);
});
