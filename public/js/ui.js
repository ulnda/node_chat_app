function wrapSimpleContent(message) {
  return $('<div></div>').text(message);
}

function wrapSystemContent(message) {
  return $('<div></div>').html('<i>' + message + '</i>');
}

function processUserInput(chat, socket) {
	var message = $("#send-message").val();
	var systemMessage;

  if (message.charAt(0) == '/') {
    systemMessage = chat.processCommand(message);

    if (systemMessage) {
      $('#messages').append(wrapSystemContent(systemMessage));
    }
  } 
  else {
    chat.sendMessage($('#room h2').text().substr(14), message);
    $('#messages').append(wrapSimpleContent(message));
    $('#messages').scrollTop($('#messages').prop('scrollHeight'));
  }

  $('#send-message').val('');
}

var socket = io.connect();

$(document).ready(function() {
  var chat = new Chat(socket);

  socket.on('name-result', function(result) {
    var message;

    if (result.success) {
      message = 'You are now known as ' + result.name + '.';
    } 
    else {
      message = result.message;
    }
    $('#messages').append(wrapSystemContent(message));
  });

  socket.on('join-result', function(result) {
    $('#room h2').text("Current room: " + result.room);
    $('#messages').append(wrapSystemContent('Room changed.'));
  });

  socket.on('message', function (message) {
    $('#messages').append(wrapSimpleContent(message.text));
  });

  socket.on('rooms', function(rooms) {
    $('#rooms').empty();

    for(var room in rooms) {
      room = room.substring(1, room.length);
      if (room != '') {
        $('#rooms').append(wrapSimpleContent(room));
      }
    }

    $('#rooms div').click(function() {
      chat.processCommand('/join ' + $(this).text());
      $('#send-message').focus();
    });
  });

  setInterval(function() {
    socket.emit('rooms');
  }, 1000);

  $('#send-message').focus();

  $('#send-form').submit(function() {
    processUserInput(chat, socket);
    return false;
  });
});