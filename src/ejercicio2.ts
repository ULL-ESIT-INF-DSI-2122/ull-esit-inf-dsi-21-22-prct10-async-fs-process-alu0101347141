import {existsSync} from 'fs';
import {spawn} from 'child_process';
import * as chalk from 'chalk';

/**
 * Clase WordCounter
 */
class OcurrencesCounter {
  /**
   * Constructor de WordCounter
   * @param {string} file
   */
  constructor(private file: string, private word: string) {
  }
  /**
   * Función para observar un fichero usando pipe()
   */
  catGrepPipe() {
    if (existsSync(this.file)) {
      console.log(chalk.green(`\nLeído fichero ${this.file}:`));
      const cat = spawn('cat', [this.file]);
      const grep = spawn('grep', [this.word]);

      cat.stdout.pipe(grep.stdin);

      let grepOutput = '';

      grep.stdout.on('data', (piece) => {
        grepOutput += piece;
      });

      grep.on('close', () => {
        const expresion = new RegExp(`${this.word}`, 'gi');
        const count: number = (grepOutput.match(expresion) || []).length;
        if (count > 0) {
          console.log(`La palabra ${chalk.yellow(this.word)} aparece en ${chalk.yellow(count.toString())} ocasiones.\n`);
        } else {
          console.log(`No se han encontrado ocurrencias de la palabra ${chalk.yellow(this.word)}`);
        }
      });
    } else {
      console.log(`El fichero ${this.file} no existe`);
    }
  }
  /**
   * Función para observar un fichero sin usar pipe()
   */
  catGrepNoPipe() {
    if (existsSync(this.file)) {
      console.log(chalk.green(`\nLeído fichero ${this.file}:`));
      const cat = spawn('cat', [`${this.file}`]);
      const grep = spawn('grep', [`${this.word}`]);

      cat.stdout.on('data', (piece) => {
        grep.stdin.write(piece);
      });

      let grepOutput = '';

      grep.stdout.on('data', (piece) => {
        grepOutput += piece;
      });

      cat.on('close', () => {
        grep.stdin.end();
      });

      grep.on('close', () => {
        const expresion = new RegExp(`${this.word}`, 'gi');
        const count: number = (grepOutput.match(expresion) || []).length;
        if (count > 0) {
          console.log(`La palabra ${chalk.yellow(this.word)} aparece en ${chalk.yellow(count.toString())} ocasiones.\n`);
        } else {
          console.log(`No se han encontrado ocurrencias de la palabra ${chalk.yellow(this.word)}`);
        }
      });
    }
  }
}

const p = new OcurrencesCounter(process.argv[2], process.argv[3]);
p.catGrepPipe();

/**
 * Descomentar para utilizar el método sin pipe()
 * p.catGrepNoPipe();
*/
