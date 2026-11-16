"use strict";
const el=id=>document.getElementById(id),mode=el("mode"),video=el("video"),size=el("size"),result=el("result");
const presets={"720":5,"1080":8,"1440":16,"2160":35};
const fmt=n=>n.toLocaleString("id-ID",{maximumFractionDigits:6});
function example(){return presets[el("resolution").value]*(Number(el("fps").value)===60?1.5:1);}
function updateHint(){el("hint").textContent="Contoh bitrate H.264: "+fmt(example())+" Mbps untuk pilihan resolusi dan FPS ini. Hanya titik awal, bukan standar wajib.";}
function sync(){const target=mode.value==="bitrate";video.disabled=target;size.disabled=!target;el("video-label").style.display=target?"none":"";el("size-label").style.display=target?"":"none";el("preset").disabled=target;result.textContent="Masukkan pengaturan video lalu klik Hitung.";}
mode.addEventListener("change",sync);sync();
for(const id of ["resolution","fps"])el(id).addEventListener("change",updateHint);
el("preset").addEventListener("click",()=>{video.value=example();result.textContent="Contoh bitrate sudah diisi. Klik Hitung.";});
function fileSize(v,a,d){return (v+a/1000)*d/8;}
function targetBitrate(s,a,d){return s*8/d-a/1000;}
el("bitrate-form").addEventListener("submit",e=>{e.preventDefault();const d=el("duration").valueAsNumber,a=el("audio").valueAsNumber;
if(!Number.isInteger(d)||d<1||d>86400||!Number.isInteger(a)||a<0||a>1536){result.textContent="Masukkan durasi dan bitrate audio yang valid.";return;}
if(mode.value==="size"){const v=video.valueAsNumber;if(!Number.isFinite(v)||v<.001||v>10000){result.textContent="Masukkan bitrate video yang valid.";return;}const mb=fileSize(v,a,d);result.textContent="Perkiraan ukuran file: "+fmt(mb)+" MB ("+fmt(mb/1000)+" GB) · Total bitrate: "+fmt(v+a/1000)+" Mbps.";}
else{const s=size.valueAsNumber;if(!Number.isFinite(s)||s<.001||s>1000000){result.textContent="Masukkan target ukuran file yang valid.";return;}const v=targetBitrate(s,a,d);if(v<=0){result.textContent="Target terlalu kecil untuk bitrate audio dan durasi ini. Kurangi bitrate audio atau naikkan target ukuran.";return;}result.textContent="Perkiraan bitrate video: "+fmt(v)+" Mbps ("+fmt(v*1000)+" kbps). Sisakan ruang untuk overhead file.";}
});
