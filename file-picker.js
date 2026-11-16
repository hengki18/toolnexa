"use strict";
for (const input of document.querySelectorAll(".file-picker input[type=file]")) {
  const name = input.parentElement.querySelector(".file-picker-name");
  const update = () => { name.textContent = input.files.length ? input.files[0].name : "Belum ada file dipilih"; };
  input.addEventListener("change", update);
  update();
}
