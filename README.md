# Jonay Méndez Márquez
## alu0101347141
<br>

# **DSI - Práctica 10**

En esta práctica se resolverán una serie de ejercicios utilizando las APIs que proporciona Node.js para interactuar con el sitema de ficheros, así como la creación de procesos. Estos serán los desafíos a resolver:

- **Ejercicio 1**&emsp;⟶&emsp;Explicar la traza de ejecución de un programa (contenido de la pila de llamadas, registro de eventos de la API y cola de manejadores).
- **Ejercicio 2**&emsp;⟶&emsp;Elaborar un programa que devuelva el número de ocurrencias de una palabra en un fichero de texto.
- **Ejercicio 3**&emsp;⟶&emsp;Crear un watcher para la aplicación de gestión de notas desarrollada previamente en la asignatura. Este watcher informará de cualquier cambio en el directorio de un usuario concreto.
- **Ejercicio 4**&emsp;⟶&emsp;Crear una aplicación que sirva de 'wrapper' para los comandos empleados en Linux relacionados con el manejo de ficheros y directorios.

---
<br>

## **Ejercicio 1**

El programa que se propone en el enunciado recibe un fichero por consola y genera un watcher que lo vigila. este watcher avisa cada vez que se realizan cambios en el fichero. Además, esto está dentro del método access() del módulo fs, que sirve para comprobar ciertas condiciones de un fichero según la constante que se le pase como parámetro. En este caso, F_OK sirve para saber si existe o no el fichero.

El proceso que se lleva a cabo es el siguiente:
- Se analiza si se han obtenido 3 argumentos (el tercero debería ser el fichero)
  - Si no es así, entra el console.log() a la pila de llamadas, se ejecuta, sale de la pila y, como esta está vacía, finaliza el programa.
  - Si efectivamente hay tres argumentos, se ejecuta el programa suponiendo que el tercero es el fichero a observar.
- Entra access() a la pila de llamadas.
- En caso de que 'err' == true, el console.log() avisando de que el fichero no existe entra en la pila de llamadas.
  - Se ejecuta el console.log(), sale de la pila de llamadas.
- En el caso de que 'err' == false:
  - Entra a la pila de llamadas el console.log() confirmando que se está observando el fichero. Se ejecuta y sale de la pila de llamadas
  - Entra a la pila de llamadas watch().
  - Entra a la pila de llamadas el console.log() que avisa de que el fichero ya no se está observando. Se muestra por consola, sale de la pila de llamadas.
  - watch() va al registro de eventos
  - Se modifica la primera vez el fichero.
  - watch() emite el evento 'change' y este pasa a la cola de manejadores.
  - Entra en la pila de llamadas el console.log() que avisa de la modificación en el fichero. Se muestra por pantalla. Sale de la pila de llamadas.
  - Se modifica la segunda vez el fichero.
  - watch() emite el evento 'change' y este pasa a la cola de manejadores.
  - Entra en la pila de llamadas el console.log() que avisa de la modificación en el fichero. Se muestra por pantalla. Sale de la pila de llamadas.
  - El programa se queda esperando a que watch() envíe un nuevo evento.

---
<br>

## **Ejercicio 2**

Para resolver este ejercicio, se ha creado una clase en cuyo interior esté tanto el método que emplea pipe() como el que no lo emplea. Es la clase OcurrencesCounter, y tiene la siguiente estructura:

    class OcurrencesCounter {
      constructor(private file: string, private word: string) {}
      catGrepPipe() {}
      catGrepNoPipe() {}
    }

Como puede observarse, es una clase sencilla con tan solo dos atributos y dos métodos. Los atributos son:
  - **file**&emsp;⟶&emsp;Contiene la ruta del fichero a analizar.
  - **word**&emsp;⟶&emsp;Contiene la palabra de la que se quiere conocer el número de ocurrencias.

Al tratarse de una clase con tan solo dos métodos, y ambos además usan los mismos atributos (pues realmente realizan la misma misión), no se ha utilizado yargs para manejar el paso de parámetros desde consola. Por el contrario, para ejecutarlo se realiza lo siguiente:

    const p = new OcurrencesCounter(process.argv[2], process.argv[3]);
    p.catGrepPipe(); // En caso de querer usar pipe()
    p.catGrepNoPipe(); // En caso de no querer usar pipe()

Sabiendo que al ejecutar el programa con *node* debemos indicar primero la ruta del **programa**, luego la ruta del **fichero** y finalmente la **palabra** a buscar.

Ahora bien, ¿cómo funcionan los métodos elaborados? Veamos primero el que sí usa pipe().

<br>

### catGrepPipe()

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

Tal y como se nos indica en el guión de la práctica, para conseguir este desafío tendremos que primero realizar un *cat* al fichero, ese resultado filtrarlo mediante un *grep* y de este resultado calcular el número de ocurrencias de la palabra mediante una expresión regular.

Para hacerlo, empezaremos invocando mediante spawn() dos procesos hijos. Por un lado el proceso hijo 'cat' sobre el fichero, y por el otro el proceso hijo 'grep' sobre la palabra. Luego, enlazamos empleando pipe() la salida de dicho proceso *cat* con la entrada del proceso *grep*.

Sabiendo que están enlazados, podemos entonces crear una string vacía y decir que, con el evento 'data' de *grep* (es decir, mientras se le estén inyectando datos), estos pasarán a formar parte de la string recién creada.

Finalmente, en el evento 'close' de grep, es decir, cuando ya termine el proceso, se generará la expresión regular con la palabra que se quiere buscar y el flag 'gi' para indicar que queremos buscarla en toda la string y que sea insensible a mayúsculas.

Esto nos servirá para calcular el número de ocurrencias mediante la función match(), que vinculará la string con el texto filtrado del fichero y la expresión regular con la palabra.

Si el número de ocurrencias es mayor que cero, se muestran por pantalla. En caso contrario, se avisa de que no se ha encontrado ninguna vez la palabra en el fichero.

**¿Y si el fichero no existe?**&emsp;Para controlar ese caso, se ha colocado antes de realizar ninguna operación un bloque if-else en el que se emplea la función existsSync() del módulo fs. Esta nos permite saber si el fichero existe o no, pudiendo actuar en consecuencia antes de que sea demasiado tarde. 

<br>

### catGrepNoPipe()

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

La lógica detrás de este método es muy similar a la explicada en el otro. La diferencia es que, en este caso, cada nuevo paquete de información que va recibiendo el proceso 'cat' es "manualmente" reenviado al proceso grep mediante la función write() sobre su Stream de escritura. Además, cuando el proceso 'cat' termina, lo indicamos manualmente al proceso grep de la misma forma, solo que esta vez con el método end().

---
<br>

## **Ejercicio 3**

Para vigilar los cambios en el directorio de un usuario concreto, en la aplicación de gestión de notas, se ha creado la clase NoteWatcher. Además, teniendo en cuenta que en la práctica original no se organizó el programa dentro de una clase, en esta ocasión se ha aprovechado para hacerlo y tener bien estructurada la aplicación de gestión de notas siguiendo el paradigma de programación orientada a objetos.

### Clase NoteWatcher

    class NoteWatcher {
      private path: string;
      constructor(private user: string) {
        this.path = './notas/' + user + '/';
      }
      watchDir() {}
      printContent(file: string) {}

La clase NoteWatcher cuenta con dos atributos:
 - **user**&emsp;⟶&emsp;string que contiene el nombre del usuario en cuestión. Es el dato que recibe el constructor como argumento.
 - **path**&emsp;⟶&emsp;string que contiene la ruta del directorio del usuario que se va a vigilar. Esta se construye concatenando la ruta './notas/', que sabemos que es donde la aplicación genera el directorio raíz del programa, y el nombre usuario que se le pasa al constructor.

 En cuanto a la vigilancia continua del directorio, se realizará haciendo uso del método watch() del módulo fs, encapsulado a su vez dentro de la función watchDir() de nuestra clase.

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

Invocamos y al método watch() indicándole la ruta que debe observar, y vamos recogiendo los eventos que sucedan en cada modificación del directorio. 

En el caso de que este evento sea 'change', sabemos que la nota ha sido creada o editada. 

En el caso de que sea 'rename', realizamos una comprobación:
- Si el directorio existe, entonces es que no se ha borrado, y por lo tanto lo que se ha borrado es el fichero con la nota.
- Si el directorio que estábamos observando ya no existe, entonces se ha eliminado el directorio.

El otro método de la clase, printContent(), sirve para responder a la primera pregunta formulada en el enunciado de la práctica.

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

Al llamar a esta función con el nombre de un fichero como argumento, se genera el proceso hijo 'cat' usando como parámetro la ruta guardada en la clase concatenada con el nombre del fichero. Luego, solo tenemos que insertar la información obtenida en una string y finalmente mostrarla por pantalla cuando el proceso termine.

---
<br>

## **Ejercicio 4**

En este ejercicio, la idea principal es tener concentradas en una sola clase que actúe como wrapper las distintas instrucciones de linux para la gestión de directorios y ficheros. Esto, usando yargs, se basa en términos generales en recoger la ruta sobre la que se quiere actuar y, en el handler de cada comando, invocar mediante spawn() a la instrucción que corresponda. 

Como casi todos los comandos tienen la misma estructura, se procede a explicar simplemente cada handler y la solución que se ha llevado a cabo en cada uno.

<br>

### DorF
> Directory or File?

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

  Primero comprobamos que el parámetro sea efectivamente una string. Luego, haciendo uso del método stat(), evaluamos la ruta recibida. Según sea un fichero o un directorio, se mostrará el mensaje que corresponda por consola.

<br>

### mkDir
> make Directory

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

  Primero comprobamos que el parámetro sea efectivamente una string. Luego, comprobamos que el directorio no exista ya (si existe, se avisa por pantalla y no se realiza la operación). En caso de que no exista, se genera el proceso hijo 'mkdir' mediante spawn(). 

<br>

  ### lsF
> list Files

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

  Primero comprobamos que el parámetro sea efectivamente una string. Luego, comprobamos que existe el directorio cuyo interior se quiere listar. En caso de que no exista, se cancela y se avisa. Si existe, se genera el proceso hijo 'ls' mediante spawn().

<br>

### catF
> show File content

     if (typeof(argv.path) === 'string') {
        const path: string = argv.path;
        if (fs.existsSync(argv.path)) {
          const cat = spawn('cat', [path]);
          cat.stdout.pipe(process.stdout);
        } else {
          console.log(chalk.red('No existe el fichero'));
        }
      }

  Primero comprobamos que el parámetro sea efectivamente una string. Luego, comprobamos que existe el fichero cuyo contenido se quiere mostrar. En caso de que no exista, se cancela y se avisa. Si existe, se genera el proceso hijo 'cat' mediante spawn().


<br>

### rmDorF
> remove Directory or File

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

  Primero comprobamos que el parámetro sea efectivamente una string. Luego, mediante stat() averiguamos si se trata de un directorio o de un fichero. Si es un directorio, generamos el proceso hijo 'rm' con el flag '-rf', lo que nos permitirá eliminarlo incluso si no está vacío. En caso de ser un fichero, simplemente generamos el proceso hijo 'rm'.


<br>

### mvDorF
> move Directory or File

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

Este es ligeramente distinto a los anteriores, pero realmente sigue la misma estructura. Esta vez el comando cuenta con tres parámetros:
- **origin**&emsp;⟶&emsp; Ruta de origen
- **destiny**&emsp;⟶&emsp; Ruta de destino
- **keep**&emsp;⟶&emsp; Indica si se quere conservar el fichero o directorio en la ruta original (copiar) o no (mover)

Haciendo uso de stat vemos si se trata de un fichero o un directorio, aunque esta vez solo nos servirá para dar el mensaje correcto por pantalla. De resto, tanto para un directorio como para un fichero, invocaremos el proceso hijo 'mv' o 'cp' según se quiera mover o copiar respectivamente.