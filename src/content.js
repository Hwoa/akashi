window.addEventListener("load", main, false);

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

        // パスからuser_idと対象年月を取得する
        let paths = location.pathname.split("/");
        let user_id = paths[3];
        let target = paths[4];

        let today = formatDate(new Date());

        // エラー文言格納用
        let error_text = "";

        const WORK_STATUS = ["勤務", "午前半年休", "午後半年休", "時差出勤"];

        // 1行ずつ処理を行う
        for(let i = 0; i < rows.length; i++) {

            // 行を取得
            let row = rows[i];

            // 行からセルを取得
            let cols = row.querySelectorAll("td");

            // エラー用の行を用意する
            let error_row = "";

            // 実績のtd
            let start_end = cols[1];

            // inputを分解して、開始時間と終了時間を取得する
            let arr_start_end = start_end.querySelectorAll('input[type="text"]');

            // 長さが0の場合はまだ迎えていない日時、また当日は締まっていないため終了する
            if (arr_start_end.length == 0 || today == row.dataset.date) {
                break;
            }

            // 勤務状況のtd
            let status = cols[2].innerText;

            // どちらも未入力の場合は、それだけ伝えて次の行へ。
            if (WORK_STATUS.includes(status) && (arr_start_end[0].value == "" || arr_start_end[1].value == "")) {
                error_text += row.dataset.date + "に未入力があります。<br/>";
                continue;
            }

            // 開始時間、終了時間、勤務ステータスを元に正常化判定を行う。
            error_row += checkStart(row.dataset.date, arr_start_end[0].value, arr_start_end[0].value, status);

            // 勤務状況を調べる。
            error_row += checkStatus(row.dataset.date, status);

            // 総労働時間
            // let total_hours = cols[3];

            // 不足時間
            let lack_hours = cols[4].innerText;
            error_row += checkLack(row.dataset.date, lack_hours);

            // 休憩時間
            let rest_hours = cols[5].innerText;
            error_row += checkRest(row.dataset.date, rest_hours, status);


            // 残業時間
            let over_hours = cols[6];

            // 遅刻早退時間
            let over_early = cols[9];

            if (error_row != "") {
                error_text += error_row;
            }

        }

        // 追加する部分を取得する
        let header = document.querySelector('.p-roster-header');

        // 追加するhtmlの作成
        let add = document.createElement("div");

        // 特に意味はないけどid振っておく
        // add.setAttribute("id", "custom-error");

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

        const START_ARRAY = ["8:00", "9:00", "10:00"];
        const HOLIDAY_ARRAY = ["休日", "年休", "コロナ休暇"];

        // 問題がない場合の組み合わせ
        if (
            START_ARRAY.includes(start_time) ||            // 開始時間が勤務で正常な場合
            (HOLIDAY_ARRAY.includes(status) && start_time == "" && end_time == "") ||      // 休日、年休の場合は空で正常
            (status == "午前半年休" && start_time == "14:00")    // 午前半年休の場合は14:00開始で正常
        ) {
            return "";
        }
        return target_date + "の開始時間が" + start_time + "です。<br/>";

    }

    // 勤務状況を調べる
    function checkStatus(target_date, status) {
        const OK_STATUS = ["勤務", "休日", "年休" , "午前半年休", "午後半年休", "コロナ休暇", "時差出勤"];
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

    function checkRest(target_date, rest_hours, status) {
        // 休憩時間が0でも問題ない場合
        const OK_STATUS = ["休日", "年休" , "午前半年休", "午後半年休", "コロナ休暇"];
        if (
            (OK_STATUS.includes(status) && rest_hours == "0:00") ||   // 休み、または半休の場合は0:00でもOK
            rest_hours == "1:00"    // 1時間とっていればOK
        ) {
            return "";
        }
        return target_date + "の休憩時間を確認してください。<br/>";
    }
}