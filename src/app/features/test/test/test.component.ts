import { Component, signal } from '@angular/core';
// import { MoneyDiaryDataStore } from 'src/app/store/money-diary-data.store';

@Component({
  selector: 'app-test',
  template: `
    <div class="upload">
      <input
        type="file"
        accept="image/*"
        (change)="onChangeFileInput($event)"
      />
      <img [src]="imgSrc()" alt="" />
    </div>
  `,
  styleUrl: './test.component.scss',
})
export class TestComponent {
  file: File | null = null;
  imgSrc = signal<string | ArrayBuffer | null>('');

  onChangeFileInput(event: any) {
    //fileが選択されていなければリセット
    if (event.target.files.length === 0) {
      this.file = null;
      this.imgSrc.set('');
      return;
    }

    //ファイルの情報をfileとimgSrcに保存
    let reader = new FileReader();
    this.file = event.target.files[0];
    reader.onload = () => {
      this.imgSrc.set(reader.result);
    };
    reader.readAsDataURL(this.file!);
  }
}
