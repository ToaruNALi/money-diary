// import {
//   ChangeDetectionStrategy,
//   Component,
//   computed,
//   Inject,
//   inject,
//   ModelSignal,
// } from '@angular/core';
// import { MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { CellValueChangedEvent } from 'ag-grid-community';
// import { RowData } from 'src/app/domain/row-data';
// import { MemoUsecase } from 'src/app/features/money-diary/memo/memo.usecase';
// import { MoneyDiaryBaseComponent } from 'src/app/features/money-diary/money-diary-base/money-diary-base.component';
// import {
//   RowDataAdd,
//   RowDataDel,
//   RowDataEdit,
//   RowDataUpd,
//   ValueType,
// } from 'src/app/shared/constants/types';
// import * as Usecase from 'src/app/shared/constants/usecases';
// import { SharedCommonModule } from 'src/app/shared/shared-common.module';
// import { GridComponent } from '../../../../shared/grid/grid.component';

// export type DialogInput = {
//   datas: ModelSignal<RowData[]>;
// };

// @Component({
//   imports: [SharedCommonModule, GridComponent],
//   providers: [MemoUsecase],
//   templateUrl: './dialog-memo.component.html',
//   styleUrl: './dialog-memo.component.scss',
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class DialogMemoComponent extends MoneyDiaryBaseComponent {
//   /** usecase */
//   private readonly usecase = inject(MemoUsecase);
//   /** 行データKey */
//   protected readonly rowDataKey = Const.ROW_DATA_KEY.MEMO;
//   /** 列定義 */
//   protected readonly columnDefs = computed(() => this.usecase.getColumnDefs());
//   /** 行データ */
//   protected readonly rowDatas = computed(() =>
//     structuredClone(this.data.datas()),
//   );

//   constructor(
//     @Inject(MAT_DIALOG_DATA)
//     private readonly data: DialogInput,
//   ) {
//     super();
//   }

//   /**
//    * 値変更時
//    * @param event
//    */
//   protected readonly onChangeCellValue = (
//     event: CellValueChangedEvent<RowData, ValueType>,
//   ): void => {
//     const editInfo: RowDataEdit[] = [];

//     // 更新情報
//     editInfo.push({
//       type: Const.ROW_DATA_EDIT_TYPE.UPD,
//       event: {
//         key: Const.ROW_DATA_KEY.MEMO,
//         datas: [event.data],
//       } as RowDataUpd,
//     });

//     if (!event.oldValue && !!event.newValue) {
//       // 追加情報
//       editInfo.push({
//         type: Const.ROW_DATA_EDIT_TYPE.ADD,
//         event: {
//           key: Const.ROW_DATA_KEY.MEMO,
//           datas: [
//             Usecase.getDefaultRowData(
//               Const.ROW_DATA_KEY.MEMO,
//               this.data.datas(),
//             ),
//           ],
//           addIds: [null],
//         } as RowDataAdd,
//       });
//     } else if (!!event.oldValue && !event.newValue) {
//       // 削除情報
//       editInfo.push({
//         type: Const.ROW_DATA_EDIT_TYPE.DEL,
//         event: {
//           key: Const.ROW_DATA_KEY.MEMO,
//           datas: [event.data],
//         } as RowDataDel,
//       });
//     }

//     this.rowDatasEdit.emit(editInfo);
//   };
// }
