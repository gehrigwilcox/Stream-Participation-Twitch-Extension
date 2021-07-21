var requestedEvent = "";

function clickEventElement(eventElement){
  if(requestedEvent) return;

  requestedEvent = eventElement.id;

  document.getElementById('selectedEvent').innerHTML = requestedEvent.split("/").pop();

  document.getElementById('checkout').style.display = "flex";

  if(typeof window.Twitch !== 'undefined'){
    //Make sure client is connected
    fetch(verificationServer,{
      method:'GET',
      headers: {
        'x-extension-jwt': token
      }
    }).then((res)=>{
      if(res.ok){
          window.Twitch.ext.bits.useBits(eventElement.cost/10+'Coins');
      }else{
        requestedEvent = "";
      }
    });
  }
}


if(typeof window.Twitch !== 'undefined'){
  window.Twitch.ext.bits.onTransactionComplete((transactionObject)=>{
    fetch(verificationServer+"/redeem",{
      method: "POST",
      headers: {
        'x-extension-jwt': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'reciept':transactionObject.transactionReceipt,
        'event': requestedEvent,
        'user': transactionObject.displayName
      })
    });
    requestedEvent = "";
    document.getElementById('checkout').style.display = "none";
  });

  window.Twitch.ext.bits.onTransactionCancelled(()=>{
    requestedEvent = "";
    document.getElementById('checkout').style.display = "none";
  });
}

window.addEventListener('DOMContentLoaded',()=>{
  Twitch.ext.bits.getProducts().then(function(products){});
});
