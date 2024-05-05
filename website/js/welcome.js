const url = window.location.href;
myWorkSpaces = [];
mynotifications = [];
const username = url.match(/@([^\.]+)/)[0];
const navmenuicon = document.getElementById("navmenuicon");
//navmenuicon.addEventListener("click", slideMenu); saving this function for later, read the comment down below
const menucontainer = document.getElementById("menucontainer");

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
  tl2.reversed() ? tl2.play() : tl2.reverse();
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
          <div class="decline id="${notifs[i].actionTarget}">decline</div>
      </div> 
      </div>`
    }
    else if(notifs[i].isDialouge === 0){
      notifcards += 
      `<div class="noti-message"><span>you got invited to this work space :</span>
      </div>`
    }
  }
  notibody.innerHTML= notifcards;
}
//notification logic
const addwsmodal = document.getElementById("submit-workspace");
const addwsbtn = document.getElementById("add-workspaces-btn");
const invitewsmodal = document.getElementById("invite-users-form"); // second modal for adding users
addwsbtn.addEventListener('click',()=>{
  addwsmodal.showModal();
});

const wsSubmitbtn = document.getElementById("ws-submit-btn");
wsSubmitbtn.addEventListener("click",()=>{
  let InputwsName = document.getElementById("ws-i-name").value;
  let InputwsDescription = document.getElementById("ws-i-description").value;
  let isWhitespaceString = str => !str.replace(/\s/g, '').length
  if(!(isWhitespaceString(InputwsName) && isWhitespaceString(InputwsDescription))){
    submitWorkspaceAddform(InputwsName, InputwsDescription);
  }
})

async function submitWorkspaceAddform(n1,n2){
  const res = await fetch('/addws',
          {method:'POST',
          headers:{"Content-Type":'application/json'},
          body: JSON.stringify({"username":username, "workspaceName":n1,"workspaceDescription":n2})
        });
        myWorkSpaces = getmyws();
        myWorkSpaces.then(myws =>{console.log(myws)})
        addwsmodal.close();
        invitewsmodal.showModal();
}
const userInvitedBox = document.getElementById("ws-add-usersBox");
const userInviteBtn = document.getElementById('ws-invite-btn');
let inviteBoxText = "";
userInviteBtn.addEventListener("click", ()=>{
  let user = document.getElementById("ws-i-addusers").value;
  let isusername = str => /^@[A-Za-z0-9_-]+$/.test(str)
  if (isusername(user)){
    inviteBoxText += `<span>${user}</span>`;
    userInvitedBox.innerHTML = inviteBoxText;
    myWorkSpaces.then(myws =>{
      res = fetch('/inviteuser/'+username,
      {method:'POST',
      headers:{"Content-Type":'application/json'},
      body: JSON.stringify({"username":user, "uuid": myws[0].uuid, "wsname":myws[0].wsname})
    });
    })
  }
  console.log(inviteBoxText);
}) 
myWorkSpaces = getmyws();
myWorkSpaces.then(myws =>{console.log(myws)})
async function getmyws(){
  const res = await fetch('/myws/'+username,
          {method:'GET',
          headers:{"Content-Type":'application/json'},
  });
  const data = await res.json();
  myws = getmywsobject(data);
  loadws(myws);
  return myws;
}
function getmywsobject(data) {
  myws = [];
  for(i = 0; i< data.length;i++){
    myws[i] = {
      username : data[i].username,
      uuid : data[i].uuid,
      wsname : data[i].wsname,
      wsdescription: data[i].wsdescription,
      createdAt: new Date(data[i].created_at)
    }
  }
  return myws;
}
function loadws(myws){
  let wscards = "";
  let wsbody = document.getElementById("workspace-body");
  for(i = 0; i<myws.length; i++){
    wscards += 
    `<div class="ws-card-wrap">
    <div class="ws-card">
      <div class="ws-card-section1">
        <img src="images/chat.png" alt="">
        <span>${myws[i].wsname}<br>${myws[i].username}</span>
      </div>
      <div class="ws-card-section2">
        <span>${myws[i].wsdescription}</span>
      </div>
      <div class="btn-options">
        <div class="accept join" id="${myws[i].uuid}">join</div>
        <div class="decline more-info" id="${myws[i].uuid}">more info</div>
      </div> 
    </div>
  </div>`
  }
  wsbody.innerHTML= wscards;
}