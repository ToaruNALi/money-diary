import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  viewChild,
} from '@angular/core';
import { MoneyDiaryData } from 'src/app/domain/money-diary-data';
import * as Const from 'src/app/shared/constants/constants';
import * as Util from 'src/app/shared/constants/utils';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

@Component({
  selector: 'app-file-download',
  imports: [SharedCommonModule],
  templateUrl: './file-download.component.html',
  styleUrl: './file-download.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileDownloadComponent {
  readonly data = input.required<MoneyDiaryData>();
  private readonly fileDownload =
    viewChild.required<ElementRef<HTMLAnchorElement>>('fileDownload');

  protected readonly onBtnDownloadClicked = (): void => {
    // URL生成
    const saveData = structuredClone(this.data());
    for (const key of Object.values(Const.TBL)) {
      saveData.rm[key] = Util.getSaveRows(key, saveData.rm[key]);
    }

    const downloadData = JSON.stringify(saveData);
    const blob = new Blob([downloadData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    this.fileDownload().nativeElement.setAttribute('href', url);

    // ファイル名生成
    const fileName = Const.FILE_NAME.DL.replace(
      '{0}',
      Util.getDate(undefined, Const.DATE_FMT.YYMMDD_HHMMSS),
    );
    this.fileDownload().nativeElement.setAttribute('download', fileName);

    // ファイルダウンロード
    this.fileDownload().nativeElement.click();
    URL.revokeObjectURL(url);
  };
}
