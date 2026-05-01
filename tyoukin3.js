(function() {
'use strict';

/********** ボタン **********/
if (!location.href.includes("page=DBTaskForm")) return;

const rid = new URL(location.href).searchParams.get("rid");

const category = document
    .querySelector(`#record-value-2872-${rid}`)
    ?.textContent.trim();

const nowTotal = document
    .querySelector(`#record-value-505-${rid}`)
    ?.textContent.trim();

const btn = document.createElement("button");
btn.textContent = "超勤フロー前チェック_前レコード整合";

btn.style = `
    position:fixed;top:310px;right:20px;
    z-index:9999;padding:10px;
    background:#E91E63;color:#fff;
`;

btn.onclick = runCheck;

document.body.appendChild(btn);

/********** メイン **********/
async function runCheck() {

    try {
        if (!category) {
            alert("カテゴリ取得失敗");
            return;
        }

        // ① 検索結果を取得（裏で）
        const searchUrl =
            `${location.origin}/o/ag.cgi?Page=DBSearchResult` +
            `&DID=150&Text=${encodeURIComponent(category)}`;

        const html1 = await fetch(searchUrl, { credentials: "include" })
            .then(r => r.text());

        const doc1 = new DOMParser().parseFromString(html1, "text/html");

        const icons = [...doc1.querySelectorAll('img[title="超過勤務を閲覧する"]')];

        if (icons.length < 2) {
            showPanel(["前レコードなし"]);
            return;
        }

        // ★下から2番目＝前レコード
        const prevLink = icons[icons.length - 2].closest("a");
        const prevUrl = new URL(prevLink.href, location.origin);

        const prevRid = prevUrl.searchParams.get("rid");

        // ② 前レコード取得
        const html2 = await fetch(prevUrl.toString(), { credentials: "include" })
            .then(r => r.text());

        const doc2 = new DOMParser().parseFromString(html2, "text/html");

        const prevRaw = doc2
            .querySelector(`#record-value-2551-${prevRid}`)
            ?.textContent.trim();

        // ③ 比較
        const nowVal  = parseFloat(nowTotal.replace(/[^\d.]/g, ""));
        const prevVal = parseFloat(prevRaw.replace(/[^\d.]/g, ""));

        const results = [];

        results.push(
            nowVal === prevVal
                ? `月累計時間：OK（今 rid${rid}:${nowTotal} / 前 rid${prevRid}:${prevRaw}）`
                : `月累計時間：NG（今 rid${rid}:${nowTotal} / 前 rid${prevRid}:${prevRaw}）`
        );

        showPanel(results);

    } catch (e) {
        console.error(e);
        alert("処理エラー");
    }
}

/********** パネル **********/
function showPanel(results) {

    const panel = document.createElement("div");
    panel.style = `
        position:fixed;top:100px;right:20px;
        background:#fff;border:2px solid #333;
        padding:12px;z-index:999999;
    `;

    results.forEach(r => {
        const d = document.createElement("div");
        d.textContent = r;
        if (r.includes("NG")) d.style.color = "red";
        panel.appendChild(d);
    });

    const btn = document.createElement("button");
    btn.textContent = "OK";
    btn.onclick = () => panel.remove();

    panel.appendChild(btn);
    document.body.appendChild(panel);
}

})();
