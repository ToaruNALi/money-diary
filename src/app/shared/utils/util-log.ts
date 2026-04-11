import { environment } from 'src/environments/environment';

/**
 * ログ出力
 * @param log ログ出力する関数、もしくは文字列
 * @param validOpt 出力有無
 */
export const outputLog = (
  log: () => void | string,
  validOpt: 'always' | 'dev' = 'dev',
): void => {
  if (validOpt === 'always' || (validOpt === 'dev' && !!environment.logValid)) {
    // ログ出力
    if (typeof log === 'string') {
      console.log(log);
    } else {
      log();
    }
  }
};
