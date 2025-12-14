import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-test',
  template: `
    <!-- <app-test-2 [param]="data()"></app-test-2>
    <app-test-2 [cnt]="cnt()"></app-test-2> -->
    <!-- <button (click)="onClickA()">ボタンA</button>
    <button (click)="onClickB()">ボタンB</button> -->
    <app-test-2 [map]="map()"></app-test-2>
    <button (click)="onClick01()">ボタン1</button>
    <button (click)="onClick02()">ボタン2</button>
  `,
  styleUrl: './test.component.scss',
  imports: [forwardRef(() => Test2Component)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestComponent {
  data = signal<TestInputComponent>({
    a1: {
      a2: {
        a3: {
          c4: 'testA',
        },
        c3: 0,
      },
      b2: [],
      c2: 'testC',
    },
    b1: [],
    c1: 'testD',
  });
  cnt = signal(0);

  onClickA = (): void => {
    // 1階層分のオブジェクトのみ別物
    const dataBk = { ...this.data() };
    // dataBk.a1 = {} as any; // 上書きされない
    // dataBk.a1.a2 = {} as any; // 上書きされる
    // dataBk.b1.splice(0, 0, 'testE'); // 上書きされる
    // dataBk.b1.push('testE'); // 上書きされる
    // dataBk.b1 = []; // 上書きされない
    // dataBk.c1 = 'testE'; // 上書きされない
    // dataBk.c1.concat('testF'); // 上書きされない
    dataBk.a1.a2.c3++; // 上書きされる
    this.data.set(this.data());
  };

  onClickB = (): void => {
    this.cnt.update((v) => v + 1);
  };

  map = signal({
    keyA: signal({
      data1: 0,
      data2: 'test2',
    }),
    keyB: signal({
      data1: 0,
      data2: 'test4',
    }),
  });

  onClick01 = (): void => {
    this.map().keyA.update((key) => ({
      ...key,
      data1: key.data1 + 1,
    }));
  };
  onClick02 = (): void => {
    this.map().keyB.update((key) => ({
      ...key,
      data1: key.data1 + 2,
    }));
  };
}

@Component({
  selector: 'app-test-2',
  template: `
    <!-- <div>{{ dispA() }}</div>
    <div>{{ dispB() }}</div>
    <div>{{ dispC() }}</div> -->
    <div>{{ testA() }}</div>
    <div>{{ testB() }}</div>
    <button (click)="clickTestA()">test</button>
  `,
})
export class Test2Component {
  // param = input<TestInputComponent>({} as any);
  // cnt = input<number>(0);

  // dispA = computed(() => {
  //   return this.param()?.a1?.a2?.c3;
  // });

  // dispB = computed(() => {
  //   return this.cnt();
  // });
  private readonly signalTest = () => {
    const initCnt = { rowIdx: -1, cnt: 0, max: 0 };
    const counter = signal({ ...initCnt });
    return Object.assign(counter.asReadonly(), {
      reset: () => counter.set({ ...initCnt }),
      set: (rowIdx: number, cnt: number, max: number) =>
        counter.set({
          rowIdx,
          cnt,
          max,
        }),
      update: (rowIdx: number, cnt: number) =>
        counter.update((inf) => ({ ...inf, rowIdx, cnt })),
    });
  };
  private test1 = this.signalTest();
  protected testA = computed(() => {
    return JSON.stringify(this.test1());
  });
  private test2 = this.signalTest();
  protected testB = computed(() => {
    return JSON.stringify(this.test2());
  });

  clickTestA = () => {
    this.test2.set(10, 11, 12);
  };

  ngOnInit() {
    // const test = this.signalTest();
    // this.test1.set(1, 2, 3);
    // console.log(this.test1());
    // test.update(4, 5);
    // console.log(test());
    // test.reset();
    // console.log(test());
    // const test2 = this.signalTest();
    // this.test2.update(6, 7);
    // console.log(this.test2());
    // console.log(test());
  }

  map = input.required<any>();

  dispA = computed(() => {
    return this.map().keyA().data1;
  });
  dispB = computed(() => {
    return this.map().keyB().data1;
  });
  dispC = computed(() => {
    const map = this.map();
    return `${map.keyA().data1} / ${map.keyB().data1}`;
  });
}

export type TestInputComponent = {
  a1: {
    a2: {
      a3: {
        c4: string;
      };
      c3: number;
    };
    b2: [];
    c2: string;
  };
  b1: String[];
  c1: string;
};
