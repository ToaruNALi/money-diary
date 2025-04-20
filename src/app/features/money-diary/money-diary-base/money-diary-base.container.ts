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
  RowDataEdit,
  RowDataKey,
  ScreenId,
} from 'src/app/shared/constants/types';
import { StoreUsecase } from 'src/app/usecase/store.usecase';

@Component({
  template: ``,
  animations: [Animation.Transform],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class MoneyDiaryBaseContainerComponent {
  protected readonly usecase = inject(StoreUsecase);

  protected abstract readonly screenId: ScreenId;
  protected abstract readonly rowDataKey: RowDataKey;

  /** RowDataMap */
  protected readonly map = computed(() =>
    this.usecase.storeRowData.rowDataMap(),
  );

  /** 行データMap */
  protected readonly inputDatas = computed(
    () => this.map()[Const.ROW_DATA_KEY.MONEY_DIARY],
  );
  protected readonly storageDatas = computed(
    () => this.map()[Const.ROW_DATA_KEY.STORAGE],
  );
  protected readonly creditDatas = computed(
    () => this.map()[Const.ROW_DATA_KEY.CREDIT],
  );
  protected readonly itemDatas = computed(
    () => this.map()[Const.ROW_DATA_KEY.ITEM],
  );
  protected readonly remarkDatas = computed(
    () => this.map()[Const.ROW_DATA_KEY.REMARK],
  );
  protected readonly summaryDatas = computed(
    () => this.map()[Const.ROW_DATA_KEY.SUMMARY],
  );
  protected readonly scheduleDatas = computed(
    () => this.map()[Const.ROW_DATA_KEY.SCHEDULE],
  );
  protected readonly memoDatas = computed(
    () => this.map()[Const.ROW_DATA_KEY.MEMO],
  );

  /**
   * 行データ編集時
   * @param event
   */
  protected readonly onEditRowDatas = (event: RowDataEdit[]): void => {
    this.usecase.editRowData(event);
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
  protected readonly onSetScreenId = (event: ScreenId): void => {
    this.usecase.changeScreen(event);
  };

  /** 画面表示オプション */
  protected readonly displayOpt = computed(() => {
    const screenId = this.usecase.storeScreen.screenInfo.si();
    const oldScreenId = this.usecase.storeScreen.screenInfo.oi();
    if (this.screenId === screenId) {
      return {
        // 非表示画面の遷移後Class
        afterClass: 'display',
        // 表示画面の遷移前Style
        beforeStyle: this.usecase.hiddenOptions().nextBeforeStyle,
      };
    } else if (this.screenId === oldScreenId) {
      return {
        // 非表示画面の遷移後Class
        afterClass: this.usecase.hiddenOptions().prevAfterClass,
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
