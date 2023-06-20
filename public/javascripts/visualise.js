function initialiseVisualisation(cy) {
    var chosenAlgorithm = null;
    var chosenSpeed = null;
    var animationSpeed = null;

    document.getElementById("visualiseBtn").addEventListener("click", function() {

        chosenAlgorithm = getAlgorithm()
        chosenSpeed = getSpeed()

        switch(chosenSpeed) {
            case "fast":
                animationSpeed = 500
                break;
            case "medium":
                animationSpeed = 1000
                break;
            case "slow":
                animationSpeed = 2000
                break;
        }

        switch(chosenAlgorithm) {
            case "kruskal":
                runKruskal(cy, animationSpeed)
                break;
        }
    })

    


}


function getAlgorithm() {
    //retrieve the algorithm chosen by the user
    var algorithmDropdownItems = document.getElementsByClassName("algorithmDropdownItem");
    for (var i = 0; i < algorithmDropdownItems.length; i++) {
        if (algorithmDropdownItems[i].classList.contains("active")) {
            return algorithmDropdownItems[i].getAttribute("data-value")
        }
    }
}

function getSpeed() {
    //retrieve the algorithm chosen by the user
    var speedDropdownItems = document.getElementsByClassName("speedDropdownItem");
    for (var i = 0; i < speedDropdownItems.length; i++) {
        if (speedDropdownItems[i].classList.contains("active")) {
            return speedDropdownItems[i].getAttribute("data-value")
        }
    }
}
    