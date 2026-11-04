const calendar = document.getElementById("calendar");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const dateLine = document.getElementById("dateLine");
const countdown = document.getElementById("countdown");
const today = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {timeZone:"Europe/Vienna",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
  const p = Object.fromEntries(parts.map(x=>[x.type,x.value]));
  return {year:+p.year,month:+p.month,day:+p.day};
};
function render(){
  const now=today();
  dateLine.textContent = new Intl.DateTimeFormat("hu-HU",{timeZone:"Europe/Vienna",year:"numeric",month:"long",day:"numeric"}).format(new Date());
  const adventStart = new Date(now.year,11,1);
  if(now.month<12) countdown.textContent = `Még ${Math.ceil((Date.UTC(now.year,11,1)-Date.UTC(now.year,now.month-1,now.day))/86400000)} nap az első meglepetésig`;
  else if(now.month===12 && now.day<=24) countdown.textContent = "Minden nap egy újabb meglepetés vár rád. ✨";
  else countdown.textContent = "A kalendárium minden ajtaja kinyílt. Boldog karácsonyt! ❤️";
  calendar.innerHTML="";
  for(let day=1;day<=24;day++){
    const unlocked=now.month===12 && now.day>=day || now.month>12;
    const btn=document.createElement("button");
    btn.className="door";
    btn.type="button";
    btn.disabled=!unlocked;
    btn.setAttribute("aria-label",unlocked?`${day}. nap megnyitása`:`${day}. nap – még zárva`);
    btn.innerHTML=`<span class="symbol">${unlocked?"✦":"✧"}</span><span class="number">${String(day).padStart(2,"0")}</span>`;
    if(unlocked) btn.addEventListener("click",()=>openGift(day));
    calendar.appendChild(btn);
  }
}
function openGift(day){
  const gift=gifts[day-1] || {title:"Meglepetés",message:"❤️",image:""};
  document.getElementById("modalDay").textContent=`DECEMBER ${day}.`;
  document.getElementById("modalTitle").textContent=gift.title;
  document.getElementById("modalMessage").textContent=gift.message;
  const wrap=document.getElementById("imageWrap"),img=document.getElementById("giftImage");
  if(gift.image){img.src=gift.image;wrap.hidden=false;}else{img.removeAttribute("src");wrap.hidden=true;}
  modal.classList.add("show");modal.setAttribute("aria-hidden","false");closeModal.focus();
}
function hideModal(){modal.classList.remove("show");modal.setAttribute("aria-hidden","true");}
closeModal.addEventListener("click",hideModal);
modal.addEventListener("click",e=>{if(e.target===modal)hideModal();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")hideModal();});
render();