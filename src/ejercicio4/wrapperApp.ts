import * as yargs from 'yargs';
import {Wrapper} from './wrapper';

const wrap = new Wrapper();
wrap.dof();
wrap.mkDir();

yargs.parse();
