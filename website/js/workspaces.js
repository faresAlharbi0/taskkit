const url = window.location.href;
mynotifications = [];
const username = url.match(/@([^\/]+)/)[0];
console.log(url.match(/@([^\/]+)/)[0])
const navmenuicon = document.getElementById("navmenuicon");
//navmenuicon.addEventListener("click", slideMenu); saving this function for later, read the comment down below
const menucontainer = document.getElementById("menucontainer");
const badge = document.getElementById("badge");
const profileIconElement = document.getElementById("profile");
const profileMenu = document.getElementById("profile-menu");
const profileName = document.getElementById("nav-profile-name");
const profileBio = document.getElementById("side-menu-bio");
var profileFlag = true;
profileIconElement.addEventListener('click',()=>{
  if(profileFlag === true){
    profileMenu.style = "display: flex;";
    profileFlag = false;
  }
  else{
    profileMenu.style = "display: none;";
    profileFlag = true;
  }
})

const notBtn = document.getElementById("not-btn");
notBtn.addEventListener("click",notiSlider);
const notMsgContainer = document.getElementById("not-messages-container");

/* const tl = gsap.timeline({
    reversed: true,
    paused: true,
    defaults: {
      duration: 0.3
    }
});
tl.set(menucontainer,{autoAlpha:1})
tl.to(menucontainer,{ x: "0%"}) */

const tl2 = gsap.timeline({
  reversed: true,
  paused: true,
  defaults: {
    duration: 0.2
  }
});
tl2.set(notMsgContainer,{autoAlpha:1});
tl2.to(notMsgContainer,{height: "30rem",display: "flex"});

function notiSlider() {
  // play or reverse the timeline
  mynotifications.then(notifs => {
    if(!notifs[0]){
      return;
    }
    else if(notifs[0].notifs > 0){
      console.log("test")
      const res = fetch('/updatemyNotifMessages/'+username,
      {method:'GET',
      headers:{"Content-Type":'application/json'},});
      mynotifications = getmynotifications();
    }
  })
  if(tl2.reversed()){
    tl2.play();
  } 
  else if(!tl2.reversed()){
    tl2.reverse();
  }
}

/* function slideMenu() {
    // play or reverse the timeline
    tl.reversed() ? tl.play() : tl.reverse();
} */ // this functions slides the side menu only useful for responsivness with smaller screens
getUserData();
async function getUserData(){
  const res = await fetch('/userinfo/'+username,
          {method:'GET',
          headers:{"Content-Type":'application/json'},
  });
  const data = await res.json();
  profileName.innerHTML = ""+ data.username
  profileBio.innerHTML= `<span>${data.first_name} ${data.last_name}</span><span>${data.bio}</span>`
}
// notifications logic
const eventSource = new EventSource('http://localhost:2500/notifications/'+username);
        eventSource.onmessage = function(event) {
          mynotifications = getmynotifications();
};

mynotifications = getmynotifications();
mynotifications.then(notifs =>{console.log(notifs)})
async function getmynotifications(){
  const res = await fetch('/myNotifMessages/'+username,
          {method:'GET',
          headers:{"Content-Type":'application/json'},
  });
  const data = await res.json();
  notifs = getmynotificationsObject(data);
  loadNotifMessages(notifs);
  return notifs;
}
function getmynotificationsObject(data) {
  notifs = [];
  for(i = 0; i< data.length;i++){
    notifs[i] = {
      notifs : data[i].notifs,
      isDialouge : data[i].isDialouge,
      actionTarget : data[i].actionTarget,
      _message: data[i]._message
    }
  }
  return notifs;
}
function loadNotifMessages(notifs){
  let notifcards = "";
  let notibody = document.getElementById("noti-body");
  for(i = 0; i<notifs.length; i++){
    if (notifs[i].isDialouge === 1){
      notifcards += 
      `<div class="noti-message"><span>${notifs[i]._message}</span>
      <div class="btn-options">
          <div class="accept" id="${notifs[i].actionTarget}">accept</div>
          <div class="decline" id="${notifs[i].actionTarget}">decline</div>
      </div> 
      </div>`
    }
    else if(notifs[i].isDialouge === 0){
      notifcards += 
      `<div class="noti-message"><span>${notifs[i]._message}</span>
      </div>`
    }
  }
  notibody.innerHTML= notifcards;
  loadbadge(notifs)
  Notifeventlisteners();
}
function loadbadge(notifs){
  if(!notifs[0]){
    return
  }
  else if(notifs[0].notifs > 9){
    badge.innerText = "9+";
    badge.style = "display: flex;"
  }
  else if(notifs[0].notifs > 0){
    badge.innerText = "" + notifs[0].notifs;
    badge.style = "display: flex;"
  }
  else if(notifs[0].notifs === 0){
    badge.innerText = "" + notifs[0].notifs;
    badge.style = "display: none;"
  }
}
function Notifeventlisteners(){
  let notifaccept = document.getElementsByClassName("accept")
  let notifdecline = document.getElementsByClassName("decline")
    if(notifaccept){
      for(let i=0; i < notifaccept.length;i++){
        notifaccept[i].addEventListener("click",acceptnotif)
      }
      for(let i=0; i < notifdecline.length;i++){
        notifdecline[i].addEventListener("click",declinenotif)
      }
    }
}
async function acceptnotif(e){
  const res = await fetch('/inviteResponse',
          {method:'POST',
          headers:{"Content-Type":'application/json'},
          body: JSON.stringify({"username":username, "uuid": e.target.id, "response":1})
        });
        mynotifications = getmynotifications();

        myInviteWorkspaces = getmyInvitews();//load the new invite workspaces
}
async function declinenotif(e){
  const res = await fetch('/inviteResponse',
          {method:'POST',
          headers:{"Content-Type":'application/json'},
          body: JSON.stringify({"username":username, "uuid": e.target.id, "response":0})
        });
        mynotifications = getmynotifications();
}
//notification logic

