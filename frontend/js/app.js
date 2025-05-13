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

// ✅ 체크박스를 클릭하면 commitToDjango() 실행되도록 이벤트 연결
	document.querySelectorAll(".todo-list .toggle").forEach(function (checkbox) {
		checkbox.addEventListener("change", function () {
			const title = this.closest("li").querySelector("label").textContent;
			if (this.checked) {
				commitToDjango(title);
			}
		});
	});

})(window);
