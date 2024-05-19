const url = window.location.href;
mynotifications = [];
mytasklists = [];
myArticles = [];
myMessages = [];
const username = url.match(/@([^\/]+)/)[0];
const workSpaceuuid = url.match(/[0-9a-fA-F-]{36}/)[0]
console.log(workSpaceuuid)
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
const eventSource2 = new EventSource('http://localhost:2500/WSevents/'+workSpaceuuid);
        eventSource2.onmessage = function(event) {
          userdata = JSON.parse(event.data);
          if(userdata){
            if(userdata.obj.username != username){
              if(userdata.obj.target === 1){
                mytasklists = getmyTasklists();
              }
              else if(userdata.obj.target === 2){
                myArticles = getMyArticles();
                console.log("new content recieved");
              }
              else if(userdata.obj.target === 3){
                myMessages = getMyMessages();
              }
            }
          }
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
// more info modal
const moreInfoModal = document.getElementById("ws-more-info");
const closemoreInfoWSmodal = document.getElementById("close-ws-moreinfo-btn");
const menuMoreInfoWSbtn = document.getElementById("work-space-info-menubtn")
menuMoreInfoWSbtn.addEventListener("click",async ()=>{
  profileMenu.style = "display: none;";
  profileFlag = true;
  const res = await fetch('/getmywsInfo/'+workSpaceuuid,
          {method:'GET',
          headers:{"Content-Type":'application/json'}});
  const data = await res.json();
  let text1element = document.getElementById("ws-more-info-t1");
  text1element.innerHTML = `<span>workspace name: ${data.wsname}</span><br>
  <span>creator: ${data.username}</span><br>
  <span>workspace description: </span><br> <span>${data.wsdescription}</span>`

  const res2 = await fetch('/getmywsmembers/'+workSpaceuuid,
          {method:'GET',
          headers:{"Content-Type":'application/json'}});
  const data2 = await res2.json();
  let text2element = document.getElementById("ws-more-info-t2");
  elemntContent = `<span>${data2[0].username}: &emsp; Owner</span><br>`
  for(i = 1; i<data2.length; i++){
    if(data2[i]){
      if(data2[i].userStatus === 1){
        elemntContent += `<span>${data2[i].username}:&emsp; accepted invitation</span><br>`
      }
      else if(data2[i].userStatus === 0){
        elemntContent += `<span>${data2[i].username}:&emsp; rejected invitation</span><br>`
      }
      else(
        elemntContent += `<span>${data2[i].username}:&emsp; pending invitation</span><br>`
      )
    }
  }
  text2element.innerHTML = elemntContent;
  moreInfoModal.showModal();
})
closemoreInfoWSmodal.addEventListener("click",()=>{
  moreInfoModal.close();
})
//tab navagitation logic
const tasksTab = document.getElementById('tasks-tab');
const tasksWrapper = document.getElementById('tasksWrapper')
tasksTab.addEventListener('click',pushTabState);
const articlesTab = document.getElementById('articles-tab');
const articlesWrapper = document.getElementById('articlesWrapper')
articlesTab.addEventListener('click',pushTabState);
const chatTab = document.getElementById('chat-tab');
const chatWrapper = document.getElementById('chatWrapper')
chatTab.addEventListener('click',pushTabState);
current = "tasks-tab";
WrapperCurrent = "tasksWrapper";

function pushTabState(e){
    if(e.target.id === "articles-tab" && e.target.id != current){
        let currentElemnt = document.getElementById(current).classList.toggle('active');
        let currentView = document.getElementById(WrapperCurrent).style ="display : none;"
        articlesTab.classList.toggle('active');
        articlesWrapper.style = "display: flex;"
        current = e.target.id;
        WrapperCurrent = "articlesWrapper";
        history.pushState({}, '', url + '/articles')
    }
    else if(e.target.id  === "tasks-tab" && e.target.id != current){
        let currentElemnt = document.getElementById(current).classList.toggle('active');
        let currentView = document.getElementById(WrapperCurrent).style ="display : none;"
        tasksTab.classList.toggle('active');
        tasksWrapper.style = "display: flex;"
        current = e.target.id;
        WrapperCurrent = "tasksWrapper";
        history.pushState({}, '',url + '/tasks')
    }
    else if(e.target.id  === "chat-tab" && e.target.id != current){
        let currentElemnt = document.getElementById(current).classList.toggle('active');
        let currentView = document.getElementById(WrapperCurrent).style ="display : none;"
        chatTab.classList.toggle('active');
        chatWrapper.style = "display: flex;"
        current = e.target.id;
        WrapperCurrent = "chatWrapper";
        history.pushState({}, '', url + '/groupChat')
    }
}

// adding a new task list logic
const addTaskModal = document.getElementById('ws-add-task');
const closeTaskModalbtn = document.getElementById("close-add-task-btn");
const submitNewTask = document.getElementById("submit-taskbtn");
closeTaskModalbtn.addEventListener("click",()=>{
  addTaskModal.close();
})
const taskListWrapper = document.getElementById("tasklists-section");
async function addTaskList(){
  let inputValue = document.getElementById("addNewTaskList").value;
  let isWhitespaceString = str => str.replace(/\s/g, '').length
  if(isWhitespaceString(inputValue)){
    const res = await fetch('/addTaskList',
    {method:'POST',
    headers:{"Content-Type":'application/json'},
    body: JSON.stringify({"username":username, "uuid": workSpaceuuid,"title": inputValue})});
    mytasklists = getmyTasklists();
  }
}
mytasklists = getmyTasklists();
console.log(mytasklists);
currentTasklistID = "";
async function getmyTasklists(){
  const res = await fetch('/getMyTaskLists/'+workSpaceuuid,
    {method:'GET',
    headers:{"Content-Type":'application/json'}});
    const data = await res.json();
    console.log(data);

    tlWrapperContent = 
`<div class="tasklist-wrapper">
  <div class="tasklists-header">
    <div class="add-workspaces-btn" onclick="addTaskList()" id="test"><span class="material-symbols-outlined">add</span></div>
    <input type="text" id="addNewTaskList" placeholder=" add a new task list">
  </div>
  <div class="tasklists-body" id="workspace-body"></div>
</div>`

    for(i=0; i< data.length; i++){
      if(data[i]){
        tlWrapperContent =
        `<div class="tasklist-wrapper">
          <div class="tasklists-header">
            <div class="add-new-task" id="${data[i].taskListuuid}"><span class="material-symbols-outlined">add</span></div>
            <span class="my-ws-span">${data[i].title}</span>
          </div>
        <div class="tasklists-body id="${data[i].taskListuuid}">${await getMyTasks(data[i].taskListuuid)}</div>
        </div>` + tlWrapperContent
      }
    }
    taskListWrapper.innerHTML = tlWrapperContent;
    addTasksEventlisteners();
    return data;
}
async function getMyTasks(listuuid){
  const res = await fetch('/getMyTasks/'+listuuid,
    {method:'GET',
    headers:{"Content-Type":'application/json'}});
    const data = await res.json();
    let currentElement = "";
    console.log(data);
    if(data[0]){
      for(let i = 0; i< data.length;i++){
        if(data[i].username){
          currentElement += `<div class="taskcard">
        <div class="text-header">
            <img src="/images/defaultProfilePic.jpg">
            <span>${data[i].title}<br><p>${data[i].username} . due: ${data[i].deadline}</p></span>
        </div>
        <div class="text-body"><span>${data[i].content}</span>
        </div>
        <div class="taskbtn-wrapper"><div class="taskcard-btn">more info</div></div>
    </div>`
        }
        else{
          break;
        }
      }
    }
    return currentElement;
}
function addTasksEventlisteners(){
  let TaskLists = document.getElementsByClassName("add-new-task")
  console.log(TaskLists);
  if(TaskLists){
    for(i = 0; i < TaskLists.length; i++){
      TaskLists[i].addEventListener("click",addNewTask);
    }
  }
}
async function addNewTask(e){
  let inputinfoTitle = document.getElementById("task-under-span");
  let dateInput = document.getElementById("task-deadline");
  var today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute("min", today);
  mytasklists.then(data =>{
    if(data){
      for(i = 0; i<data.length; i++){
        if(data[i].taskListuuid === e.currentTarget.id){
          inputinfoTitle.innerText = "entering a new task under: " +data[i].title 
        }
      }
    }
  })
  
  currentTasklistID = e.currentTarget.id
  addTaskModal.showModal();
}
async function AddNewTaskSubmit() {
  const dateInput = document.getElementById("task-deadline").value;
  const taskTitleInput = document.getElementById("task-i-title").value;
  const taskContentInput = document.getElementById("task-i-body").value;

  const isWhitespaceString = str => str.trim().length > 0;

  if (isWhitespaceString(dateInput) && isWhitespaceString(taskTitleInput) && isWhitespaceString(taskContentInput)) {
    console.log(dateInput + " " + taskTitleInput + " " + taskContentInput + " " + currentTasklistID);
    const res = await fetch('/addNewTask',
    {method:'POST',
    headers:{"Content-Type":'application/json'},
    body: JSON.stringify(
      {"username":username, "uuid": workSpaceuuid,"title": taskTitleInput,"content":taskContentInput,
      "deadline":dateInput,"taskListuuid":currentTasklistID})});
    mytasklists = getmyTasklists();
    // Add logic to submit the new task here
  }
};
/*submitNewTask.addEventListener("click",async ()=>{
  let dateInput = document.getElementById("task-deadline").value;
  let taskTitleInput = document.getElementById("task-i-title").value;
  let taskContentInput = document.getElementById("task-i-body").value;
  let isWhitespaceString = str => str.replace(/\s/g, '').length
  if(isWhitespaceString(dateInput) && isWhitespaceString(taskTitleInput) && isWhitespaceString(taskContentInput)){
    console.log(dateInput +" "+ taskTitleInput + " "+taskContentInput + " ")
  }
})*/
// end of tasks logic
// articles logic
const addArticleModal = document.getElementById('ws-add-article');
const closeAddArticlebtn = document.getElementById("close-add-article-btn");
const addArticlebtn = document.getElementById("add-article-btn");

addArticlebtn.addEventListener("click",()=>{
  addArticleModal.showModal();
})
closeAddArticlebtn.addEventListener("click",()=>{
  addArticleModal.close();
})
const sbumitArticlebtn = document.getElementById("submit-articlebtn");
sbumitArticlebtn.addEventListener("click",async ()=>{
  let title = document.getElementById("article-i-title").value;
  let content = document.getElementById("article-i-body").value;
  let isWhitespaceString = str => str.replace(/\s/g, '').length
  if(isWhitespaceString(title) && isWhitespaceString(content)){
    const res = await fetch('/addArticle',
    {method:'POST',
    headers:{"Content-Type":'application/json'},
    body: JSON.stringify({"username":username, "uuid": workSpaceuuid,"title": title,"content": content})}); 
  }
  addArticleModal.close();
  myArticles = getMyArticles();
})
const articleList = document.getElementById("article-titles-list");
myArticles = getMyArticles();
console.log(myArticles);
async function getMyArticles(){
  const res = await fetch('/getMyArticles/'+workSpaceuuid,
    {method:'GET',
    headers:{"Content-Type":'application/json'}});
  const data = await res.json();
  articleListBody = "";
  for(i = 0; i < data.length; i++){
    if(data[i]){
      articleListBody += `<span class="article-title-picker" id="${data[i].article_uuid}">${data[i].title}</span>`
    }
    
  }
  articleList.innerHTML = articleListBody;
  let articleElements = document.getElementsByClassName("article-title-picker")
  if(articleElements){
    for(i = 0;i <articleElements.length; i++){
      articleElements[i].addEventListener("click",LoadArticle)
    }
  }
  return data

}
function LoadArticle(e){
  let elemntTitle = document.getElementById("my-article-title-span")
  let elemntBody = document.getElementById("article-body")
  myArticles.then(data=>{
    if(data){
      for(i=0;i < data.length;i++){
        if(data[i].article_uuid === e.target.id){
          elemntTitle.innerText = data[i].title;
          elemntBody.innerHTML = `<span>${data[i].content}</span>`
          break;
        }
      }

    }
  })
}
// end of articles logic

// chatting logic
const chatBox = document.getElementById("chat-box");
const ChatCbody = document.getElementById("chat-body");
myMessages = getMyMessages();
myMessages.then(data =>{console.log(data)});
console.log(myArticles);
async function getMyMessages(){
  const res = await fetch('/getChatMessages/'+workSpaceuuid,
    {method:'GET',
    headers:{"Content-Type":'application/json'}});
  const data = await res.json();
  chatBoxbody = "";
  currentUser = "";
  counter = 0;
  for(i = 0; i < data.length; i++){
    if(data[i]){
      if(data[i].username === currentUser && counter < 5){
        chatBoxbody +=  `<div class="text-body"><span>${data[i]._message}</span></div>`
        counter++;

      }
      else{
        let dateString = new Date(data[i].created_at).toDateString();
        let localTime = new Date(data[i].created_at).toLocaleTimeString();
        messageTime = dateString + " " + localTime
        chatBoxbody +=  
        `<div class="text-header"><img src="/images/defaultProfilePic.jpg"><span>${data[i].username}<br>
        ${messageTime}</span></div>
        <div class="text-body"><span>${data[i]._message}</span></div>`
        currentUser = data[i].username
        counter = 0;
      }
    }
    
  }
  chatBox.innerHTML = chatBoxbody;
  updateScrollHeight();
  return data
}
console.log("hello "+ chatBox.scrollHeight);
console.log("hello "+ ChatCbody.scrollHeight);
let chatBoxInput = document.getElementById("chat-box-i");
let isWhitespaceString = str => str.replace(/\s/g, '').length
chatBoxInput.addEventListener('keypress', async function (e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    let result = chatBoxInput.value;
    chatBoxInput.value ="";
    if(isWhitespaceString(result)){
    const res = await fetch('/addMessage',
    {method:'POST',
    headers:{"Content-Type":'application/json'},
    body: JSON.stringify({"username":username, "uuid": workSpaceuuid,"_message": result})}); 
    myMessages = getMyMessages();
    }
  }
});

function updateScrollHeight(){
  requestAnimationFrame(() => {
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}
