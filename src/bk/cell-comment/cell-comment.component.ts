import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-cell-comment',
  templateUrl: './cell-comment.component.html',
  styleUrl: './cell-comment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellCommentComponent {
  readonly buttonName = {
    clear: 'Clear',
    ok: 'OK',
  } as const;

  private readonly defaultColor = '#5a4111';
  label: string = '';
  comment: string = '';
  color: string = this.defaultColor;
  updDate: string = 'Last updated: ';

  constructor(
    private dialogRef: MatDialogRef<CellCommentComponent>,
    @Inject(MAT_DIALOG_DATA)
    private data: {
      rowId: string;
      colId: string;
      comment: string;
      color: string;
    },
  ) {}

  ngOnInit(): void {
    // console.log('[CellComment] ngOnInit');
    // this.label = `Comment (Row:${this.data.rowId} Col:${this.data.colId})`;
    // if (!Usecase.isEmpty(this.data.comment)) {
    //   const [updDate, ...comment] = this.data.comment.split('　');
    //   this.updDate += updDate;
    //   this.comment += comment.join('　');
    //   this.color = Usecase.isEmpty(this.data.color)
    //     ? this.defaultColor
    //     : this.data.color;
    // }
  }

  /**
   * Clearボタン押下時
   */
  onBtnClearClick = (
    comment: HTMLTextAreaElement,
    color: HTMLInputElement,
  ): void => {
    // コメント、カラークリア
    comment.value = '';
    color.value = this.defaultColor;
  };

  /**
   * OKボタン押下時
   */
  onBtnOKClick = (
    comment: HTMLTextAreaElement,
    color: HTMLInputElement,
  ): void => {
    // const value = (() => {
    //   if (Usecase.isEmpty(comment.value)) {
    //     return { comment: '', color: '' };
    //   }
    //   // 更新日追加
    //   return {
    //     comment: `${format(new Date(), 'yy-MM-dd HH:mm')}　${comment.value}`,
    //     color: color.value,
    //   };
    // })();
    // this.dialogRef.close(value);
  };

  /**
   * Cancelボタン押下時
   */
  onBtnCancelClick = (): void => {
    this.dialogRef.close({
      comment: this.data.comment,
      color: this.data.color,
    });
  };
}
