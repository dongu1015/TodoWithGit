(function (window) {
	'use strict';

	function commitToDjango(todoTitle) {
  fetch("http://127.0.0.1:8000/api/commit/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: `✔️ 완료: ${todoTitle}`
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log("커밋 결과:", data);
    alert(data.message || "커밋 완료!");
  })
  .catch(err => {
    console.error("커밋 실패:", err);
    alert("❌ 커밋 실패");
  });
}

})(window);
