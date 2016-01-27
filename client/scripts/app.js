var uniqueRooms = {};
var makeStrSafe = function(message, type){
  if(message){
    message = message
    .replace(/&/g, '%amp')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/\'/g, '&#39;');
  }
  if(type){
    convertMessage(message);
  } else {
    return message;
  }
}

var url = window.location;
var user = url['search'].substring(url['search'].lastIndexOf('=')+1);
var selectedRoom = '';
$('select').on('change', function(){
  var roomName = '';
  $("select option:selected").each(function(){
    console.log($(this)[0].text);
    if($(this)[0].text === "Add room"){
      roomName = prompt("Enter room name");
      if(!uniqueRooms[roomName]){
        $('select').append('<option value = "' + roomName + '">' + roomName + '</div>');
        uniqueRooms[roomName] = true;
      }
    } else{
      roomName += $(this).text() + '';
    }
  });
  selectedRoom = roomName;
  getNewMessages();
});

var getRooms = function(){
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox/?order=-createdAt',
    type: 'GET',
    contentType: 'application/json',
    success: function (data) {
      console.log(data);
      for(var i = 0; i < data["results"].length; i++){
        var roomName = makeStrSafe(data["results"][i]["roomname"]);
        if(!uniqueRooms[roomName]){
          $('select').append('<option value = "' + roomName + '">' + roomName + '</div>');
        }
        uniqueRooms[roomName] = true;
      } 
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message. Error: ', data.results[0]);
    }
  });
}


var convertMessage =  function(message){
  var newMessage = {
    username: user,
    text: message,
    roomname: selectedRoom
  };
  document.getElementById('textBox').value='';
  postMessage(newMessage);
};

var postMessage = function(message){
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent. Data: ', data);
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message. Error: ', data);
    }
  });
}


var getNewMessages = function(){
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox/?order=-createdAt',
    type: 'GET',
    contentType: 'application/json',
    success: function (data) {
      $('.message').remove();
      for(var i = 0; i < data["results"].length; i++){
        if(makeStrSafe(data["results"][i]["roomname"]) === selectedRoom){ 
          var userName = makeStrSafe(data["results"][i]["username"]);
          var userPost = makeStrSafe(data["results"][i]["text"]);
          $('#messages').append('<div class = "message">' + userName + ": " + userPost + '</div>');
        }
      } 
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message. Error: ', data.results[0]);
    }
  });
}


getRooms();

setInterval(function(){
  getNewMessages();
}, 2000);

