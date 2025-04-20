import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  output,
  viewChild,
} from '@angular/core';
import { MoneyDiaryData } from 'src/app/domain/money-diary-data';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

@Component({
  selector: 'app-file-upload',
  imports: [SharedCommonModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadComponent {
  protected readonly fileOutput = output<MoneyDiaryData>();
  private readonly fileUpload =
    viewChild.required<ElementRef<HTMLInputElement>>('fileUpload');

  /**
   * アップロードボタン押下時
   */
  protected readonly onBtnUploadClicked = (): void => {
    this.fileUpload().nativeElement.click();
  };

  /**
   * ファイル選択押下時
   */
  protected readonly onFileInputClicked = (): void => {
    this.fileUpload().nativeElement.value = '';
  };

  /**
   * ファイル選択時
   */
  protected readonly onFileInputChanged = (): void => {
    const files = this.fileUpload().nativeElement.files;
    if (!files) {
      return;
    }

    const reader = new FileReader();
    reader.readAsText(files[0]);
    reader.onload = (e) => {
      const result = e.target?.result;
      if (!!result && typeof result === 'string') {
        this.fileOutput.emit(JSON.parse(result));
      }
    };
  };
}
