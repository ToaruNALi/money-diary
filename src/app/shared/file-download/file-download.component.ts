import { Component, ElementRef, input, viewChild } from '@angular/core';
import { MoneyDiaryData } from 'src/app/domain/money-diary-data';
import { Row } from 'src/app/domain/row-data';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';
import {
  cvtDateToStr,
  DATE_FMT,
  getSaveCol,
  getSaveDefRow,
  MAIN_COL,
  Tbl,
  TBL,
} from 'src/app/shared/utils/util-row';

/** ファイル名 */
const FILE_NAME = {
  DL: 'moneyDiary_{0}.json',
} as const;

@Component({
  selector: 'app-file-download',
  imports: [SharedCommonModule],
  templateUrl: './file-download.component.html',
  styleUrl: './file-download.component.scss',
})
export class FileDownloadComponent {
  readonly data = input.required<MoneyDiaryData>();
  private readonly fileDownload =
    viewChild.required<ElementRef<HTMLAnchorElement>>('fileDownload');

  protected readonly onBtnDownloadClicked = (): void => {
    // URL生成
    const saveData = structuredClone(this.data());
    for (const key of Object.values(TBL)) {
      saveData.ti.rd[key] = this.getSaveRows(key, saveData.ti.rd[key]);
    }

    const downloadData = JSON.stringify(saveData);
    const blob = new Blob([downloadData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    this.fileDownload().nativeElement.setAttribute('href', url);

    // ファイル名生成
    const fileName = FILE_NAME.DL.replace(
      '{0}',
      cvtDateToStr(undefined, DATE_FMT.YYMMDD_HHMMSS),
    );
    this.fileDownload().nativeElement.setAttribute('download', fileName);

    // ファイルダウンロード
    this.fileDownload().nativeElement.click();
    URL.revokeObjectURL(url);
  };

  /** 保存用データを返却する */
  private getSaveRows = (tbl: Tbl, rows: Row[] = []): Row[] => {
    const saveRows: Row[] = [];
    const saveCols = getSaveCol(tbl);

    for (const row of rows) {
      const saveRow: Row = {};
      const defRow = getSaveDefRow(tbl);

      for (const col of saveCols) {
        if (
          row[col] === undefined ||
          row[col] === defRow[col] ||
          (!row[col] && !defRow[col])
        ) {
          // TODO: オブジェクトの場合、比較の仕方を考える必要あり
          continue;
        }

        if (tbl === TBL.MAIN) {
          // 入力データ限定処理
          if (col === MAIN_COL.DATE && row[col] === row[MAIN_COL.USE_DATE]) {
            // 日付が利用日と同じ場合、日付を保存しない
            continue;
          }
        }

        saveRow[col] = row[col];
      }
      saveRows.push(saveRow);
    }

    return saveRows;
  };
}
