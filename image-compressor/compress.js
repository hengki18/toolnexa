"use strict";
const el=id=>document.getElementById(id);
const fileInput=el("file"),target=el("target"),format=el("format"),resize=el("resize"),status=el("status"),result=el("result"),button=el("compress"),preview=el("preview"),after=el("after"),download=el("download");
let image=null,source=null,inputURL=null,outputURL=null,generation=0;
const allowed=["image/jpeg","image/png","image/webp"];
const kb=n=>(n/1024).toFixed(1);
function clearOutput(){if(outputURL){URL.revokeObjectURL(outputURL);outputURL=null;}after.hidden=true;after.removeAttribute("src");download.hidden=true;download.style.display="none";download.removeAttribute("href");result.textContent="Hasil kompresi akan muncul di sini.";}
function clearInput(){clearOutput();if(inputURL){URL.revokeObjectURL(inputURL);inputURL=null;}image=null;source=null;preview.hidden=true;preview.removeAttribute("src");button.disabled=true;}
for(const preset of document.querySelectorAll("[data-kb]"))preset.addEventListener("click",()=>{target.value=preset.dataset.kb;});
fileInput.addEventListener("change",async()=>{
 const current=++generation;clearInput();const file=fileInput.files[0];
 if(!file){status.textContent="Pilih foto terlebih dahulu.";return;}
 if(!allowed.includes(file.type)||file.size>20*1024*1024){status.textContent="Pilih foto JPG, PNG, atau WebP maksimal 20 MB.";return;}
 const candidate=URL.createObjectURL(file),img=new Image();
 try{img.src=candidate;await img.decode();if(current!==generation){URL.revokeObjectURL(candidate);return;}
 if(!img.naturalWidth||!img.naturalHeight||img.naturalWidth>8192||img.naturalHeight>8192||img.naturalWidth*img.naturalHeight>16000000)throw new Error("Resolusi melebihi batas");
 image=img;source=file;inputURL=candidate;preview.src=candidate;preview.hidden=false;button.disabled=false;status.textContent="Ukuran asli: "+kb(file.size)+" KB · "+img.naturalWidth+" × "+img.naturalHeight+" px.";
 }catch(e){URL.revokeObjectURL(candidate);if(current===generation)status.textContent="Foto gagal dimuat. Periksa format dan batas 16 megapiksel (8192 piksel per sisi).";}
});
function encode(canvas,type,quality){return new Promise((resolve,reject)=>canvas.toBlob(blob=>{if(!blob||blob.type!==type)reject(new Error("Format tidak didukung"));else resolve(blob);},type,quality));}
el("compress-form").addEventListener("submit",async event=>{
 event.preventDefault();const goal=target.valueAsNumber,type=format.value,canResize=resize.checked;
 if(!image||!Number.isInteger(goal)||goal<10||goal>20000||!["image/jpeg","image/webp"].includes(type)){result.textContent="Masukkan target ukuran yang valid (10–20.000 KB).";return;}
 const current=++generation,img=image,original=source,limit=goal*1024;clearOutput();button.disabled=true;result.textContent="Sedang memproses foto...";
 const canvas=document.createElement("canvas");
 try{
 let best=null,smallest=null,scale=1;
 const remember=(blob,w,h)=>{if(!smallest||blob.size<smallest.blob.size)smallest={blob,w,h};};
 for(let pass=0;pass<(canResize?14:1);pass++){
 if(current!==generation)return;
 canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
 const w=canvas.width,h=canvas.height,ctx=canvas.getContext("2d");if(!ctx)throw new Error("Canvas tidak tersedia");
 if(type==="image/jpeg"){ctx.fillStyle="#fff";ctx.fillRect(0,0,w,h);}ctx.drawImage(img,0,0,w,h);
 const high=await encode(canvas,type,.95);remember(high,w,h);
 if(high.size<=limit){best={blob:high,w,h};break;}
 const low=await encode(canvas,type,.08);remember(low,w,h);
 if(low.size<=limit){best={blob:low,w,h};let a=.08,b=.95;for(let i=0;i<8;i++){if(current!==generation)return;const mid=(a+b)/2,blob=await encode(canvas,type,mid);remember(blob,w,h);if(blob.size<=limit){best={blob,w,h};a=mid;}else b=mid;}break;}
 if(!canResize||w===1&&h===1)break;scale*=.75;
 }
 if(current!==generation)return;
 if(original.type===type&&original.size<=limit&&(!best||best.blob.size>=original.size)){best={blob:original,w:img.naturalWidth,h:img.naturalHeight};}
 const chosen=best||smallest;if(!chosen)throw new Error("Tidak ada hasil");
 outputURL=URL.createObjectURL(chosen.blob);after.src=outputURL;after.hidden=false;download.href=outputURL;download.download="toolnexa-kompres."+(type==="image/jpeg"?"jpg":"webp");download.hidden=false;download.style.display="inline-block";
 const saving=(1-chosen.blob.size/original.size)*100;result.textContent=(chosen.blob.size<=limit?"Target tercapai. ":"Target belum tercapai; ini hasil terkecil yang ditemukan. ")+"Hasil: "+kb(chosen.blob.size)+" KB · "+chosen.w+" × "+chosen.h+" px. "+(saving>=0?"Pengurangan ukuran: "+saving.toFixed(1)+"%.":"Ukuran bertambah "+Math.abs(saving).toFixed(1)+"%.");
 }catch(e){if(current===generation)result.textContent="Kompresi gagal. Coba format lain atau foto yang lebih kecil.";}finally{canvas.width=0;canvas.height=0;if(current===generation)button.disabled=false;}
});
