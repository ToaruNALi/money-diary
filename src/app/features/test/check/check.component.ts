import { Component } from '@angular/core';
import moji from 'moji';

@Component({
  selector: 'app-check',
  imports: [],
  templateUrl: './check.component.html',
  styleUrl: './check.component.scss',
})
export class CheckComponent {
  ngOnInit() {
    /** ！チェック */
    this.checkExclamation();
    /** ？チェック */
    this.checkQuestion();
    /** ｜チェック */
    this.checkVertivalLine();
    /** あいまい検索 */
    this.searchAmbiguous();
    /** 半角全角変換 */
    this.convertMoji();
  }
  /** ！チェック */
  checkExclamation = (): void => {
    const label = '！チェック';
    console.log(`--------------- ${label} Start ---------------`);
    const array: any[] = ['', ' ', NaN, 0, 0x00, 1, -1, '0', null, undefined];
    for (const val of array) {
      console.log(val, typeof val, ':', !!val);
    }
    console.log(`--------------- ${label} End ---------------`);
  };
  /** ？チェック */
  checkQuestion = (): void => {
    const label = '？チェック';
    console.log(`--------------- ${label} Start ---------------`);
    const array: any[] = ['', ' ', NaN, 0, 0x00, 1, -1, '0', null, undefined];
    for (const val of array) {
      console.log(val, ':', val ?? 'Default');
    }
    console.log(`--------------- ${label} End ---------------`);
  };
  /** ｜チェック */
  checkVertivalLine = (): void => {
    const label = '｜チェック';
    console.log(`--------------- ${label} Start ---------------`);
    const array: any[] = ['', ' ', NaN, 0, 0x00, 1, -1, '0', null, undefined];
    for (const val of array) {
      console.log(val, ':', val || 'Default');
    }
    console.log(`--------------- ${label} End ---------------`);
  };
  /** あいまい検索 */
  searchAmbiguous = (): void => {
    const label = 'あいまい検索';
    console.log(`--------------- ${label} Start ---------------`);
    const targetList: any[] = [
      { key: 'ｱｲｳｴｵｶ', val: 'a' },
      { key: 'ｱｲｳｴｵ', val: 'b' },
    ];
    const word = 'ｱｲｳｴｵ';
    const options = {
      keys: ['title', 'key'],
      includeScore: true,
      threshold: 0.5,
      shouldSort: true,
    };
    // const fuse = new Fuse(targetList, options);
    // const resultList = fuse.search(word);
    console.log('');
    console.log(`--------------- ${label} End ---------------`);
  };
  /** 半角全角変換 */
  convertMoji = (): void => {
    const label = '半角全角変換';
    console.log(`--------------- ${label} Start ---------------`);
    const inputValue = 'あいうえお';
    const convertValue = moji(inputValue).convert('HG', 'KK').toString();
    console.log(convertValue);
    console.log(`--------------- ${label} End ---------------`);
  };
}
