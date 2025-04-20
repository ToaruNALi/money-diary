/**
 * メッセージデータ
 * @description 定数ファイルに記載すると可読性が落ちるため、メッセージ専用のファイルを作成
 */
export const MESSAGE = {
  CONFIRM: {
    EDIT_PAST_DATA_FLG_UPD:
      '支払日が過去のデータが編集可能になりますが、よろしいですか。',
    HISTORY_RESET: '履歴情報を削除しますが、よろしいですか。',
  },
  ALERT: {
    INCLUDE_PAST_DATA: '支払日が過去のデータが含まれています。',
  },
} as const;
