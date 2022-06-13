window.addEventListener("load", main, false);

const KINMU = "勤務";
const GOZEN_HANKYU = "午前半年休";
const GOGO_HANKYU = "午後半年休";
const JISA = "時差出勤";
const KYUUJITU = "休日";
const NENKYU = "年休";
const KORONA = "コロナ休暇";

const EARLY_START = "08:00";
const NORMAL_START = "09:00";
const LATE_START = "10:00";
const NOON_START = "14:00";
const ALL_MEETING_START = "08:40";

const EMPTY_START_END = "--:--";

function main(e) {

    // 読み込みを1秒ずつ行う
    const jsInitCheckTimer = setInterval(jsLoaded, 1000);

    function jsLoaded() {

        // tbody要素がまだnullであれば、終了する
        if (document.querySelector('.c-main-table-body') == null) {
            return;
        }

        // 読み込めたらintervalを消し、チェックを終える
        clearInterval(jsInitCheckTimer);

        // tbody要素を取得する
        const element_body = document.querySelector('.c-main-table-body');

        // trを取得
        const rows = element_body.querySelectorAll(":scope > tr");

        // クルーの場合のセルの数
        const CREW_LENGTH = 12;

        // 今日の日付を取得する
        let today = formatDate(new Date());

        // エラー文言格納用
        let error_text = "";

        // 勤務時のステータス
        const WORK_STATUS = [KINMU, GOZEN_HANKYU, GOGO_HANKYU, JISA];

        // 編集ページでない場合、余計なセルが増えるので1を足すための枠
        let j = 0;

        // 1行ずつ処理を行う
        for(let i = 0; i < rows.length; i++) {

            // 行を取得
            let row = rows[i];

            // 行からセルを取得
            let cols = row.querySelectorAll("td");

            // 1行の場合はスペーサーなのでパス
            if (cols.length == 1 + j) {
                continue;
            }

            // エラー用の行を用意する
            let error_row = "";

            // 実績のtd
            let start_end = cols[1];

            // 開始と終了時間の配列
            let arr_start_end;

            // data-keyを持っていない場合はスペーサーなので1を足して値を取り直す
            if (typeof start_end.dataset.key == "undefined") {
                j = 1;
                start_end = cols[1 + j];
            }

            // まずは編集出ない場合、spanで取得する
            arr_start_end = start_end.querySelectorAll("span");

            // 開始時間、終了時間
            let start;
            let end;

            // spanで取れない場合は編集なのでinputから取得する
            if (arr_start_end.length == 0) {
                arr_start_end = start_end.querySelectorAll('input[type="text"]');
                start = arr_start_end[0].value
                end = arr_start_end[1].value
            } else {
                // spanの場合の取得
                start = arr_start_end[0].innerText
                end = arr_start_end[1].innerText;
            }

            start = fixString(start);
            end = fixString(end);

            // 長さが0の場合はまだ迎えていない日時、また当日は締まっていないため終了する
            if (arr_start_end.length == 0 || today == row.dataset.date) {
                break;
            }

            // 勤務状況のtd
            let status = cols[2 + j].innerText;

            // どちらも未入力の場合は、それだけ伝えて次の行へ。
            if (WORK_STATUS.includes(status) && (start == EMPTY_START_END || end == EMPTY_START_END)) {
                error_text += row.dataset.date + "に未入力があります。<br/>";
                continue;
            }

            // 勤務状況を調べる。
            error_row += checkStatus(row.dataset.date, status);

            // Crewだけの項目を調べる
            if (cols.length == CREW_LENGTH + j) {

                // 開始時間、終了時間、勤務ステータスを元に正常化判定を行う。
                error_row += checkStart(row.dataset.date, start, end, status);

                // 不足時間のチェックを行う。
                let lack_hours = cols[4 + j].innerText;
                error_row += checkLack(row.dataset.date, lack_hours);

                // 休憩時間
                let rest_hours = cols[5 + j].innerText;

                // 総労働時間
                let total_hours = cols[3 + j].innerText;

                // 総労働時間から休憩時間が必要かを調べる
                error_row += checkRest(row.dataset.date, rest_hours, total_hours, status);

            }

            if (error_row != "") {
                error_text += error_row;
            }

        }

        // 追加する部分を取得する
        let header = document.querySelector('.p-roster-header');

        // 追加するhtmlの作成
        let add = document.createElement("div");

        // 色とpaddingを追加
        add.setAttribute("style", "padding-left: 30px; color:red;");

        // 作成したエラー文言をinnerHTMLに設定する
        add.innerHTML = error_text;

        // 名前の真下に挿入して終了
        header.appendChild(add);

    }

    // 日付取得
    function formatDate(dt) {
        let y = dt.getFullYear();
        let m = ('00' + (dt.getMonth()+1)).slice(-2);
        let d = ('00' + dt.getDate()).slice(-2);
        return (y + '-' + m + '-' + d);
    }

    // 開始時間の組み合わせを調べる
    function checkStart(target_date, start_time, end_time, status) {

        const START_ARRAY = [EARLY_START, NORMAL_START, LATE_START];
        const HOLIDAY_ARRAY = [KYUUJITU, NENKYU, KORONA];

        let today = new Date(target_date);
        let day_of_week = today.getDay();

        // 問題がない場合の組み合わせ
        if (
            START_ARRAY.includes(start_time) ||            // 開始時間が勤務で正常な場合
            (HOLIDAY_ARRAY.includes(status) && start_time == EMPTY_START_END && end_time == EMPTY_START_END) ||      // 休日、年休の場合は空で正常
            (status == GOZEN_HANKYU && start_time == NOON_START)    // 午前半年休の場合は14:00開始で正常
        ) {
            return "";

        } else if (day_of_week == 1 && start_time == ALL_MEETING_START) { // 全体朝礼の場合は8:40で問題なし
            return target_date + "の開始時間が" + start_time + "ですが、全体朝礼参加の場合は問題ありません。<br/>";

        }
        return target_date + "の開始時間が" + start_time + "です。<br/>";

    }

    // 勤務状況を調べる
    function checkStatus(target_date, status) {
        const OK_STATUS = [KINMU, KYUUJITU, NENKYU , GOZEN_HANKYU, GOGO_HANKYU, KORONA, JISA];
        if (OK_STATUS.includes(status)) {
            return "";
        }
        return target_date + "の勤務状況を確認してください。<br/>";
    }

    // 不足時間の調査
    function checkLack(target_date, lack_hours) {
        if (lack_hours == "0:00") {
            return "";
        }
        return target_date + "で" + lack_hours + "の不足時間が発生しています。<br/>";
    }

    function checkRest(target_date, rest_hours, total_hours, status) {

        let total_hours_array = total_hours.split(":");
        let total_hour = total_hours_array[0];

        let rest_hours_array = rest_hours.split(":");
        let rest_hour = rest_hours_array[0];

        // 休憩時間が0でも問題ない場合
        const OK_STATUS = [KYUUJITU, NENKYU , GOZEN_HANKYU, GOGO_HANKYU, KORONA];
        if (
            // 休み、または半休の場合は1時間未満でもOK、また、勤務時間が6時間未満の場合は0でもOK
            ((OK_STATUS.includes(status) || total_hour < 6 ) && rest_hour < 1) ||
            rest_hour >= 1    // 1時間とっていればOK
        ) {
            return "";
        }
        return target_date + "の休憩時間を確認してください。<br/>";
    }

    function fixString(str) {
        // 空、0:00、00:00の場合は全て「--:--」に変換する
        if (str == "" || str == "0:00" || str == "00:00") {
            return EMPTY_START_END;
        }
        // 0埋をして返す
        return ("00:00" + str).slice(-5);
    }
}