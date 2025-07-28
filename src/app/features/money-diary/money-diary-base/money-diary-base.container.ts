import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import * as Animation from 'src/app/shared/constants/animations';
import * as Const from 'src/app/shared/constants/constants';
import {
  FilterInputModel,
  RowEdt,
  Scr,
  Tbl,
} from 'src/app/shared/constants/types';
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

  /** TblMap */
  protected readonly map = computed(() => this.usecase.storeTblInf.tblMap());

  /** 行データMap */
  protected readonly mainRows = computed(() => this.map()[Const.TBL.MAIN]);
  protected readonly stgRows = computed(() => this.map()[Const.TBL.STORAGE]);
  protected readonly crdRows = computed(() => this.map()[Const.TBL.CREDIT]);
  protected readonly itmRows = computed(() => this.map()[Const.TBL.ITEM]);
  protected readonly rmkRows = computed(() => this.map()[Const.TBL.REMARK]);
  protected readonly smrRows = computed(() => this.map()[Const.TBL.SUMMARY]);
  protected readonly scdRows = computed(() => this.map()[Const.TBL.SCHEDULE]);
  protected readonly memRows = computed(() => this.map()[Const.TBL.MEMO]);

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
  protected readonly onSetFilterInputModel = (
    event: FilterInputModel,
  ): void => {
    this.usecase.setFilterInputModel(event);
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
