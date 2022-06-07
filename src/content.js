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

        // trを朱とkする
        const rows = element_body.querySelectorAll(":scope > tr");

        // tr毎にエラーをチェックする
        rows.forEach(function(element){
            console.log(element);
        });



    }
}