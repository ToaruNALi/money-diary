import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform, ɵDEFAULT_LOCALE_ID } from '@angular/core';

@Pipe({
  name: 'moneyInput',
})
export class MoneyInputPipe implements PipeTransform {
  /**
   * 文字列ｰ>金額変換 (例. 9990 ｰ> ¥9,990)
   * @param value 変換対象文字列
   * @param digits 小数点以下桁数
   * @param emptyVal 空文字の場合の文字
   * @returns フォーマット後文字列
   */
  readonly transform = (
    value: string = '',
    digits?: string,
    emptyVal: string = '',
  ): string => {
    // 不要な文字列除去
    const target = this.parse(value) || emptyVal;

    // フォーマット処理
    const pipe = new CurrencyPipe(ɵDEFAULT_LOCALE_ID);
    return pipe.transform(target, 'JPY', 'symbol', digits) ?? '';
  };

  /**
   * 金額ｰ>文字列変換 (例. ¥9,990 ｰ> 9990)
   * @param value 変換対象文字列
   * @returns コンバート後文字列
   */
  readonly parse = (value: string = ''): string => {
    // コンバート処理
    return (
      value
        // 1. 先頭以外のハイフン除去
        .replace(/(?!^)\-/g, '')
        // 2. 数値とハイフン以外除去
        .replace(/[^0-9|\-]/g, '')
        // 3. ハイフンのみ除去
        .replace(/^\-$/g, '')
    );
  };
}
