import * as yargs from 'yargs';
import {Wrapper} from './wrapper';

const wrap = new Wrapper();
wrap.dorf();
wrap.mkDir();
wrap.lsFiles();
wrap.catFile();
wrap.rmDorF();
wrap.mvDorF();

yargs.parse();
