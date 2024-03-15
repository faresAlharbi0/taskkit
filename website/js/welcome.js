const navmenuicon = document.getElementById("navmenuicon");
navmenuicon.addEventListener("click", slideMenu);
const menucontainer = document.getElementById("menucontainer");

const notBtn = document.getElementById("not-btn");
notBtn.addEventListener("click",notiSlider);
const notMsgContainer = document.getElementById("not-messages-container");

const tl = gsap.timeline({
    reversed: true,
    paused: true,
    defaults: {
      duration: 0.3
    }
});
tl.set(menucontainer,{autoAlpha:1})
tl.to(menucontainer,{ x: "0%"})

const tl2 = gsap.timeline({
  reversed: true,
  paused: true,
  defaults: {
    duration: 0.2
  }
});
tl2.set(notMsgContainer,{autoAlpha:1});
tl2.to(notMsgContainer,{height: "20rem",display: "flex"});

function notiSlider() {
  // play or reverse the timeline
  tl2.reversed() ? tl2.play() : tl2.reverse();
  console.log("hello");
}

function slideMenu() {
    // play or reverse the timeline
    tl.reversed() ? tl.play() : tl.reverse();
}
