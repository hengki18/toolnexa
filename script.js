"use strict";
const form = document.getElementById("ratio-form");
const result = document.getElementById("result");

function calculate(event) {
  event.preventDefault();
  const width = document.getElementById("width").valueAsNumber;
  const height = document.getElementById("height").valueAsNumber;
  const newWidth = document.getElementById("new-width").valueAsNumber;
  const values = [width, height, newWidth];
  if (!values.every(n => Number.isInteger(n) && n >= 1 && n <= 100000)) {
    result.textContent = "Masukkan bilangan bulat antara 1 dan 100.000.";
    return;
  }
  const newHeight = Math.max(1, Math.round(newWidth * height / width));
  result.textContent = "Ukuran baru: " + newWidth + " × " + newHeight + " px";
}
form.addEventListener("submit", calculate);
