import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BtnParamType } from 'src/app/bk/domain/btn-param.type';

/**
 * ボタンパラメータ
 */
export class BtnParam implements BtnParamType {
  private static cnt: number = 0;

  /** ID */
  id: string;
  /** ラベル */
  label: string;
  /** 非活性有無 */
  disabled: boolean;
  /** アイコン */
  icon: string;
  /** ツールチップ */
  tooltip: string;

  constructor(
    label: string = '',
    disabled: boolean = false,
    icon: string = '',
    tooltip: string = '',
  ) {
    this.id = (++BtnParam.cnt).toString();
    this.label = label;
    this.disabled = disabled;
    this.icon = icon;
    this.tooltip = tooltip;
  }
}

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent implements OnInit {
  @Input() btnParam!: BtnParamType;

  @Output() clickBtn: EventEmitter<void>;

  constructor() {
    this.clickBtn = new EventEmitter();
  }

  ngOnInit(): void {}

  /**
   * ボタン押下時
   */
  onBtnClick = (): void => {
    if (!this.btnParam.disabled) {
      this.clickBtn.emit();
    }
  };
}
