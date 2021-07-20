function clickEventElement(eventElement){
  /*  Fill in fields with event data  */
  document.getElementById("newEventName").innerHTML = eventElement.id;
  document.getElementById("newEventCommand").innerHTML = eventElement.command;
  document.getElementById("newEventCost").value = eventElement.cost;

  /*  Make sure cancel button hides box */
  document.getElementById("cancel").onclick = ()=>{
    document.getElementById("editEvent").style.display = "none";
  };
  /*  Make sure save button removes previous event, removes any duplicate events, and creates new event */
  document.getElementById("saveEvent").onclick = ()=>{
    eventElement.remove();
    try{
      document.getElementById(document.getElementById("newEventName").value).remove();
    }catch(e){}
    createEvent(document.getElementById("newEventName").value,{
      "cost":document.getElementById("newEventCost").value,
      "command":document.getElementById("newEventCommand").value
    });
    document.getElementById("editEvent").style.display = "none";
  };

  /*  Show box  */
  document.getElementById("editEvent").style.display = "block";
}


function getConfig(){
  /*  Get every event */
  var events = document.getElementsByTagName("event");
  var ret = {};
  /*  For every event, place it in the ret object with all associated data  */
  for(element in events){
    /*  For some reason, there are other elements too, so get rid of them */
    if(typeof events[element].command === 'undefined') continue;
    ret[events[element].id] = {
      "cost":events[element].cost,
      "command": events[element].command
    };
  }

  return ret;
}

function saveConfig(){
  var data = JSON.stringify(getConfig());
  console.log("Config: ",data);
  /*  Send config to verification server  */
  fetch(verificationServer+"/config",{
    method: "POST",
    headers: {
      'x-extension-jwt': token,
      'Content-Type': 'application/json'
    },
    body: data
  });
}


window.addEventListener('DOMContentLoaded',()=>{
  /*  Create button to load default config  */
  document.getElementById('loadDefaultConfig').onclick = ()=>{
    if(typeof window.Twitch !== 'undefined'){
      config = JSON.parse(window.Twitch.ext.configuration.global.content);
      populateMenu();
      saveConfig();
    }
  };

});
