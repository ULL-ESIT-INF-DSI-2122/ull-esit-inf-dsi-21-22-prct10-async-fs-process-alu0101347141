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
      command: 'mkD',
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
            fs.readFile(path, function(err, data) {
              if (err) {
                console.log(err);
              }
              console.log(data.toString());
            });
          } else {
            console.log(chalk.red('No existe el fichero'));
          }
        }
      },
    });
  }
}

