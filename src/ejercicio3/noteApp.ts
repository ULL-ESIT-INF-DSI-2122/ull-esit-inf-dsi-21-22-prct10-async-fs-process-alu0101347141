import * as yargs from 'yargs';
import {Notes} from './notes/notes';

const gestorNotas = new Notes();
gestorNotas.add();
gestorNotas.list();
gestorNotas.modify();
gestorNotas.open();
gestorNotas.remove();

yargs.parse();
