import { Injectable } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { Row } from 'src/app/domain/row-data';
import { SettingUsecase } from 'src/app/features/money-diary/setting/setting.usecase';
import { InputItems } from 'src/app/shared/dialog-custom-input/dialog-custom-input.component';
import { ValType } from 'src/app/shared/signal-form/signal-form.component';
import { CMN_COL, ITM_COL } from 'src/app/shared/utils/util-row';

@Injectable()
export class ItemUsecase extends SettingUsecase {
  /**
   * 列定義を返却する
   * @returns 列定義
   */
  override readonly getColDefs = (): ColDef<Row, ValType>[] => [
    ...this.addCmnColDefs([
      {
        headerName: 'Item',
        field: CMN_COL.LABEL,
        cellEditor: 'agTextCellEditor',
        rowDrag: true,
        filter: false,
        flex: 1,
        cellStyle: this.getCellCmnStyle,
      },
      {
        headerName: 'Summary Count',
        field: ITM_COL.SUMMARY_COUNT_FLG,
        cellEditor: 'agCheckboxCellEditor',
      },
    ]),
  ];

  /**
   * ダイアログ表示項目返却(custom)
   * @param defRow
   * @returns 表示項目
   */
  protected override readonly getDialogInputItemsCustom = (
    defRow: Row,
  ): InputItems => [
    {
      id: ITM_COL.SUMMARY_COUNT_FLG,
      label: 'Summary Count',
      type: 'toggle',
    },
  ];

  /**
   * ダイアログスキーマ返却(custom)
   */
  protected override readonly getDialogSchemaCustom = undefined;
}
