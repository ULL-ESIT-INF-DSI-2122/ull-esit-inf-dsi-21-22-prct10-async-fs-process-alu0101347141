import {watch, existsSync} from 'fs';
import {spawn} from 'child_process';

/**
 * Clase FileWatcher
 */
export class FileWatcher {
  private command: string;
  private arguments: string[] = [];
  private file: string;

  /**
   * Constructor de FileWatcher
   * @param {string[]} array
   */
  constructor(array: string[]) {
    this.file = array[array.length-1];
    this.command = array[2];
    for (let i: number = 2; i < array.length-1; i++) {
      this.arguments.push(array[i]);
    }
  }
  /**
   * Función para observar un fichero
   */
  watchLS() {
    if (existsSync(this.file)) {
      const watcher = watch(this.file, (event, filename) => {
        if (event == 'rename') {
          console.log('WATCH FINALIZADO: El fichero se ha eliminado o renombrado');
          watcher.close();
        } else {
          const argumentArray: string[] = this.arguments.concat(filename);
          const ls = spawn(this.command, argumentArray);
          ls.stdout.pipe(process.stdout);
          let lsOutput = '';
          ls.stdout.on('data', (piece) => lsOutput += piece);
          /*
          ls.on('close', () => {
            const lsOutputAsArray = lsOutput.split(/\s+/);
            console.log(`Los permisos del ${filename} son:  ${lsOutputAsArray[0]}\n`);
          });
          */
        }
      });
      watcher.on('error', () => {
        watcher.close();
      });
    } else {
      console.log(`El fichero ${this.file} no existe`);
    }
  }
}

const p = new FileWatcher(process.argv);
p.watchLS();
