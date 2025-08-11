import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MoneyDiaryData } from 'src/app/domain/money-diary-data';
import { Hist } from 'src/app/domain/row-data-edit-history';
import { MESSAGE } from 'src/app/shared/constants/messages';
import { ScrDspData } from 'src/app/shared/constants/types';
import { DialogInputData } from 'src/app/shared/dialog-input/dialog-input.component';
import { FileDownloadComponent } from 'src/app/shared/file-download/file-download.component';
import { FileUploadComponent } from 'src/app/shared/file-upload/file-upload.component';
import { PageReloadComponent } from './../../shared/page-reload/page-reload.component';
import { SharedCommonModule } from './../../shared/shared-common.module';

@Component({
  selector: 'app-header',
  imports: [
    SharedCommonModule,
    PageReloadComponent,
    FileDownloadComponent,
    FileUploadComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly fb = inject(FormBuilder);

  readonly scrData = input.required<ScrDspData>();
  readonly hist = input.required<Hist>();
  readonly data = model.required<MoneyDiaryData>();
  readonly edtPastData = model<boolean>(false);
  protected readonly histReset = output<void>();

  protected readonly formData = signal<Partial<DialogInputData>>({
    label: 'Past Edit',
  });
  protected readonly form = signal(
    this.fb.control<boolean>(this.edtPastData()),
  );

  ngOnInit(): void {
    this.form().valueChanges.subscribe((value) => {
      if (value === null) {
        return;
      }

      if (value && !confirm(MESSAGE.CONFIRM.EDIT_PAST_DATA_FLG_UPD)) {
        // 過去データ編集可能 かつ キャンセルを選択した場合
        this.form().setValue(false, { emitEvent: false });
      } else {
        this.edtPastData.set(value);
      }
    });
  }

  /**
   * ファイルアップロード時
   * @param data
   */
  protected readonly onOutputFile = (data: MoneyDiaryData): void => {
    this.data.set(data);
  };
}
