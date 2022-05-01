import * as yargs from 'yargs';
import * as chalk from 'chalk';
import {spawn} from 'child_process';
import * as fs from 'fs';

/**
 * Wrapper de comandos de linux
*/
export class Wrapper {
  /**
   * Constructor de la clase Wrapper
   */
  constructor() {};

  /**
   * Función para saber si es un directorio o un fichero
  */
  dorf() {
    yargs.command({
      command: 'DorF',
      describe: 'Comprueba si es un directorio o un fichero',
      builder: {
        path: {
          describe: 'Ruta a analizar',
          demandOption: true,
          type: 'string',
        },
      },
      handler(argv) {
        if (typeof(argv.path) === 'string') {
          fs.stat(argv.path, (err, stats) => {
            if (err) {
              return console.log(err);
            }
            if (stats.isFile()) {
              console.log(`${chalk.green(argv.path)} es un fichero`);
            } else if (stats.isDirectory()) {
              console.log(`${chalk.green(argv.path)} es un directorio`);
            }
          });
        }
      },
    });
  }
  /**
   * Función para crear un directorio
   */
  mkDir() {
    yargs.command({
      command: 'mkDir',
      describe: 'Crea un directorio',
      builder: {
        path: {
          describe: 'Ruta del directorio',
          demandOption: true,
          type: 'string',
        },
      },
      handler(argv) {
        if (typeof(argv.path) === 'string') {
          const path: string = argv.path;
          if (!fs.existsSync(argv.path)) {
            const mkdir = spawn('mkdir', [path]);
            mkdir.on('close', () => {
              console.log(`Directorio ${chalk.green(argv.path)} creado correctamente`);
            });
            mkdir.on('error', () => {
              console.log(chalk.red('No se pudo crear el directorio'));
            });
          } else {
            console.log(chalk.red('Ya existe el directorio'));
          }
        }
      },
    });
  }
  /**
   * Función para listar ficheros
   */
  lsFiles() {
    yargs.command({
      command: 'lsF',
      describe: 'Muestra la lista de ficheros de un directorio',
      builder: {
        path: {
          describe: 'Ruta del directorio',
          demandOption: true,
          type: 'string',
        },
      },
      handler(argv) {
        if (typeof(argv.path) === 'string') {
          if (fs.existsSync(argv.path)) {
            const ls = spawn('ls', [argv.path]);
            ls.on('error', (err) => {
              console.log(chalk.red(err));
            });
            ls.stdout.pipe(process.stdout);
          }
        } else {
          console.log(chalk.red('No existe el directorio'));
        }
      },
    });
  }
  /**
   * Función para mostrar el contenido de un fichero
   */
  catFile() {
    yargs.command({
      command: 'catF',
      describe: 'Muestra el contenido de un fichero',
      builder: {
        path: {
          describe: 'Ruta del fichero',
          demandOption: true,
          type: 'string',
        },
      },
      handler(argv) {
        if (typeof(argv.path) === 'string') {
          const path: string = argv.path;
          if (fs.existsSync(argv.path)) {
            const cat = spawn('cat', [path]);
            cat.stdout.pipe(process.stdout);
          } else {
            console.log(chalk.red('No existe el fichero'));
          }
        }
      },
    });
  }
  /**
   * Función para eliminar un fichero o directorio
  */
  rmDorF() {
    yargs.command({
      command: 'rmDorF',
      describe: 'Elimina un fichero o un directorio',
      builder: {
        path: {
          describe: 'Path',
          demandOption: true,
          type: 'string',
        },
      },
      handler(argv) {
        if (typeof(argv.path) === 'string') {
          const path: string = argv.path;
          fs.stat(path, (err, stats) => {
            if (err) {
              return console.log(chalk.red(err));
            }
            if (stats.isDirectory()) {
              const rm = spawn('rm', ['-rf', path]);
              rm.on('close', () => {
                console.log(`Directorio ${chalk.green(path)} eliminado correctamente`);
              });
              rm.on('error', () => {
                console.log(chalk.red('No se pudo eliminar el directorio'));
              });
            } else if (stats.isFile()) {
              const rm = spawn('rm', [path]);
              rm.on('close', () => {
                console.log(`Fichero ${chalk.green(path)} eliminado correctamente`);
              });
              rm.on('error', () => {
                console.log(chalk.red('No se pudo eliminar el fichero'));
              });
            }
          });
        }
      },
    });
  }
  /**
   * Moves or copies a file or directory
   */
  mvDorF() {
    yargs.command({
      command: 'mvDorF',
      describe: 'Show files content',
      builder: {
        origin: {
          describe: 'Ruta de origen',
          demandOption: true,
          type: 'string',
        },
        destiny: {
          describe: 'Ruta de destino',
          demandOption: true,
          type: 'string',
        },
        keep: {
          describe: 'Mantener también en ruta original (copy)',
          demandOption: true,
          type: 'boolean',
        },
      },
      handler(argv) {
        if ((typeof(argv.origin) === 'string') && (typeof(argv.destiny) === 'string')) {
          const origin: string = argv.origin;
          const destiny: string = argv.destiny;
          fs.stat(origin, (err, stats) => {
            if (err) {
              return console.log(chalk.red(err));
            }
            if (argv.keep === false) {
              const mv = spawn('mv', [origin, destiny]);
              mv.on('close', () => {
                if (stats.isDirectory()) {
                  console.log(chalk.green(`Directorio movido a ${destiny}`));
                } else if (stats.isFile()) {
                  console.log(chalk.green(`Fichero movido a ${destiny}`));
                }
              });
            } else {
              const cp = spawn('cp', [origin, destiny]);
              cp.on('close', () => {
                if (stats.isDirectory()) {
                  console.log(chalk.green(`Directorio copiado a ${destiny}`));
                } else if (stats.isFile()) {
                  console.log(chalk.green(`Fichero copiado a ${destiny}`));
                }
              });
            }
          });
        }
      },
    });
  }
}

