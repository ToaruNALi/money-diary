import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MoneyDiaryData } from 'src/app/domain/money-diary-data';
import { MESSAGE } from 'src/app/shared/constants/messages';
import { ScreenDispData } from 'src/app/shared/constants/types';
import { FileDownloadComponent } from 'src/app/shared/file-download/file-download.component';
import { FileUploadComponent } from 'src/app/shared/file-upload/file-upload.component';
import {
  FormToggle,
  FormToggleComponent,
} from 'src/app/shared/forms/form-toggle/form-toggle.component';
import { SharedCommonModule } from './../../shared/shared-common.module';

@Component({
  selector: 'app-header',
  imports: [
    SharedCommonModule,
    FileDownloadComponent,
    FileUploadComponent,
    FormToggleComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly fb = inject(FormBuilder);

  readonly screenDatas = input.required<ScreenDispData>();
  readonly data = model.required<MoneyDiaryData>();
  readonly editPastData = model<boolean>(false);

  protected readonly formData = signal<Partial<FormToggle>>({
    label: 'Past Edit',
  });
  protected readonly form = signal(
    this.fb.control<boolean>(this.editPastData()),
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
        this.editPastData.set(value);
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
