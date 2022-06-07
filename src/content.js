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

        let paths = location.pathname.split("/");
        let user_id = paths[3];
        let target = paths[4];

        console.log(user_id);
        console.log(target);

        for(let i = 0; i < rows.length; i++) {
            let row = rows[i];
            let cols = row.querySelectorAll("td");
            for (let j = 0; j < cols.length; j++) {
                let col = cols[j];
                console.log(col);
                let name = "form[working_records_attributes][" + user_id + "][2022-06-01]";
                const phone_plan = col.querySelector('input[type="hidden"][name*="' + name + '"]');
                console.log(name);
                console.log(phone_plan);
                console.log(phone_plan.value);

            }
            break;
        }

        // tr毎にエラーをチェックする
        // rows.forEach(function(row){
        //     let cols = element_body.querySelectorAll("td");
        //     cols.forEach(function(col){
        //         console.log()
        //     });
        // });



    }

    // 開始時間が8:00、9:00、
    function checkStart() {

    }
}