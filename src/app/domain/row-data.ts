import { Tbl, ValType } from 'src/app/shared/constants/types';

/** 行データ */
export type Row = Record<string, ValType>;

/** 行データMap */
export type TblMap = Record<Tbl, Row[]>;
