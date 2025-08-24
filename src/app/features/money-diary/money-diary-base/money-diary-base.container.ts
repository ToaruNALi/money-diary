import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import * as Animation from 'src/app/shared/constants/animations';
import { FilterEdt, RowEdt, Scr, Tbl } from 'src/app/shared/constants/types';
import { StoreUsecase } from 'src/app/usecase/store.usecase';

@Component({
  template: ``,
  animations: [Animation.Transform],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class MoneyDiaryBaseContainerComponent {
  protected readonly usecase = inject(StoreUsecase);

  protected abstract readonly scrId: Scr;
  protected abstract readonly tbl: Tbl;

  /**
   * 行データ編集時
   * @param event
   */
  protected readonly onEdtRows = (event: RowEdt[]): void => {
    this.usecase.edtRows(event);
  };

  /**
   * フィルター設定
   * @param event
   */
  protected readonly onEdtFilter = (event: FilterEdt): void => {
    this.usecase.edtFilter(event);
  };

  /**
   * 画面遷移先設定
   * @param event
   */
  protected readonly onSetScrId = (event: Scr): void => {
    this.usecase.changeScr(event);
  };

  /** 画面表示オプション */
  protected readonly displayOpt = computed(() => {
    const scrId = this.usecase.storeScr.scrInf.si();
    const oldScrId = this.usecase.storeScr.scrInf.oi();
    if (this.scrId === scrId) {
      return {
        // 非表示画面の遷移後Class
        afterClass: 'display',
        // 表示画面の遷移前Style
        beforeStyle: this.usecase.hiddenOpts().nextBeforeStyle,
      };
    } else if (this.scrId === oldScrId) {
      return {
        // 非表示画面の遷移後Class
        afterClass: this.usecase.hiddenOpts().prevAfterClass,
        // 表示画面の遷移前Style
        beforeStyle: {},
      };
    }

    return {
      afterClass: 'hidden',
      beforeStyle: {},
    };
  });
}
