import { ScrData } from 'src/app/domain/screen-info';

/** 画面 */
export const SCR = {
  MAIN: 'md',
  STORAGE: 'st',
  CREDIT: 'cr',
  ITEM: 'it',
  REMARK: 'rm',
  SUMMARY: 'sm',
  MEMO: 'mm',
  SCHEDULE: 'sc',
} as const;
export type Scr = (typeof SCR)[keyof typeof SCR];

/** 画面情報 */
export const SCR_INF = {
  [SCR.MAIN]: {
    lb: 'Money Diary',
    ab: 'Money',
    ic: 'edit',
    od: 1,
    px: 1,
    py: 1,
  },
  [SCR.STORAGE]: {
    lb: 'Storage',
    ab: 'Strg',
    ic: 'storage',
    od: 5,
    px: 0,
    py: 0,
  },
  [SCR.CREDIT]: {
    lb: 'Credit',
    ab: 'Crdt',
    ic: 'credit_card',
    od: 6,
    px: 0,
    py: 1,
  },
  [SCR.ITEM]: {
    lb: 'Item',
    ab: 'Item',
    ic: 'category',
    od: 7,
    px: 0,
    py: 2,
  },
  [SCR.REMARK]: {
    lb: 'Remark',
    ab: 'Rmk',
    ic: 'edit_note',
    od: 8,
    px: 1,
    py: 2,
  },
  [SCR.SUMMARY]: {
    lb: 'Summary',
    ab: 'Smr',
    ic: 'summarize',
    od: 2,
    px: 2,
    py: 1,
  },
  [SCR.MEMO]: {
    lb: 'Memo',
    ab: 'Memo',
    ic: 'note_alt',
    od: 4,
    px: 1,
    py: 0,
  },
  [SCR.SCHEDULE]: {
    lb: 'Schedule',
    ab: 'Scdl',
    ic: 'event_available',
    od: 3,
    px: 2,
    py: 2,
  },
} as const satisfies Record<Scr, ScrDspData>;
export type ScrDspData = ScrData & Pick<MenuListData, 'lb' | 'ab' | 'ic'>;

/** メニューリストデータ */
export type MenuListData = {
  id: string;
  lb: string;
  ab?: string;
  ic: string;
};

/** 画面情報リストを返却する */
export const getMenuList = (): MenuListData[] => {
  return Object.entries(SCR_INF).map(([scr, data]) => ({
    ...data,
    id: scr as Scr,
  }));
};
