import {watch, existsSync} from 'fs';
import {spawn} from 'child_process';
import {argv} from 'process';

/**
 * Clase para vigilar cambios en el directorio /notes
 */
class NoteWatcher {
  private path: string;
  /**
   * Constructor de la clase Watcher
   * @param {string} path
   */
  constructor(private user: string) {
    this.path = './notas/' + user + '/';
  }

  /**
   * Función para vigilar los cambios en el directorio
   */
  watchDir() {
    const watcher = watch(this.path, (event, filename) => {
      switch (event) {
        case 'change':
          console.log('Se ha modificado el directorio: Nota creada / editada -> ' + filename + '\nContenido:\n');
          this.printContent(filename);
          break;
        case 'rename':
          if (existsSync(this.path)) {
            console.log('Se ha modificado el directorio: Nota eliminada -> ' + filename);
          } else {
            console.log('Se ha eliminado el directorio del usuario: ' + this.user);
          }
          break;
      }
    });
    watcher.on('error', () => {
      watcher.close();
    });
  }

  /**
   * Función para mostrar el contenido del fichero que almacena la nota
   * @param {string} file
   */
  printContent(file: string) {
    const cat = spawn('cat', [this.path.concat(file)]);

    let catOutput = '';
    cat.stdout.on('data', (piece) => {
      catOutput += piece;
    });

    cat.stdout.on('close', () => {
      console.log(catOutput);
    });
  }
}

const watcher = new NoteWatcher(argv[2]);
watcher.watchDir();
