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

        console.log("user_id = " + user_id);
        console.log("target_YM = " + target);

        let error_row = "";

        // 1行ずつ処理を行う
        for(let i = 0; i < rows.length; i++) {
            let row = rows[i];
            let cols = row.querySelectorAll("td");

            console.log(row);
            console.log("target_D = " + row.dataset.date);



            // 実績のtd
            let start_end = cols[1];
            console.log(start_end)

            let arr_start_end = start_end.querySelectorAll('input[type="text"]');

            console.log(arr_start_end);
            if (arr_start_end.length == 0) {
                break;
            }

            console.log(arr_start_end[0].value);
            console.log(arr_start_end[1].value);

            error_row += checkStart(row.dataset.date, arr_start_end[0].value);

            // 勤務状況のtd
            let status = cols[2];

            // 総労働時間
            let total_hours = cols[3];

            // 不足時間
            let lack_hours = cols[4];

            // 休憩時間
            let rest_hours = cols[5];

            // 残業時間
            let over_hours = cols[6];

            // 遅刻早退時間
            let over_early = cols[9];

            console.log(error_row);




        }

        let header = document.querySelector('.p-roster-header');

        console.log(header);

        // 追加するhtmlの作成
        let add = document.createElement("div");

        // 特に意味はないけどid振っておく
        add.setAttribute("id", "custom-error");

        // 色とpaddingを追加
        add.setAttribute("style", "padding-left: 30px; color:red;");

        // 作成したエラー文言をinnerHTMLに設定する
        add.innerHTML = error_row;

        // 名前の真下に挿入して終了
        header.appendChild(add);

    }

    // 開始時間が8:00、9:00、
    function checkStart(target_date, start_time) {

        if (start_time != "8:00" && start_time != "9:00" && start_time != "10:00") {
            return target_date + "の開始時間が" + start_time + "です。<br/>"
        } else {
            return "";
        }

    }
}