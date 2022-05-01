import * as yargs from 'yargs';
import * as chalk from 'chalk';
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
  dof() {
    yargs.command({
      command: 'dof',
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
          fs.lstat(argv.path, (err, stats) => {
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
          console.log('aa');

          fs.mkdir(argv.path, {recursive: true}, (err) => {
            if (err) {
              return console.log(chalk.red('No se pudo crear el directorio'));
            }
            console.log(`Directorio ${chalk.green(argv.path)} creado correctamente`);
          });
        }
      },
    });
  }
}
