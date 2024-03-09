const navmenuicon = document.getElementById("navmenuicon");
navmenuicon.addEventListener("click", slideMenu);
const menucontainer = document.getElementById("menucontainer");

const tl = gsap.timeline({
    reversed: true,
    paused: true,
    defaults: {
      duration: 0.3
    }
});
tl.set(menucontainer,{autoAlpha:1})
tl.to(menucontainer,{ x: "0%"})

function slideMenu() {
    // play or reverse the timeline
    tl.reversed() ? tl.play() : tl.reverse();
}
