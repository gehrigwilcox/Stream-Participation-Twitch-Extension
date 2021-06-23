var config = {
  "this/is/an/event": {cost:10,command:"/say this is an event"},
  "this/is/an/event2": {cost:20,command:"/say this is an event 2"},
  "this/is/also/an/event": {cost:30,command:"/say this is also an event"},
  "this/is/also/an/event2": {cost:40,command:"/say this is also an event 2"},
  "hello/world": {cost:50,command:"/say hello world"}
};

var domLoaded = false;
var clickWait = false;
var token = '';
var verificationServer = "https://sp-verification-server.herokuapp.com";

function populateMenu(){
  /*  Clear out menu  */
  document.getElementById('menu').innerHTML = "";
  /*  Try to add every event in config to menu  */
  for(const property in config){
    createEvent(property,config[property]);
  }
}

function createFolder(folderPath){

  /*  Get parent folder path  */
  var parentFolderPath = folderPath.split("/");
  parentFolderPath.pop();
  parentFolderPath = parentFolderPath.join("/");

  /*  Get Parent Folder Element */
  var parentFolder = getFolderElement(parentFolderPath);
  if(parentFolder.id === 'menu') parentFolder.appendChild(document.createElement('br'));

  /*  Create new Folder Element */
  var newFolder = document.createElement('folder');
  newFolder.innerHTML = folderPath.split("/").pop();
  newFolder.id = folderPath;
  newFolder.className = "closed";
  /*  If folder is closed and clicked, open it
      If folder is open and clicked, close it */
  newFolder.onclick = () => {
    /*
      onclick is called when child elements are clicked too, so click wait
      makes sure that only the bottom level elements onclick is called
    */
    if(!clickWait){
      if(newFolder.className.includes("closed")){
        newFolder.className = newFolder.className.replace("closed","open");
      }else{
        newFolder.className = newFolder.className.replace("open","closed");
      }
      clickWait = true;
      setTimeout(()=>{clickWait=false;},1);
    }
  };
  /*  Add new folder to parent folder */
  parentFolder.appendChild(newFolder);

  return newFolder;
}

function getFolderElement(folderPath){
  /*  If no folder is given, return root container  */
  if(!folderPath) return document.getElementById('menu');
  /*  Get folder  */
  var folder = document.getElementById(folderPath);
  /*  If folder does not exist, create it */
  if(!folder) folder = createFolder(folderPath);

  return folder;
}

function createEvent(eventPath,eventData){
  /*  Get the path to the events parent folder  */
  var parentPath = eventPath.split("/");
  parentPath.pop();
  parentPath = parentPath.join("/");

  /*  Get the element of the events parent folder */
  var parentElement = getFolderElement(parentPath);

  if(parentElement.id === 'menu') parentElement.appendChild(document.createElement('br'));

  /*  Create a new event element and apply data */
  var eventElement = document.createElement('event');
  eventElement.innerHTML = eventPath.split("/").pop();
  eventElement.id = eventPath;
  eventElement.cost = eventData.cost;
  eventElement.command = eventData.command;

  /*  Also show event cost  */
  var costElement = document.createElement('cost');
  costElement.innerHTML = eventData.cost;
  eventElement.appendChild(document.createElement('br'));
  eventElement.appendChild(costElement);

  eventElement.onclick = ()=>{clickEventElement(eventElement)};

  /*  Add event to parent folder  */
  parentElement.appendChild(eventElement);
}








window.addEventListener('DOMContentLoaded',()=>{
  domLoaded = true;
  populateMenu();
});

if(typeof window.Twitch !== 'undefined'){
  window.Twitch.ext.onAuthorized((auth)=>{
    console.log('Channel ID: ',auth.channelId);
    console.log('Client ID: ',auth.clientId);
    console.log('Token: ',auth.token);
    console.log('User ID: ',auth.userId);
    token = auth.token;
  });

  window.Twitch.ext.configuration.onChanged(()=>{
    console.log("Broadcaster config: ",window.Twitch.ext.configuration.broadcaster);
    console.log("Global config: ",window.Twitch.ext.configuration.global);
    console.log("Developer config: ",window.Twitch.ext.configuration.developer);

    config = JSON.parse(window.Twitch.ext.configuration.global.content);

    if(typeof window.Twitch.ext.configuration.broadcaster !== 'undefined'){
      config = JSON.parse(window.Twitch.ext.configuration.broadcaster.content);
    }

    if(domLoaded){
      populateMenu();
    }
  });

  window.Twitch.ext.listen("broadcast",function (target,contentType,message){
    try {
        message = JSON.parse(message);
    } catch (e) {
        // this accounts for JSON parse errors
        // just in case
        return;
    }

    console.log(message);

    // check that it's the exepected event
    if (message.event == 'configure') {
        try{
          console.log(message.data);
          config = JSON.parse(message.data);
          console.log("New config: ",config);
          if(domLoaded){
            populateMenu();
          }
        } catch(e){
          console.log(e);
          return;
        }
    }
  });
}
