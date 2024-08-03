import inquirer from 'inquirer';
import simpleGit from 'simple-git';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Repositorios de GitHub para cada plantilla
const templates = {
  'Backend Modular (Nestjs)': 'https://github.com/Luedan/modular_nest_template.git',
};

const cloneRepo = async (repoUrl, dest) => {
  const git = simpleGit();
  await git.clone(repoUrl, dest);
  console.log(`Template cloned successfully from ${repoUrl}`);
};

const main = async () => {
  const { templateChoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'templateChoice',
      message: '¿Qué plantilla deseas instalar?',
      choices: Object.keys(templates),
    }
  ]);

  const { projectName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: '¿Cuál es el nombre de tu proyecto?',
      validate: input => input ? true : 'El nombre del proyecto no puede estar vacío.',
    }
  ]);

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const destPath = path.join(process.cwd(), projectName);  // Crear la carpeta del proyecto
  const tempDir = path.join(destPath, 'template-temp');

  // Crear la carpeta del proyecto si no existe
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath);
  } else {
    console.log(`La carpeta ${projectName} ya existe. Por favor, elige otro nombre.`);
    return;
  }

  // Clonar el repositorio seleccionado en una carpeta temporal
  await cloneRepo(templates[templateChoice], tempDir);

  // Eliminar la carpeta .git para evitar conflictos
  fs.rmSync(path.join(tempDir, '.git'), { recursive: true });

  // Mover archivos desde la carpeta clonada a la carpeta del proyecto
  fs.readdirSync(tempDir).forEach(file => {
    const srcFile = path.join(tempDir, file);
    const destFile = path.join(destPath, file);
    fs.renameSync(srcFile, destFile);
  });

  // Eliminar la carpeta temporal
  fs.rmSync(tempDir, { recursive: true });

  console.log(`Template installed successfully in ${projectName}`);
};

main().catch(error => console.error(error));
