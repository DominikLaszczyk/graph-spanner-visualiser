function initialiseActions() {
    initialiseActionsCheckbox()

    test()
}

function test() {
    newAction("Action: ", "node 2 attached to node 3");
    newAction("Vipera: ", "Ivanesca");
    newAction("Albus: ", "Percival Wulfric Brian Dumbledore");
    newAction("", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sit amet ultrices orci. Donec vel eros tincidunt, commodo erat eu, varius libero. Nam id lorem metus. Integer pellentesque augue laoreet nibh fringilla pellentesque. Fusce sit amet scelerisque orci, quis varius tellus. Pellentesque sem arcu, faucibus ultrices aliquet eget, vehicula vel ipsum. Suspendisse euismod metus ac dui scelerisque finibus. Fusce accumsan leo et nibh rutrum, et fermentum urna congue. ");
        
    
}

function newAction(strongText, body) {
    var actionsDiv = document.getElementById("chatBoxBody");
    var newAction = null;
    if (strongText.length === 0) {
        newAction = 
        '<div class="chat-box-message">' +
            body +
        '</div>';
    }
    else {
        newAction = 
        '<div class="chat-box-message">' +
            '<strong>' + strongText + '</strong>' + body +
        '</div>';
    }
    

    actionsDiv.innerHTML += newAction
}

function initialiseActionsCheckbox() {
    $(function() {
        var initialBottomOffset = 20;
        var chatBox = $(".chat-box");
    
        // Initialize draggable
        chatBox.draggable({
            axis: "x",
            containment: "window",
            start: function(event, ui) {
                initialBottomOffset = chatBox.offset().bottom;
            },
            stop: function(event, ui) {
                if (initialBottomOffset < ui.offset.bottom) {
                    chatBox.css({ top: 20, bottom: "auto" });
                } else {
                    chatBox.css({ top: "auto", bottom: 20 });
                }
            }
        });
    
        // Toggle collapse when clicking the chat box header
        $(".chat-box-header").click(function() {
            $("#chatBoxBody").collapse("toggle");
        });
    });
}