$(function() {
    initializeSwarmPage();
});

function initializeSwarmPage() {
    if (accountsInitialized) {
        var swarm = swarm.at("http://swarm-gateways.net");
        console.log(bzz.info().then(console.log("HEHE")));
        swarm.download()
        /*const file = "test file"; // could also be an Uint8Array of binary data
        swarm.upload(file, function(_error, _result) {
            console.log("Uploaded file. Address:", _result);
        });*/
        /*bzz.put("test file", function(_error, _result){
            console.log("Error [" + _error + "] Result [" + _result + "]");
        });*/

        /*bzz.upload("Something", function(_error, _result){
            console.log("Error [" + _error + "] Result [" + _result + "]");
        });*/
    } else {
        setTimeout(function() {
            initializeSwarmPage();
        }, 500);
    }

}