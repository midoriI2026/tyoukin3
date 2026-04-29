(function() {
    const VERSION = "v1.0";
    console.log("年次チェック:", VERSION);
    'use strict';

    /********** ① 今のレコード画面：ボタン **********/
    if (location.href.includes("page=DBTaskForm")) {

        const rid = new URL(location.href).searchParams.get("rid");
        const category = document.querySelector(`#record-value-2872-${rid}`)?.textContent.trim();

        const nowTotal = document.querySelector(`#record-value-505-${rid}`)?.textContent.trim();

        const btn = document.createElement("button");
        btn.textContent = "超勤フロー前チェック_前レコード整合";

        btn.style = `
            position:fixed;top:310px;right:20px;
            z-index:9999;padding:10px;
            background:#E91E63;color:#fff;
        `;

        btn.onclick = () => {

            const url =
                `https://midorinet-iwate.cybozu.com/o/ag.cgi?Page=DBSearchResult` +
                `&DID=150&Text=${encodeURIComponent(category)}` +
                `&fromSearch=1` +
                `&nowTotal=${encodeURIComponent(nowTotal)}` +
                `&baseRid=${rid}`;

            window.open(url, "_blank");
        };

        document.body.appendChild(btn);
    }

    /********** ② 検索結果：前レコードだけ開く **********/
    if (location.href.includes("Page=DBSearchResult")) {

        const url = new URL(location.href);
        if (url.searchParams.get("fromSearch") !== "1") return;

        const nowTotal = url.searchParams.get("nowTotal");
        const baseRid  = url.searchParams.get("baseRid");

        const icons = [...document.querySelectorAll('img[title="超過勤務を閲覧する"]')];

        if (icons.length < 2) {
            alert("前レコードなし");
            return;
        }

        // ★下から2番目＝前レコード
        const prevIcon = icons[icons.length - 2];
        const link = prevIcon.closest("a");

        const nextUrl = new URL(link.href, location.origin);
        nextUrl.searchParams.set("doCheck", "1");
        nextUrl.searchParams.set("nowTotal", nowTotal);
        nextUrl.searchParams.set("baseRid", baseRid);

        window.open(nextUrl.toString(), "_blank");
        window.close();
    }

    /********** ③ 前レコード画面：比較実行 **********/
    if (location.href.includes("page=DBRecord")) {

        const url = new URL(location.href);
        if (url.searchParams.get("doCheck") !== "1") return;

        setTimeout(runCheck, 500);
    }

    function runCheck() {

        const url = new URL(location.href);

        const nowRaw = url.searchParams.get("nowTotal"); // 今の値
        const baseRid = url.searchParams.get("baseRid"); // 今のRID
        const prevRid = url.searchParams.get("rid");     // 表示中（前レコード）

        const prevRaw = document
            .querySelector(`#record-value-2551-${prevRid}`)
            ?.textContent.trim();

        const nowVal  = parseFloat(nowRaw.replace(/[^\d.]/g, ""));
        const prevVal = parseFloat(prevRaw.replace(/[^\d.]/g, ""));

        const results = [];

        results.push(
            nowVal === prevVal
                ? `月累計時間：OK（今RID=${baseRid}:${nowRaw} / 前RID=${prevRid}:${prevRaw}）`
                : `月累計時間：NG（今RID=${baseRid}:${nowRaw} / 前RID=${prevRid}:${prevRaw}）`
        );

        showPanel(results);
    }

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
        btn.onclick = () => {

            panel.remove();

            try {
                if (window.opener && !window.opener.closed) {

                    const opener = window.opener;

                    // ★元タブを再表示（これが重要）
                    opener.location.href = opener.location.href;

                    // 保険（効く環境だけ）
                    setTimeout(() => {
                        opener.focus();
                        opener.document.body.click();
                    }, 200);
                }
            } catch (e) {
                console.log(e);
            }

            // ★自分（前レコードタブ）を閉じる
            setTimeout(() => window.close(), 300);
        };
        panel.appendChild(btn);
        document.body.appendChild(panel);
    }

})();
