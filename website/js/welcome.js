const url = window.location.href;
const Username = url.match(/@([^\.]+)/)[0];
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
  console.log("hello");
}

/* function slideMenu() {
    // play or reverse the timeline
    tl.reversed() ? tl.play() : tl.reverse();
} */ // this functions slides the side menu only useful for responsivness with smaller screens
getUserData();
async function getUserData(){
  const res = await fetch('/userinfo/'+Username,
          {method:'GET',
          headers:{"Content-Type":'application/json'},
  });
  const data = await res.json();
  profileName.innerHTML = ""+ data.username
  profileBio.innerHTML= `<span>${data.first_name} ${data.last_name}</span><span>${data.bio}</span>`
}