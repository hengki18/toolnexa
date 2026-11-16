"use strict";
const fileInput=document.getElementById("file"), w=document.getElementById("width"), h=document.getElementById("height"), lock=document.getElementById("lock"), preview=document.getElementById("preview"), status=document.getElementById("status"), button=document.getElementById("resize");
let image=null, url=null, generation=0;
const valid=n=>Number.isInteger(n)&&n>=1&&n<=8192;
function say(message){status.textContent=message;}
function clear(){image=null;button.disabled=true;w.disabled=true;h.disabled=true;w.value="";h.value="";preview.hidden=true;preview.removeAttribute("src");if(url){URL.revokeObjectURL(url);url=null;}}
fileInput.addEventListener("change",async()=>{
 const current=++generation;clear();const file=fileInput.files[0];if(!file){say("Pilih gambar terlebih dahulu.");return;}
 if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>20*1024*1024){say("Pilih gambar JPG, PNG, atau WebP maksimal 20 MB.");return;}
 const candidate=URL.createObjectURL(file);const img=new Image();img.src=candidate;
 try{await img.decode();if(current!==generation){URL.revokeObjectURL(candidate);return;}
 if(!img.naturalWidth||!img.naturalHeight||img.naturalWidth*img.naturalHeight>25000000)throw new Error("Gambar melebihi batas 25 megapiksel.");
 image=img;url=candidate;preview.src=url;preview.hidden=false;
 const scale=Math.min(1,8192/img.naturalWidth,8192/img.naturalHeight,Math.sqrt(16000000/(img.naturalWidth*img.naturalHeight)));
 w.value=Math.max(1,Math.floor(img.naturalWidth*scale));h.value=Math.max(1,Math.floor(img.naturalHeight*scale));w.disabled=false;h.disabled=false;button.disabled=false;
 say("Ukuran asli: "+img.naturalWidth+" × "+img.naturalHeight+" px.");
 }catch(err){URL.revokeObjectURL(candidate);if(current===generation)say("Gambar gagal dimuat. Periksa format dan ukurannya.");}
});
w.addEventListener("input",()=>{if(image&&lock.checked&&valid(w.valueAsNumber))h.value=Math.max(1,Math.round(w.valueAsNumber*image.naturalHeight/image.naturalWidth));});
h.addEventListener("input",()=>{if(image&&lock.checked&&valid(h.valueAsNumber))w.value=Math.max(1,Math.round(h.valueAsNumber*image.naturalWidth/image.naturalHeight));});
lock.addEventListener("change",()=>{if(lock.checked&&image&&valid(w.valueAsNumber))h.value=Math.max(1,Math.round(w.valueAsNumber*image.naturalHeight/image.naturalWidth));});
document.getElementById("resize-form").addEventListener("submit",event=>{
 event.preventDefault();const width=w.valueAsNumber,height=h.valueAsNumber;
 if(!image||!valid(width)||!valid(height)||width*height>16000000){say("Masukkan ukuran yang valid, maksimal 8192 piksel per sisi dan total 16 megapiksel.");return;}
 const current=generation;button.disabled=true;
 try{const canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Fitur Canvas tidak tersedia");ctx.drawImage(image,0,0,width,height);
 canvas.toBlob(blob=>{canvas.width=0;canvas.height=0;if(current!==generation)return;button.disabled=false;if(!blob){say("Gagal membuat PNG.");return;}const download=URL.createObjectURL(blob);const a=document.createElement("a");a.href=download;a.download="toolnexa-"+width+"x"+height+".png";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(download),30000);say("PNG berhasil dibuat: "+width+" × "+height+" px.");},"image/png");
 }catch(err){button.disabled=false;say("Gagal mengubah ukuran gambar. Coba ukuran yang lebih kecil.");}
});
window.addEventListener("pagehide",()=>{if(url)URL.revokeObjectURL(url);});
