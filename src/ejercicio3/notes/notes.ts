import * as chalk from 'chalk';
import * as yargs from 'yargs';
import * as fs from 'fs';

/**
 * Clase para gestionar notas
 */
export class Notes {
  /**
   * Constructor de la clase Notes
   */
  constructor() {};
  /**
   * Función para añadir una nota
   */
  add() {
    yargs.command({
      command: 'add',
      describe: 'Añade una nueva nota',
      builder: {
        title: {
          describe: 'Titulo de la nota',
          demandOption: true,
          type: 'string',
        },
        user: {
          describe: 'Autor de la nota',
          demandOption: true,
          type: 'string',
        },
        body: {
          describe: 'Contenido de la nota',
          demandOption: true,
          type: 'string',
        },
        color: {
          describe: 'Color de la nota',
          demandOption: true,
          type: 'string',
        },
      },
      handler(argv) {
        if ((typeof argv.user === 'string') && (typeof argv.title === 'string') && (typeof argv.body === 'string') &&
    (typeof argv.color === 'string')) {
          const user: string = argv.user;
          const title: string = argv.title;
          const body: string = argv.body;
          const color: string = argv.color;

          const dir: string = './notas/' + argv.user;
          fs.mkdir(dir, {recursive: true}, (err) => {
            if (err) {
              console.log(chalk.red('No se pudo crear el directorio general' + argv.user));
            } else {
              fs.readdir(dir, (err, notas) => {
                if (err) {
                  console.log(chalk.red('No se pudo examinar el directorio en busca de notas'));
                } else if (notas.includes(title)) {
                  console.log(chalk.red('¡Ya existe esta nota!'));
                } else {
                  const path = './notas/' + argv.user + '/' + argv.title;
                  const dir: string = './notas/' + argv.user;
                  fs.mkdir(dir, {recursive: true}, (err) => {
                    if (err) {
                      console.log(chalk.red('No se pudo crear el directorio del usuario' + argv.user));
                    }
                    const json: string = JSON.stringify({title: title, user: user, body: body, color: color});
                    fs.writeFile(path, json, (err) => {
                      if (err) {
                        console.log(chalk.red('No se pudo añadir la nota [' + argv.title + '] del usuario ' + argv.user));
                      } else console.log(chalk.green('Se ha añadido la nota [' + argv.title + '] del usuario ' + argv.user));
                    });
                  });
                }
              });
            }
          });
        }
      },
    });
  }
  /**
   * Función para generar una lista de notas
   */
  list() {
    yargs.command({
      command: 'list',
      describe: 'Muestra las notas de un usuario',
      builder: {
        user: {
          describe: 'Autor de la nota',
          demandOption: true,
          type: 'string',
        },
      },
      handler(argv) {
        {
          if (typeof argv.user === 'string') {
            const user: string = argv.user;
            const dir: string = './notas/';
            fs.readdir(dir, (err, usuarios) => {
              if (err) {
                console.log(chalk.red('No se pudo examinar el directorio en en busca de usuarios'));
              } else if (!usuarios.includes(user)) {
                console.log(chalk.red('No existe el usuario ' + argv.user));
              } else {
                const dirUser: string = './notas/' + argv.user;
                fs.readdir(dirUser, (err, notas) => {
                  if (err) {
                    console.log(chalk.red('No se pudo examinar el directorio en busca de notas'));
                  } else {
                    console.log(chalk.green('Mostradas notas de ' + user + '\n-------------------------'));
                    notas.forEach((nota) => {
                      let contenido: string = '';
                      const pathNota: string = dirUser + '/' + nota;
                      fs.readFile(pathNota, (err, data) => {
                        if (err) {
                          console.log(chalk.red('No se pudo leer el fichero'));
                        } else {
                          contenido = data.toString();
                          const json = JSON.parse(contenido);
                          switch (json.color) {
                            case 'rojo':
                              console.log(chalk.red('- ' + nota));
                              break;
                            case 'verde':
                              console.log(chalk.green('- ' + nota));
                              break;
                            case 'azul':
                              console.log(chalk.blue('- ' + nota));
                              break;
                            case 'amarillo':
                              console.log(chalk.yellow('- ' + nota));
                              break;
                          }
                        }
                      });
                    });
                  };
                });
              }
            });
          }
        }
      },
    });
  }
  /**
   * Función para modificar una nota
   */
  modify() {
    yargs.command({
      command: 'modify',
      describe: 'Edita el contenido de una nota',
      builder: {
        user: {
          describe: 'Autor de la nota',
          demandOption: true,
          type: 'string',
        },
        title: {
          describe: 'Titulo de la nota',
          demandOption: true,
          type: 'string',
        },
        edit: {
          describe: 'Nuevo contenido de la nota',
          demandOption: true,
          type: 'string',
        },
      },
      handler(argv) {
        {
          if ((typeof argv.user === 'string') && (typeof argv.title === 'string') && (typeof argv.edit === 'string')) {
            const user: string = argv.user;
            const title: string = argv.title;
            const contenido: string = argv.edit;
            const dir: string = './notas/';
            fs.readdir(dir, (err, usuarios) => {
              if (err) {
                console.log(chalk.red('No se pudo examinar el directorio en busca de usuarios'));
              } else if (!usuarios.includes(user)) {
                console.log(chalk.red('No existe el usuario ' + argv.user));
              } else {
                const dirUser: string = './notas/' + argv.user;
                fs.readdir(dirUser, (err, notas) => {
                  if (err) {
                    console.log(chalk.red('No se pudo examinar el directorio en busca de notas'));
                  } else {
                    if (!notas.includes(title)) {
                      console.log(chalk.red('No existe la nota ' + title + ' de ' + user));
                    } else {
                      const pathNota: string = dirUser + '/' + title;
                      fs.readFile(pathNota, (err, data) => {
                        if (err) {
                          console.log(chalk.red('No se pudo leer el fichero a modificar'));
                        } else {
                          const noteData = data.toString();
                          const json = JSON.parse(noteData);
                          const newNoteData: string = JSON.stringify({title: json.title, user: json.user, body: contenido, color: json.color});
                          fs.writeFile(pathNota, newNoteData, (err) => {
                            if (err) {
                              console.log(chalk.red('No se pudo sobreescribir el fichero'));
                            } else {
                              console.log(chalk.green('Se modificó correctamente la nota'));
                            }
                          });
                        }
                      });
                    };
                  }
                });
              }
            });
          }
        }
      },
    });
  }
  /**
   * Función para abrir una nota
   */
  open() {
    yargs.command({
      command: 'open',
      describe: 'Muestra el contenido de una nota',
      builder: {
        user: {
          describe: 'Autor de la nota',
          demandOption: true,
          type: 'string',
        },
        title: {
          describe: 'Titulo de la nota',
          demandOption: true,
          type: 'string',
        },
      },
      handler(argv) {
        {
          if ((typeof argv.user === 'string') && (typeof argv.title === 'string')) {
            const user: string = argv.user;
            const title: string = argv.title;
            const dir: string = './notas/';
            fs.readdir(dir, (err, usuarios) => {
              if (err) {
                console.log(chalk.red('No se pudo examinar el directorio en busca de usuarios'));
              } else if (!usuarios.includes(user)) {
                console.log(chalk.red('No existe el usuario ' + argv.user));
              } else {
                const dirUser: string = './notas/' + argv.user;
                fs.readdir(dirUser, (err, notas) => {
                  if (err) {
                    console.log(chalk.red('No se pudo examinar el directorio en busca de notas'));
                  } else {
                    if (!notas.includes(title)) {
                      console.log(chalk.red('No existe la nota ' + title + ' de ' + user));
                    } else {
                      let contenido: string = '';
                      const pathNota: string = dirUser + '/' + title;
                      fs.readFile(pathNota, (err, data) => {
                        if (err) {
                          console.log(chalk.red('No se pudo leer el fichero'));
                        } else {
                          console.log(chalk.green('Mostrando ' + title + ', de ' + user + '\n----------------------\n'));
                          contenido = data.toString();
                          const json = JSON.parse(contenido);
                          switch (json.color) {
                            case 'rojo':
                              console.log(chalk.red(json.body));
                              break;
                            case 'verde':
                              console.log(chalk.green(json.body));
                              break;
                            case 'azul':
                              console.log(chalk.blue(json.body));
                              break;
                            case 'amarillo':
                              console.log(chalk.yellow(json.body));
                              break;
                          }
                        }
                      });
                    };
                  }
                });
              }
            });
          }
        }
      },
    });
  }
  /**
   * Función para eliminar una nota
   */
  remove() {
    yargs.command({
      command: 'remove',
      describe: 'Elimina una nota',
      builder: {
        user: {
          describe: 'Autor de la nota',
          demandOption: true,
          type: 'string',
        },
        title: {
          describe: 'Titulo de la nota',
          demandOption: true,
          type: 'string',
        },
      },
      handler(argv) {
        {
          if ((typeof argv.user === 'string') && (typeof argv.title === 'string')) {
            const user: string = argv.user;
            const title: string = argv.title;
            const dir: string = './notas/';
            fs.readdir(dir, (err, usuarios) => {
              if (err) {
                console.log(chalk.red('No se pudo examinar el directorio en busca de usuarios'));
              } else if (!usuarios.includes(user)) {
                console.log(chalk.red('No existe el usuario ' + argv.user));
              } else {
                const dirUser: string = './notas/' + argv.user;
                fs.readdir(dirUser, (err, notas) => {
                  if (err) {
                    console.log(chalk.red('No se pudo examinar el directorio en busca de notas'));
                  } else {
                    fs.readdir(dirUser, (err, notas) => {
                      if (err) {
                        console.log(chalk.red('No se pudo examinar el directorio en busca de notas'));
                      } else if (!notas.includes(title)) {
                        console.log(chalk.red('No existe la nota ' + title + ' de ' + user));
                      } else {
                        const path = './notas/' + user + '/' + title;
                        fs.unlink(path, (err) => {
                          if (err) {
                            console.log(chalk.red('No se pudo eliminar el fichero'));
                            return;
                          } else {
                            console.log(chalk.green('Eliminada la nota ' + title + ' de ' + user));
                          }
                        });
                      }
                    });
                  };
                });
              }
            });
          }
        }
      },
    });
  }
}
