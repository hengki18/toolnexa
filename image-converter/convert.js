"use strict";
const fileInput=document.getElementById("file"), format=document.getElementById("format"), quality=document.getElementById("quality"), qualityLabel=document.getElementById("quality-label"), status=document.getElementById("status"), preview=document.getElementById("preview"), button=document.getElementById("convert");
const formats={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
let image=null,url=null,generation=0;
function say(message){status.textContent=message;}
function clear(){image=null;button.disabled=true;preview.hidden=true;preview.removeAttribute("src");if(url){URL.revokeObjectURL(url);url=null;}}
function syncQuality(){const png=format.value==="image/png";quality.disabled=png;qualityLabel.hidden=png;qualityLabel.style.display=png?"none":"";}
format.addEventListener("change",syncQuality);syncQuality();
fileInput.addEventListener("change",async()=>{
 const current=++generation;clear();const file=fileInput.files[0];
 if(!file){say("Pilih gambar terlebih dahulu.");return;}
 if(!Object.hasOwn(formats,file.type)||file.size>20*1024*1024){say("Pilih gambar JPG, PNG, atau WebP maksimal 20 MB.");return;}
 const candidate=URL.createObjectURL(file),img=new Image();
 try{img.src=candidate;await img.decode();if(current!==generation){URL.revokeObjectURL(candidate);return;}
 if(!img.naturalWidth||!img.naturalHeight||img.naturalWidth>8192||img.naturalHeight>8192||img.naturalWidth*img.naturalHeight>16000000)throw new Error("Ukuran melebihi batas");
 image=img;url=candidate;preview.src=url;preview.hidden=false;button.disabled=false;say("Ukuran asli: "+img.naturalWidth+" × "+img.naturalHeight+" px.");
 }catch(e){URL.revokeObjectURL(candidate);if(current===generation)say("Gambar gagal dimuat. Periksa format, batas 16 megapiksel, dan maksimal 8192 piksel per sisi.");}
});
document.getElementById("convert-form").addEventListener("submit",event=>{
 event.preventDefault();const type=format.value,q=quality.valueAsNumber;
 if(!image||!Object.hasOwn(formats,type)||(type!=="image/png"&&(!Number.isInteger(q)||q<1||q>100))){say("Pilih gambar, format, dan kualitas yang valid.");return;}
 const current=generation;button.disabled=true;const canvas=document.createElement("canvas");
 try{canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Canvas tidak tersedia");
 if(type==="image/jpeg"){ctx.fillStyle="#ffffff";ctx.fillRect(0,0,canvas.width,canvas.height);}ctx.drawImage(image,0,0);
 canvas.toBlob(blob=>{canvas.width=0;canvas.height=0;if(current!==generation)return;button.disabled=false;
 if(!blob||blob.type!==type){say("Format ini tidak didukung oleh browser atau konversi gagal. Coba format lain.");return;}
 const download=URL.createObjectURL(blob),a=document.createElement("a");a.href=download;a.download="toolnexa-konversi."+formats[type];document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(download),30000);say("Konversi berhasil: "+formats[type].toUpperCase()+" · "+Math.ceil(blob.size/1024)+" KB.");
 },type,type==="image/png"?undefined:q/100);
 }catch(e){canvas.width=0;canvas.height=0;button.disabled=false;say("Konversi gagal. Coba gambar yang lebih kecil.");}
});
