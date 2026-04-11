import { ValType } from 'src/app/shared/signal-form/signal-form.component';

/**
 * 数値が有効な整数か判定する
 * @param value
 * @returns 判定結果
 */
export const isValidInt = (value?: ValType): value is number => {
  return Number.isSafeInteger(value);
};

/**
 * 数値 ｰ> 金額表示に変換する (入力が数値でない場合、空文字を返却する)
 * @param value
 * @returns 金額表示文字列
 */
export const cvtNumToPrice = (value?: ValType): string => {
  if (!isValidInt(value)) {
    return '';
  }

  return value.toLocaleString('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  });
};

/**
 * 数値を計算して返却する
 * @param value
 * @returns 計算結果
 */
export const calcResult = (value?: ValType): number => {
  try {
    if (
      value === undefined ||
      value === null ||
      value === '' ||
      typeof value === 'boolean' ||
      Array.isArray(value)
    ) {
      throw new Error('Cannot Calculate');
    }

    const num = Math.round(
      (() => {
        if (typeof value === 'number') {
          if (!isValidInt(value)) {
            throw new Error('Invalid Integer');
          }
          return value;
        }
        return Number(new Function(`return ${value}`)());
      })(),
    );

    return num;
  } catch (e) {
    return Number.NaN;
  }
};
