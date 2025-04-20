import { RowDataKey, ValueType } from 'src/app/shared/constants/types';

/** 行データ */
export type RowData = Record<string, ValueType>;

/** 行データMap */
export type RowDataMap = Record<RowDataKey, RowData[]>;
