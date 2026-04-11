// import { DatePipe } from '@angular/common';
// import { Pipe, PipeTransform, ɵDEFAULT_LOCALE_ID } from '@angular/core';

// @Pipe({
//   name: 'dateInput',
// })
// export class DateInputPipe implements PipeTransform {
//   /**
//    * 文字列ｰ>日付変換 (例. 20210304 ｰ> 2021/03/04)
//    * @param value 変換対象文字列
//    * @param format フォーマット
//    * @returns フォーマット後文字列
//    */
//   readonly transform = (value: string = '', format?: InputFormat): string => {
//     // 不要な文字列除去
//     const target = this.parse(value)
//       // ハイフン区切り
//       .replace(/^(\d{4})(\d{2})(\d{2})$/g, '$1-$2-$3');

//     // フォーマット処理
//     const pipe = new DatePipe(ɵDEFAULT_LOCALE_ID);
//     return pipe.transform(target, format) ?? '';
//   };

//   /**
//    * 日付ｰ>文字列変換 (例. 2021/03/04 ｰ> 20210304)
//    * @param value 変換対象文字列
//    * @returns コンバート後文字列
//    */
//   readonly parse = (value: string = ''): string => {
//     // コンバート処理
//     return (
//       value
//         // 1. 数値以外除去
//         .replace(/\D/g, '')
//         // 2. 8桁以外除去
//         .replace(/^(\d{1,7}|\d{9,})$/g, '')
//     );
//   };
// }
