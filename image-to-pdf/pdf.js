"use strict";
const el=id=>document.getElementById(id), input=el("file"), button=el("generate"), result=el("result"), download=el("download");
let files=[], generation=0, outputURL=null;
function clearOutput(){if(outputURL)URL.revokeObjectURL(outputURL);outputURL=null;download.hidden=true;download.style.display="none";download.removeAttribute("href");}
input.addEventListener("change",()=>{generation++;clearOutput();files=Array.from(input.files);el("files").replaceChildren();el("file-name").textContent=files.length?files.length+" foto dipilih":"Belum ada file dipilih";const valid=files.length>0&&files.length<=10&&files.every(f=>["image/jpeg","image/png","image/webp"].includes(f.type))&&files.reduce((a,f)=>a+f.size,0)<=30*1024*1024;button.disabled=!valid;el("status").textContent=valid?"Foto akan diproses sesuai urutan daftar.":"Pilih 1–10 foto yang valid, maksimal total 30 MB.";for(const f of files.slice(0,10)){const li=document.createElement("li");li.textContent=f.name;el("files").append(li);}result.textContent="Hasil akan muncul di sini.";});
const encoder=new TextEncoder();
function makePDF(images,pw,ph,margin){
 const chunks=[], offsets=[0];let length=0;
 function add(value){const b=typeof value==="string"?encoder.encode(value):value;chunks.push(b);length+=b.length;}
 function obj(id,body){offsets[id]=length;add(id+" 0 obj\n");body();add("\nendobj\n");}
 add("%PDF-1.4\n");obj(1,()=>add("<< /Type /Catalog /Pages 2 0 R >>"));
 obj(2,()=>add("<< /Type /Pages /Count "+images.length+" /Kids ["+images.map((_,i)=>(3+i*3)+" 0 R").join(" ")+"] >>"));
 images.forEach((im,i)=>{const p=3+i*3,x=p+1,c=p+2;
 const scale=Math.min((pw-2*margin)/im.w,(ph-2*margin)/im.h),w=im.w*scale,h=im.h*scale;
 const stream="q\n"+w.toFixed(3)+" 0 0 "+h.toFixed(3)+" "+((pw-w)/2).toFixed(3)+" "+((ph-h)/2).toFixed(3)+" cm\n/Im0 Do\nQ\n";
 obj(p,()=>add("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 "+pw+" "+ph+"] /Resources << /XObject << /Im0 "+x+" 0 R >> >> /Contents "+c+" 0 R >>"));
 obj(x,()=>{add("<< /Type /XObject /Subtype /Image /Width "+im.w+" /Height "+im.h+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+im.bytes.length+" >>\nstream\n");add(im.bytes);add("\nendstream");});
 obj(c,()=>{add("<< /Length "+encoder.encode(stream).length+" >>\nstream\n");add(stream);add("endstream");});
 });const start=length;add("xref\n0 "+offsets.length+"\n0000000000 65535 f \n");for(let i=1;i<offsets.length;i++)add(String(offsets[i]).padStart(10,"0")+" 00000 n \n");add("trailer\n<< /Size "+offsets.length+" /Root 1 0 R >>\nstartxref\n"+start+"\n%%EOF\n");return new Blob(chunks,{type:"application/pdf"});
}
async function readPhoto(file){
 const url=URL.createObjectURL(file),img=new Image(),canvas=document.createElement("canvas");
 try{img.src=url;await img.decode();const w=img.naturalWidth,h=img.naturalHeight;if(!w||!h||w*h>16000000||w>8192||h>8192)throw new Error("Resolusi foto melebihi batas.");
 const scale=Math.min(1,2400/Math.max(w,h));canvas.width=Math.max(1,Math.round(w*scale));canvas.height=Math.max(1,Math.round(h*scale));const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Canvas tidak tersedia.");ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
 const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b&&b.type==="image/jpeg"?resolve(b):reject(new Error("Gagal memproses foto.")),"image/jpeg",.9));return {w:canvas.width,h:canvas.height,bytes:new Uint8Array(await blob.arrayBuffer())};
 }finally{URL.revokeObjectURL(url);canvas.width=0;canvas.height=0;}
}
el("pdf-form").addEventListener("submit",async e=>{e.preventDefault();if(button.disabled||!files.length)return;const margin=el("margin").valueAsNumber;if(!Number.isInteger(margin)||margin<0||margin>40)return;const current=++generation,selected=files.slice(),landscape=el("orientation").value==="landscape";clearOutput();button.disabled=true;
 try{const images=[];for(const file of selected){if(current!==generation)return;result.textContent="Memproses foto "+(images.length+1)+" dari "+selected.length+"...";images.push(await readPhoto(file));}if(current!==generation)return;const pdf=makePDF(images,landscape?841.89:595.28,landscape?595.28:841.89,margin*72/25.4);outputURL=URL.createObjectURL(pdf);download.href=outputURL;download.download="toolnexa-foto.pdf";download.hidden=false;download.style.display="inline-block";result.textContent="PDF berhasil dibuat: "+images.length+" halaman · "+(pdf.size/1024).toFixed(1)+" KB.";
 }catch(err){if(current===generation)result.textContent="Gagal membuat PDF. Periksa format dan resolusi foto, lalu coba lagi.";}finally{if(current===generation)button.disabled=false;}
});
